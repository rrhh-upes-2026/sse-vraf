/**
 * GWP — Google Workspace Integration Platform
 *
 * Sole gateway for all Google API communication. Five adapters:
 *   GoogleIdentityAdapter_ — OAuth 2.0 (login, refresh, revoke)
 *   GoogleDriveAdapter_    — Drive file operations
 *   GoogleMailAdapter_     — Gmail send/reply
 *   GoogleCalendarAdapter_ — Calendar CRUD + availability
 *   GoogleChatAdapter_     — Chat messages and cards
 *
 * Token storage: XOR-obfuscated with the Script ID as key, then base64.
 * This is NOT production-grade encryption — use KMS/AES for real deployments.
 * CSRF state tokens are stored in PropertiesService (server-only).
 */
var GWPController = (function () {

  // ─── Repos ──────────────────────────────────────────────────────────────────
  function _tokens_()   { return SheetRepository.forEntity("gwpOAuthTokens"); }
  function _cfg_()      { return SheetRepository.forEntity("gwpConfig"); }
  function _mailLog_()  { return SheetRepository.forEntity("gwpMailLog"); }
  function _driveLog_() { return SheetRepository.forEntity("gwpDriveMetadata"); }
  function _calLog_()   { return SheetRepository.forEntity("gwpCalendarEvents"); }
  function _chatLog_()  { return SheetRepository.forEntity("gwpChatLog"); }
  function _auditLog_() { return SheetRepository.forEntity("gwpAuditLog"); }

  // ─── Token obfuscation ──────────────────────────────────────────────────────
  function _obfuscate_(text) {
    if (!text) return "";
    try {
      var key   = ScriptApp.getScriptId();
      var bytes = [];
      for (var i = 0; i < text.length; i++) {
        bytes.push((text.charCodeAt(i) ^ key.charCodeAt(i % key.length)) & 0xff);
      }
      return Utilities.base64Encode(bytes);
    } catch (e) {
      return Utilities.base64Encode(text);
    }
  }

  function _deobfuscate_(encoded) {
    if (!encoded) return "";
    try {
      var key     = ScriptApp.getScriptId();
      var decoded = Utilities.base64Decode(encoded);
      var result  = "";
      for (var i = 0; i < decoded.length; i++) {
        result += String.fromCharCode((decoded[i] ^ key.charCodeAt(i % key.length)) & 0xff);
      }
      return result;
    } catch (e) {
      return "";
    }
  }

  // ─── Config helpers ─────────────────────────────────────────────────────────
  function _getConfigValue_(key) {
    try {
      var rows = _cfg_().list({ key: key });
      if (!rows || rows.length === 0) return "";
      var row = rows[0];
      return (row.isSecret === "true" || row.isSecret === true)
        ? _deobfuscate_(row.value)
        : (row.value || "");
    } catch (e) { return ""; }
  }

  function _setConfigValue_(key, value, isSecret) {
    try {
      var rows = _cfg_().list({ key: key });
      var stored = isSecret ? _obfuscate_(value) : (value || "");
      var payload = {
        key:       key,
        value:     stored,
        isSecret:  isSecret ? "true" : "false",
        updatedAt: new Date().toISOString(),
      };
      if (rows && rows.length > 0) {
        _cfg_().update(rows[0].id, payload);
      } else {
        payload.id        = IdGen.uuid();
        payload.createdAt = new Date().toISOString();
        _cfg_().create(payload);
      }
    } catch (e) {}
  }

  function _getOAuthConfig_() {
    return {
      clientId:        _getConfigValue_("clientId"),
      clientSecret:    _getConfigValue_("clientSecret"),
      redirectUri:     _getConfigValue_("redirectUri"),
      scopes:          (_getConfigValue_("scopes") || "").split(",").filter(Boolean),
      workspaceDomain: _getConfigValue_("workspaceDomain"),
      adminEmail:      _getConfigValue_("adminEmail"),
      connectionStatus: _getConfigValue_("connectionStatus") || "disconnected",
    };
  }

  // ─── Token management ───────────────────────────────────────────────────────
  function _storeTokens_(userId, userEmail, accessToken, refreshToken, expiresAt, scope) {
    var payload = {
      userId:           userId,
      userEmail:        userEmail,
      accessTokenHash:  _obfuscate_(accessToken),
      refreshTokenHash: _obfuscate_(refreshToken),
      expiresAt:        expiresAt,
      scope:            scope || "",
      tokenType:        "Bearer",
      updatedAt:        new Date().toISOString(),
    };
    try {
      var rows = _tokens_().list({ userId: userId });
      if (rows && rows.length > 0) {
        _tokens_().update(rows[0].id, payload);
      } else {
        payload.id        = IdGen.uuid();
        payload.createdAt = new Date().toISOString();
        _tokens_().create(payload);
      }
    } catch (e) {}
  }

  function _getTokenRow_(userId) {
    try {
      var rows = _tokens_().list({ userId: userId });
      return (rows && rows.length > 0) ? rows[0] : null;
    } catch (e) { return null; }
  }

  function _getAccessToken_(userId) {
    var row = _getTokenRow_(userId);
    if (!row) throw new Error("GWP: No token found for userId=" + userId);
    var expiresAt = new Date(row.expiresAt).getTime();
    if (new Date().getTime() >= expiresAt - 60000) {
      return _refreshTokenInternal_(userId, row);
    }
    return _deobfuscate_(row.accessTokenHash);
  }

  function _refreshTokenInternal_(userId, row) {
    var cfg          = _getOAuthConfig_();
    var refreshToken = _deobfuscate_(row.refreshTokenHash);
    if (!refreshToken) throw new Error("GWP: No refresh token for userId=" + userId);
    var resp = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
      method:  "post",
      contentType: "application/x-www-form-urlencoded",
      payload: {
        client_id:     cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: refreshToken,
        grant_type:    "refresh_token",
      },
      muteHttpExceptions: true,
    });
    var data = JSON.parse(resp.getContentText() || "{}");
    if (data.error) throw new Error("GWP token refresh failed: " + (data.error_description || data.error));
    var newToken   = data.access_token;
    var expiresAt  = new Date(new Date().getTime() + (data.expires_in || 3600) * 1000).toISOString();
    _tokens_().update(row.id, {
      accessTokenHash: _obfuscate_(newToken),
      expiresAt:       expiresAt,
      updatedAt:       new Date().toISOString(),
    });
    _gwpAudit_("identity", "refreshToken", userId, "success", {});
    return newToken;
  }

  // ─── CSRF helpers ───────────────────────────────────────────────────────────
  function _generateState_() {
    var state = Utilities.getUuid();
    PropertiesService.getScriptProperties().setProperty("gwp_state_" + state, "1");
    return state;
  }

  function _verifyState_(state) {
    var props = PropertiesService.getScriptProperties();
    var key   = "gwp_state_" + state;
    var valid = props.getProperty(key) === "1";
    if (valid) props.deleteProperty(key);
    return valid;
  }

  // ─── Audit helper ───────────────────────────────────────────────────────────
  function _gwpAudit_(service, action, userId, status, details) {
    try {
      _auditLog_().create({
        id:              IdGen.uuid(),
        service:         service,
        action:          action,
        userId:          userId || "",
        status:          status,
        requestSummary:  JSON.stringify(details || {}),
        responseSummary: "",
        errorMessage:    status === "error" ? ((details && details.error) || "") : "",
        timestamp:       new Date().toISOString(),
      });
    } catch (e) {}
  }

  // ─── Google Identity Adapter ─────────────────────────────────────────────────
  var GoogleIdentityAdapter_ = {

    getAuthUrl: function (redirectUri) {
      var cfg    = _getOAuthConfig_();
      var state  = _generateState_();
      var scopes = cfg.scopes.length > 0 ? cfg.scopes : [
        "openid", "email", "profile",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/chat.messages",
      ];
      var qs = [
        "client_id="    + encodeURIComponent(cfg.clientId),
        "redirect_uri=" + encodeURIComponent(redirectUri || cfg.redirectUri),
        "response_type=code",
        "scope="        + encodeURIComponent(scopes.join(" ")),
        "access_type=offline",
        "prompt=consent",
        "state="        + encodeURIComponent(state),
      ];
      if (cfg.workspaceDomain) {
        qs.push("hd=" + encodeURIComponent(cfg.workspaceDomain));
      }
      return "https://accounts.google.com/o/oauth2/v2/auth?" + qs.join("&");
    },

    handleCallback: function (code, state, redirectUri) {
      if (!_verifyState_(state)) throw new Error("GWP: Invalid CSRF state parameter");
      var cfg  = _getOAuthConfig_();
      var resp = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
        method:  "post",
        contentType: "application/x-www-form-urlencoded",
        payload: {
          code:          code,
          client_id:     cfg.clientId,
          client_secret: cfg.clientSecret,
          redirect_uri:  redirectUri || cfg.redirectUri,
          grant_type:    "authorization_code",
        },
        muteHttpExceptions: true,
      });
      var data = JSON.parse(resp.getContentText() || "{}");
      if (data.error) throw new Error("GWP OAuth callback error: " + (data.error_description || data.error));

      var userInfo  = GoogleIdentityAdapter_.getUserInfo(data.access_token);
      var expiresAt = new Date(new Date().getTime() + (data.expires_in || 3600) * 1000).toISOString();

      _storeTokens_(userInfo.sub, userInfo.email, data.access_token, data.refresh_token, expiresAt, data.scope || "");
      _setConfigValue_("connectionStatus", "connected",       false);
      _setConfigValue_("connectedUser",    userInfo.email,    false);
      _setConfigValue_("connectedDomain",  userInfo.hd || (userInfo.email || "").split("@")[1] || "", false);
      _gwpAudit_("identity", "login", userInfo.sub, "success", { email: userInfo.email });

      return { success: true, userEmail: userInfo.email, userId: userInfo.sub, scope: data.scope || "" };
    },

    getUserInfo: function (accessToken) {
      var resp = UrlFetchApp.fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers:            { Authorization: "Bearer " + accessToken },
        muteHttpExceptions: true,
      });
      var data = JSON.parse(resp.getContentText() || "{}");
      if (data.error) throw new Error("GWP userinfo error: " + JSON.stringify(data.error));
      return data;
    },

    revokeToken: function (userId) {
      var row = _getTokenRow_(userId);
      if (!row) return { success: true, message: "No token to revoke" };
      try {
        var token = _deobfuscate_(row.accessTokenHash);
        if (token) {
          UrlFetchApp.fetch("https://oauth2.googleapis.com/revoke?token=" + encodeURIComponent(token), {
            method: "post", muteHttpExceptions: true,
          });
        }
      } catch (e) {}
      _tokens_().update(row.id, {
        accessTokenHash:  "",
        refreshTokenHash: "",
        expiresAt:        new Date().toISOString(),
        updatedAt:        new Date().toISOString(),
      });
      _setConfigValue_("connectionStatus", "disconnected", false);
      _setConfigValue_("connectedUser",    "",             false);
      _gwpAudit_("identity", "revoke", userId, "success", {});
      return { success: true };
    },

    getStatus: function (userId) {
      var cfg = _getOAuthConfig_();
      if (cfg.connectionStatus !== "connected") return { connected: false };
      var row = _getTokenRow_(userId);
      if (!row) return { connected: false };
      var connected = new Date(row.expiresAt).getTime() > new Date().getTime();
      return {
        connected:  connected,
        userEmail:  row.userEmail || "",
        domain:     cfg.workspaceDomain || (row.userEmail || "").split("@")[1] || "",
        expiresAt:  row.expiresAt,
        scope:      row.scope || "",
      };
    },
  };

  // ─── Google Drive Adapter ────────────────────────────────────────────────────
  var GoogleDriveAdapter_ = {

    _call_: function (userId, method, path, payload) {
      var token   = _getAccessToken_(userId);
      var options = {
        method:             method,
        headers:            { Authorization: "Bearer " + token, Accept: "application/json" },
        muteHttpExceptions: true,
      };
      if (payload !== null && payload !== undefined && method !== "get" && method !== "delete") {
        options.contentType = "application/json";
        options.payload     = JSON.stringify(payload);
      }
      var resp = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3" + path, options);
      if (resp.getResponseCode() === 204) return { success: true };
      var body = JSON.parse(resp.getContentText() || "{}");
      if (body.error) throw new Error("Drive API: " + (body.error.message || JSON.stringify(body.error)));
      return body;
    },

    createFolder: function (userId, name, parentId) {
      var meta = { name: name, mimeType: "application/vnd.google-apps.folder" };
      if (parentId) meta.parents = [parentId];
      var file = GoogleDriveAdapter_._call_(userId, "post", "/files?fields=id,name,webViewLink,mimeType,modifiedTime", meta);
      _gwpAudit_("drive", "createFolder", userId, "success", { name: name, fileId: file.id });
      return file;
    },

    findFolder: function (userId, name, parentId) {
      var q = "mimeType='application/vnd.google-apps.folder' and name='" + name.replace(/'/g, "\\'") + "' and trashed=false";
      if (parentId) q += " and '" + parentId + "' in parents";
      var result = GoogleDriveAdapter_._call_(userId, "get", "/files?q=" + encodeURIComponent(q) + "&fields=files(id,name,mimeType,webViewLink,modifiedTime)", null);
      return result.files || [];
    },

    getMetadata: function (userId, fileId) {
      return GoogleDriveAdapter_._call_(userId, "get", "/files/" + fileId + "?fields=id,name,mimeType,size,webViewLink,parents,modifiedTime,createdTime,version", null);
    },

    uploadFile: function (userId, name, mimeType, content, parentId) {
      var token    = _getAccessToken_(userId);
      var boundary = "gwp_bound_" + new Date().getTime();
      var metaJson = JSON.stringify({ name: name, parents: parentId ? [parentId] : [] });
      var body     = "--" + boundary + "\r\n"
                   + "Content-Type: application/json\r\n\r\n"
                   + metaJson + "\r\n"
                   + "--" + boundary + "\r\n"
                   + "Content-Type: " + mimeType + "\r\n\r\n"
                   + content + "\r\n"
                   + "--" + boundary + "--";
      var resp = UrlFetchApp.fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType,modifiedTime",
        {
          method:  "post",
          headers: { Authorization: "Bearer " + token, "Content-Type": "multipart/related; boundary=\"" + boundary + "\"" },
          payload: body,
          muteHttpExceptions: true,
        }
      );
      var file = JSON.parse(resp.getContentText() || "{}");
      if (file.error) throw new Error("Drive upload: " + (file.error.message || JSON.stringify(file.error)));
      _gwpAudit_("drive", "uploadFile", userId, "success", { name: name, fileId: file.id });
      return file;
    },

    updateFile: function (userId, fileId, name, mimeType, content) {
      var token = _getAccessToken_(userId);
      var resp  = UrlFetchApp.fetch(
        "https://www.googleapis.com/upload/drive/v3/files/" + fileId + "?uploadType=media&fields=id,name,modifiedTime",
        {
          method:  "patch",
          headers: { Authorization: "Bearer " + token, "Content-Type": mimeType || "text/plain" },
          payload: content || "",
          muteHttpExceptions: true,
        }
      );
      var file = JSON.parse(resp.getContentText() || "{}");
      if (file.error) throw new Error("Drive update: " + (file.error.message || JSON.stringify(file.error)));
      if (name) {
        GoogleDriveAdapter_._call_(userId, "patch", "/files/" + fileId + "?fields=id,name", { name: name });
      }
      _gwpAudit_("drive", "updateFile", userId, "success", { fileId: fileId });
      return file;
    },

    moveFile: function (userId, fileId, newParentId, oldParentId) {
      var qs = "addParents=" + newParentId + (oldParentId ? "&removeParents=" + oldParentId : "") + "&fields=id,name,parents";
      return GoogleDriveAdapter_._call_(userId, "patch", "/files/" + fileId + "?" + qs, {});
    },

    deleteFile: function (userId, fileId) {
      GoogleDriveAdapter_._call_(userId, "delete", "/files/" + fileId, null);
      _gwpAudit_("drive", "deleteFile", userId, "success", { fileId: fileId });
      return { success: true, fileId: fileId };
    },

    shareFile: function (userId, fileId, emailAddress, role) {
      var perm = { type: "user", role: role || "reader", emailAddress: emailAddress };
      var result = GoogleDriveAdapter_._call_(userId, "post", "/files/" + fileId + "/permissions?fields=id,role,type", perm);
      _gwpAudit_("drive", "shareFile", userId, "success", { fileId: fileId, emailAddress: emailAddress, role: role || "reader" });
      return result;
    },

    generateLink: function (userId, fileId) {
      var meta = GoogleDriveAdapter_.getMetadata(userId, fileId);
      return { fileId: fileId, webViewLink: meta.webViewLink || "" };
    },

    listVersions: function (userId, fileId) {
      var result = GoogleDriveAdapter_._call_(userId, "get", "/files/" + fileId + "/revisions?fields=revisions(id,modifiedTime,mimeType,size)", null);
      return result.revisions || [];
    },

    getQuota: function (userId) {
      var result = GoogleDriveAdapter_._call_(userId, "get", "/about?fields=storageQuota", null);
      var q      = result.storageQuota || {};
      return {
        used:         parseInt(q.usage || "0", 10),
        total:        parseInt(q.limit || "0", 10),
        usageInDrive: parseInt(q.usageInDrive || "0", 10),
      };
    },
  };

  // ─── Google Mail Adapter ─────────────────────────────────────────────────────
  var GoogleMailAdapter_ = {

    _buildRaw_: function (to, cc, bcc, subject, htmlBody, attachments, threadId) {
      var boundary = "gwp_mail_" + new Date().getTime();
      var toLine   = Array.isArray(to)  ? to.join(", ")  : (to  || "");
      var ccLine   = Array.isArray(cc)  ? cc.join(", ")  : (cc  || "");
      var bccLine  = Array.isArray(bcc) ? bcc.join(", ") : (bcc || "");
      var subjectB64 = Utilities.base64Encode(subject || "", Utilities.Charset.UTF_8);
      var headers    = "MIME-Version: 1.0\r\nTo: " + toLine + "\r\n";
      if (ccLine)      headers += "Cc: "         + ccLine  + "\r\n";
      if (bccLine)     headers += "Bcc: "        + bccLine + "\r\n";
      if (threadId)    headers += "References: " + threadId + "\r\n";
      headers += "Subject: =?utf-8?B?" + subjectB64 + "?=\r\n";

      var rawBody;
      if (attachments && attachments.length > 0) {
        rawBody  = headers + "Content-Type: multipart/mixed; boundary=\"" + boundary + "\"\r\n\r\n";
        rawBody += "--" + boundary + "\r\nContent-Type: text/html; charset=utf-8\r\n\r\n" + (htmlBody || "") + "\r\n";
        for (var i = 0; i < attachments.length; i++) {
          var att = attachments[i];
          rawBody += "--" + boundary + "\r\n"
                   + "Content-Type: " + (att.mimeType || "application/octet-stream") + "\r\n"
                   + "Content-Disposition: attachment; filename=\"" + att.name + "\"\r\n"
                   + "Content-Transfer-Encoding: base64\r\n\r\n"
                   + att.content + "\r\n";
        }
        rawBody += "--" + boundary + "--";
      } else {
        rawBody = headers + "Content-Type: text/html; charset=utf-8\r\n\r\n" + (htmlBody || "");
      }
      return Utilities.base64Encode(rawBody, Utilities.Charset.UTF_8)
        .replace(/\+/g, "-").replace(/\//g, "_");
    },

    sendMail: function (userId, params) {
      var token   = _getAccessToken_(userId);
      var raw     = GoogleMailAdapter_._buildRaw_(
        params.to, params.cc, params.bcc, params.subject,
        params.htmlBody || ("<p>" + (params.textBody || params.subject || "") + "</p>"),
        params.attachments, params.threadId
      );
      var body = { raw: raw };
      if (params.threadId) body.threadId = params.threadId;

      var resp = UrlFetchApp.fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method:      "post",
        headers:     { Authorization: "Bearer " + token },
        contentType: "application/json",
        payload:     JSON.stringify(body),
        muteHttpExceptions: true,
      });
      var data = JSON.parse(resp.getContentText() || "{}");
      if (data.error) throw new Error("Gmail send: " + (data.error.message || JSON.stringify(data.error)));

      var log = {
        id:              IdGen.uuid(),
        userId:          userId,
        recipients:      JSON.stringify(params.to || []),
        subject:         params.subject || "",
        sentAt:          new Date().toISOString(),
        status:          "sent",
        threadId:        data.threadId || "",
        messageId:       data.id || "",
        attachmentCount: String((params.attachments || []).length),
        priority:        params.priority || "normal",
        createdAt:       new Date().toISOString(),
      };
      _mailLog_().create(log);
      _gwpAudit_("gmail", "sendMail", userId, "success", { to: params.to, subject: params.subject, messageId: data.id });
      return log;
    },

    replyToThread: function (userId, params) {
      return GoogleMailAdapter_.sendMail(userId, params);
    },
  };

  // ─── Google Calendar Adapter ─────────────────────────────────────────────────
  var GoogleCalendarAdapter_ = {

    _call_: function (userId, method, path, payload) {
      var token   = _getAccessToken_(userId);
      var options = {
        method:             method,
        headers:            { Authorization: "Bearer " + token, Accept: "application/json" },
        muteHttpExceptions: true,
      };
      if (payload !== null && payload !== undefined && method !== "get" && method !== "delete") {
        options.contentType = "application/json";
        options.payload     = JSON.stringify(payload);
      }
      var resp = UrlFetchApp.fetch("https://www.googleapis.com/calendar/v3" + path, options);
      if (resp.getResponseCode() === 204) return { success: true };
      var body = JSON.parse(resp.getContentText() || "{}");
      if (body.error) throw new Error("Calendar API: " + (body.error.message || JSON.stringify(body.error)));
      return body;
    },

    createEvent: function (userId, params) {
      var tz      = params.timeZone || "America/El_Salvador";
      var calId   = params.calendarId || "primary";
      var payload = {
        summary:     params.title,
        description: params.description || "",
        start:       { dateTime: params.start, timeZone: tz },
        end:         { dateTime: params.end,   timeZone: tz },
        attendees:   (params.attendees || []).map(function (e) { return { email: e }; }),
        reminders:   params.reminders
          ? { useDefault: false, overrides: params.reminders.map(function (r) { return { method: r.method || "email", minutes: r.minutes }; }) }
          : { useDefault: true },
      };
      var result = GoogleCalendarAdapter_._call_(userId, "post", "/calendars/" + calId + "/events?sendUpdates=all", payload);
      var cached = {
        id:          IdGen.uuid(),
        eventId:     result.id,
        calendarId:  calId,
        userId:      userId,
        title:       params.title,
        startTime:   params.start,
        endTime:     params.end,
        attendees:   JSON.stringify(params.attendees || []),
        status:      result.status || "confirmed",
        description: params.description || "",
        createdAt:   new Date().toISOString(),
      };
      _calLog_().create(cached);
      _gwpAudit_("calendar", "createEvent", userId, "success", { title: params.title, eventId: result.id });
      return result;
    },

    updateEvent: function (userId, eventId, params, calendarId) {
      var tz    = params.timeZone || "America/El_Salvador";
      var patch = {};
      if (params.title)       patch.summary     = params.title;
      if (params.description !== undefined) patch.description = params.description;
      if (params.start)       patch.start       = { dateTime: params.start, timeZone: tz };
      if (params.end)         patch.end         = { dateTime: params.end,   timeZone: tz };
      if (params.attendees)   patch.attendees   = params.attendees.map(function (e) { return { email: e }; });
      var result = GoogleCalendarAdapter_._call_(userId, "patch", "/calendars/" + (calendarId || "primary") + "/events/" + eventId + "?sendUpdates=all", patch);
      _gwpAudit_("calendar", "updateEvent", userId, "success", { eventId: eventId });
      return result;
    },

    deleteEvent: function (userId, eventId, calendarId) {
      GoogleCalendarAdapter_._call_(userId, "delete", "/calendars/" + (calendarId || "primary") + "/events/" + eventId + "?sendUpdates=all", null);
      _gwpAudit_("calendar", "deleteEvent", userId, "success", { eventId: eventId });
      return { success: true, eventId: eventId };
    },

    checkAvailability: function (userId, emails, startTime, endTime) {
      var body = {
        timeMin:  startTime,
        timeMax:  endTime,
        timeZone: "America/El_Salvador",
        items:    emails.map(function (e) { return { id: e }; }),
      };
      var result = GoogleCalendarAdapter_._call_(userId, "post", "/freeBusy", body);
      return result.calendars || {};
    },

    listEvents: function (userId, calendarId, maxResults) {
      var path = "/calendars/" + (calendarId || "primary")
               + "/events?orderBy=startTime&singleEvents=true"
               + "&maxResults=" + (maxResults || 10)
               + "&timeMin=" + encodeURIComponent(new Date().toISOString());
      var result = GoogleCalendarAdapter_._call_(userId, "get", path, null);
      return result.items || [];
    },
  };

  // ─── Google Chat Adapter ─────────────────────────────────────────────────────
  var GoogleChatAdapter_ = {

    _call_: function (userId, method, path, payload) {
      var token   = _getAccessToken_(userId);
      var options = {
        method:             method,
        headers:            { Authorization: "Bearer " + token, Accept: "application/json" },
        muteHttpExceptions: true,
      };
      if (payload !== null && payload !== undefined) {
        options.contentType = "application/json";
        options.payload     = JSON.stringify(payload);
      }
      var resp = UrlFetchApp.fetch("https://chat.googleapis.com/v1" + path, options);
      var body = JSON.parse(resp.getContentText() || "{}");
      if (body.error) throw new Error("Chat API: " + (body.error.message || JSON.stringify(body.error)));
      return body;
    },

    listSpaces: function (userId) {
      var result = GoogleChatAdapter_._call_(userId, "get", "/spaces", null);
      return (result.spaces || []).map(function (s) {
        return { id: s.name, name: s.displayName || s.name, type: s.type || "ROOM" };
      });
    },

    sendMessage: function (userId, spaceId, text, priority) {
      var result = GoogleChatAdapter_._call_(userId, "post", "/spaces/" + spaceId + "/messages", { text: text });
      var log = {
        id:        IdGen.uuid(),
        spaceId:   spaceId,
        spaceName: spaceId,
        message:   text.substring(0, 500),
        sentAt:    new Date().toISOString(),
        userId:    userId,
        status:    "sent",
        messageId: result.name || "",
        priority:  priority || "normal",
        createdAt: new Date().toISOString(),
      };
      _chatLog_().create(log);
      _gwpAudit_("chat", "sendMessage", userId, "success", { spaceId: spaceId });
      return log;
    },

    createCard: function (userId, spaceId, card) {
      var payload = {
        cardsV2: [{
          cardId: "gwp_card_" + new Date().getTime(),
          card: {
            header: { title: card.title, subtitle: card.subtitle || "" },
            sections: (card.sections || []).map(function (s) {
              return {
                header:  s.header,
                widgets: (s.widgets || []).map(function (w) { return { textParagraph: { text: w.text || "" } }; }),
              };
            }),
          },
        }],
      };
      var result = GoogleChatAdapter_._call_(userId, "post", "/spaces/" + spaceId + "/messages", payload);
      _gwpAudit_("chat", "createCard", userId, "success", { spaceId: spaceId, title: card.title });
      return result;
    },

    replyToSpace: function (userId, spaceId, threadKey, text) {
      var payload = { text: text, thread: { threadKey: threadKey } };
      var result  = GoogleChatAdapter_._call_(userId, "post", "/spaces/" + spaceId + "/messages?messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD", payload);
      _gwpAudit_("chat", "replyToSpace", userId, "success", { spaceId: spaceId, threadKey: threadKey });
      return result;
    },

    getStatus: function (userId) {
      try {
        GoogleChatAdapter_.listSpaces(userId);
        return "available";
      } catch (e) {
        return "unavailable";
      }
    },
  };

  // ─── Workspace Service coordinator ───────────────────────────────────────────
  var GoogleWorkspaceService_ = {
    getDashboard: function (userId) {
      var cfg     = _getOAuthConfig_();
      var status  = GoogleIdentityAdapter_.getStatus(userId);
      var dash    = {
        oauthStatus:       status.connected ? "connected" : "disconnected",
        authenticatedUser: status.userEmail || "",
        domain:            status.domain || cfg.workspaceDomain || "",
        driveQuota:        null,
        recentEmails:      [],
        recentEvents:      [],
        chatStatus:        "unavailable",
        generatedAt:       new Date().toISOString(),
      };
      if (status.connected && userId) {
        try { dash.driveQuota = GoogleDriveAdapter_.getQuota(userId); } catch (e) {}
        try {
          var mails = _mailLog_().list({});
          dash.recentEmails = (mails || []).slice(-5).reverse();
        } catch (e) {}
        try { dash.recentEvents = GoogleCalendarAdapter_.listEvents(userId, "primary", 5); } catch (e) {}
        try { dash.chatStatus   = GoogleChatAdapter_.getStatus(userId); }   catch (e) {}
      }
      return dash;
    },
  };

  // ─── Bootstrap ──────────────────────────────────────────────────────────────
  var CONFIG_DEFAULTS = [
    { key: "clientId",        value: "",           isSecret: false },
    { key: "clientSecret",    value: "",           isSecret: true  },
    { key: "redirectUri",     value: "",           isSecret: false },
    { key: "scopes",          value: "openid,email,profile,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/chat.messages", isSecret: false },
    { key: "workspaceDomain", value: "",           isSecret: false },
    { key: "adminEmail",      value: "",           isSecret: false },
    { key: "connectionStatus", value: "disconnected", isSecret: false },
    { key: "connectedUser",   value: "",           isSecret: false },
    { key: "connectedDomain", value: "",           isSecret: false },
  ];

  try {
    var existingKeys = {};
    var cfgRows = _cfg_().list ? _cfg_().list({}) : [];
    (cfgRows || []).forEach(function (r) { existingKeys[r.key] = true; });
    CONFIG_DEFAULTS.forEach(function (d) {
      if (!existingKeys[d.key]) _setConfigValue_(d.key, d.value, d.isSecret);
    });
  } catch (e) {}

  // ─── Public handlers ────────────────────────────────────────────────────────
  return {

    getDashboard: function (params) {
      return GoogleWorkspaceService_.getDashboard((params && params.userId) || "");
    },

    // OAuth
    getAuthUrl: function (params) {
      return { authUrl: GoogleIdentityAdapter_.getAuthUrl(params && params.redirectUri) };
    },

    handleCallback: function (params) {
      return GoogleIdentityAdapter_.handleCallback(params.code, params.state, params.redirectUri);
    },

    getOAuthStatus: function (params) {
      return GoogleIdentityAdapter_.getStatus((params && params.userId) || "");
    },

    revokeToken: function (params) {
      return GoogleIdentityAdapter_.revokeToken(params.userId);
    },

    refreshToken: function (params) {
      var row = _getTokenRow_(params.userId);
      if (!row) throw new Error("GWP: No token for userId=" + params.userId);
      var token = _refreshTokenInternal_(params.userId, row);
      return { success: !!token, userId: params.userId };
    },

    // Config
    getConfig: function () {
      var cfg = _getOAuthConfig_();
      return {
        clientId:         cfg.clientId,
        redirectUri:      cfg.redirectUri,
        scopes:           cfg.scopes,
        workspaceDomain:  cfg.workspaceDomain,
        adminEmail:       cfg.adminEmail,
        connectionStatus: cfg.connectionStatus,
        connectedUser:    _getConfigValue_("connectedUser"),
        connectedDomain:  _getConfigValue_("connectedDomain"),
        // clientSecret NEVER returned to client
      };
    },

    updateConfig: function (params) {
      if (params.clientId)        _setConfigValue_("clientId",        params.clientId,        false);
      if (params.clientSecret)    _setConfigValue_("clientSecret",    params.clientSecret,    true);
      if (params.redirectUri)     _setConfigValue_("redirectUri",     params.redirectUri,     false);
      if (params.scopes) {
        var scopeStr = Array.isArray(params.scopes) ? params.scopes.join(",") : params.scopes;
        _setConfigValue_("scopes", scopeStr, false);
      }
      if (params.workspaceDomain) _setConfigValue_("workspaceDomain", params.workspaceDomain, false);
      if (params.adminEmail)      _setConfigValue_("adminEmail",      params.adminEmail,      false);
      return GWPController.getConfig();
    },

    // Drive
    createFolder:    function (p) { return GoogleDriveAdapter_.createFolder(p.userId, p.name, p.parentId); },
    findFolder:      function (p) { return GoogleDriveAdapter_.findFolder(p.userId, p.name, p.parentId); },
    uploadFile:      function (p) { return GoogleDriveAdapter_.uploadFile(p.userId, p.name, p.mimeType, p.content, p.parentId); },
    updateFile:      function (p) { return GoogleDriveAdapter_.updateFile(p.userId, p.fileId, p.name, p.mimeType, p.content); },
    moveFile:        function (p) { return GoogleDriveAdapter_.moveFile(p.userId, p.fileId, p.newParentId, p.oldParentId); },
    deleteFile:      function (p) { return GoogleDriveAdapter_.deleteFile(p.userId, p.fileId); },
    shareFile:       function (p) { return GoogleDriveAdapter_.shareFile(p.userId, p.fileId, p.emailAddress, p.role); },
    getFileMetadata: function (p) { return GoogleDriveAdapter_.getMetadata(p.userId, p.fileId); },
    generateLink:    function (p) { return GoogleDriveAdapter_.generateLink(p.userId, p.fileId); },
    listVersions:    function (p) { return GoogleDriveAdapter_.listVersions(p.userId, p.fileId); },
    getDriveQuota:   function (p) { return GoogleDriveAdapter_.getQuota(p.userId); },

    // Gmail
    sendMail:       function (p) { return GoogleMailAdapter_.sendMail(p.userId, p); },
    replyToThread:  function (p) { return GoogleMailAdapter_.replyToThread(p.userId, p); },
    getMailLogs:    function (p) {
      try { return _mailLog_().list(p || {}); } catch (e) { return []; }
    },

    // Calendar
    createEvent:       function (p) { return GoogleCalendarAdapter_.createEvent(p.userId, p); },
    updateEvent:       function (p) { return GoogleCalendarAdapter_.updateEvent(p.userId, p.eventId, p, p.calendarId); },
    deleteEvent:       function (p) { return GoogleCalendarAdapter_.deleteEvent(p.userId, p.eventId, p.calendarId); },
    checkAvailability: function (p) { return GoogleCalendarAdapter_.checkAvailability(p.userId, p.emails, p.startTime, p.endTime); },
    listEvents:        function (p) { return GoogleCalendarAdapter_.listEvents(p.userId, p.calendarId, p.maxResults); },

    // Chat
    listSpaces:      function (p) { return GoogleChatAdapter_.listSpaces(p.userId); },
    sendChatMessage: function (p) { return GoogleChatAdapter_.sendMessage(p.userId, p.spaceId, p.text, p.priority); },
    createChatCard:  function (p) { return GoogleChatAdapter_.createCard(p.userId, p.spaceId, p.card); },
    replyToSpace:    function (p) { return GoogleChatAdapter_.replyToSpace(p.userId, p.spaceId, p.threadKey, p.text); },
    getChatLogs:     function (p) {
      try { return _chatLog_().list(p || {}); } catch (e) { return []; }
    },

    // Audit
    getAuditLog: function (p) {
      try { return _auditLog_().list(p || {}); } catch (e) { return []; }
    },
  };
})();
