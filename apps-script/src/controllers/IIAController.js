/**
 * IIAController — Institutional Intelligence Assistant.
 *
 * Architecture (all within GAS global scope):
 *   GeminiAdapter_   → HTTP calls to Gemini generativelanguage API
 *   ContextBuilder_  → gathers institutional context from IIE, GWP, ISP, IOE, NCE
 *   PromptBuilder_   → builds system prompt from templates + context
 *   ResponseParser_  → extracts text and <ACTION> blocks from Gemini response
 *   ConversationManager_ → stores/retrieves conversation history via SheetRepository
 *   GeminiService_   → orchestrates all of the above for a single chat turn
 *
 * Security:
 *   - API key stored obfuscated (XOR + base64); never returned to client.
 *   - No Google credentials, OAuth tokens, or Sheet data sent to Gemini.
 *   - All interactions logged to IIA_AuditLog.
 *   - Context sourced only from peer controllers (ISP, GWP, IIE, IOE, NCE).
 */

var IIAController = (function () {
  "use strict";

  // ─── Obfuscation (same XOR+base64 pattern as GWP) ────────────────────────

  function _obfuscate_(text) {
    var key   = ScriptApp.getScriptId();
    var bytes = [];
    for (var i = 0; i < text.length; i++) {
      bytes.push((text.charCodeAt(i) ^ key.charCodeAt(i % key.length)) & 0xff);
    }
    return Utilities.base64Encode(bytes);
  }

  function _deobfuscate_(enc) {
    var key   = ScriptApp.getScriptId();
    var bytes = Utilities.base64Decode(enc);
    var out   = "";
    for (var i = 0; i < bytes.length; i++) {
      out += String.fromCharCode((bytes[i] ^ key.charCodeAt(i % key.length)) & 0xff);
    }
    return out;
  }

  // ─── Config helpers ───────────────────────────────────────────────────────

  function _cfgRows_() {
    try { return SheetRepository.for("IIA_Config").findAll(); } catch (e) { return []; }
  }

  function _cfgGet_(key, def) {
    var rows = _cfgRows_();
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].key === key) {
        if (rows[i].isSecret === "true" || rows[i].isSecret === true) return null;
        return rows[i].value !== undefined && rows[i].value !== "" ? rows[i].value : def;
      }
    }
    return def;
  }

  function _getApiKey_() {
    var rows = _cfgRows_();
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].key === "apiKey" && (rows[i].isSecret === "true" || rows[i].isSecret === true) && rows[i].value) {
        return _deobfuscate_(String(rows[i].value));
      }
    }
    return null;
  }

  function _cfgSet_(key, value, isSecret, userId) {
    var repo    = SheetRepository.for("IIA_Config");
    var rows    = repo.findAll();
    var now     = new Date().toISOString();
    var stored  = isSecret ? _obfuscate_(String(value)) : String(value);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].key === key) {
        repo.update(rows[i].id, { value: stored, updatedAt: now, updatedBy: userId || "" });
        return;
      }
    }
    repo.create({
      id:        IdGen.entityId("IIA_CFG"),
      key:       key,
      value:     stored,
      isSecret:  isSecret ? "true" : "false",
      updatedAt: now,
      updatedBy: userId || "",
    });
  }

  // ─── GeminiAdapter_ ──────────────────────────────────────────────────────

  var GeminiAdapter_ = {

    generate: function (contents, systemInstruction, overrides) {
      var apiKey = _getApiKey_();
      if (!apiKey) throw new Error("IIA: Gemini API key no configurada. Configure la clave en Configuración → IIA.");

      var model       = String(_cfgGet_("model",       "gemini-1.5-flash"));
      var temperature = parseFloat(_cfgGet_("temperature", "0.7"));
      var maxTokens   = parseInt(_cfgGet_("maxTokens",  "2048"), 10);
      var retries     = parseInt(_cfgGet_("retries",    "2"),    10);

      overrides = overrides || {};
      if (overrides.model)       model       = overrides.model;
      if (overrides.temperature) temperature = overrides.temperature;
      if (overrides.maxTokens)   maxTokens   = overrides.maxTokens;

      var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

      var payload = {
        contents: contents,
        generationConfig: {
          temperature:      temperature,
          maxOutputTokens:  maxTokens,
          topK:             40,
          topP:             0.95,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      };

      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      var lastErr = new Error("Gemini: sin respuesta");
      for (var attempt = 0; attempt <= retries; attempt++) {
        try {
          var resp = UrlFetchApp.fetch(url, {
            method:          "post",
            contentType:     "application/json",
            payload:         JSON.stringify(payload),
            muteHttpExceptions: true,
          });
          var code = resp.getResponseCode();
          var body = resp.getContentText();
          var data = JSON.parse(body);
          if (code !== 200) {
            throw new Error("Gemini HTTP " + code + ": " + ((data.error && data.error.message) || body));
          }
          return { data: data, model: model };
        } catch (e) {
          lastErr = e;
          if (attempt < retries) Utilities.sleep(1000 * (attempt + 1));
        }
      }
      throw lastErr;
    },

    ping: function () {
      var apiKey = _getApiKey_();
      if (!apiKey) return { status: "unavailable", reason: "API key no configurada" };
      try {
        var resp = UrlFetchApp.fetch(
          "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey,
          { muteHttpExceptions: true }
        );
        var code = resp.getResponseCode();
        if (code === 200) return { status: "available" };
        return { status: "degraded", reason: "HTTP " + code };
      } catch (e) {
        return { status: "unavailable", reason: e.message };
      }
    },
  };

  // ─── ContextBuilder_ ─────────────────────────────────────────────────────
  // Gathers institutional context ONLY through peer controllers (no direct Sheet/API access).

  var ContextBuilder_ = {

    build: function (userId, sources) {
      sources = sources || ["isp"];
      var parts = [];
      sources.forEach(function (src) {
        try {
          var fragment = "";
          switch (src) {
            case "isp": fragment = ContextBuilder_._isp_(userId); break;
            case "iie": fragment = ContextBuilder_._iie_(userId); break;
            case "gwp": fragment = ContextBuilder_._gwp_(userId); break;
            case "ioe": fragment = ContextBuilder_._ioe_();       break;
            case "nce": fragment = ContextBuilder_._nce_();       break;
          }
          if (fragment) parts.push(fragment);
        } catch (e) {
          parts.push("[" + src.toUpperCase() + "] contexto no disponible.");
        }
      });
      return parts.join("\n\n");
    },

    _isp_: function (userId) {
      var lines = ["=== ISP (Identidad y Permisos) ==="];
      try {
        if (typeof ISPController !== "undefined" && typeof ISPController.handle === "function") {
          var r = ISPController.handle("getUser", { userId: userId }, { userId: userId });
          if (r && r.data) {
            lines.push("Usuario: " + (r.data.email || userId));
            if (r.data.roles)   lines.push("Roles: " + (Array.isArray(r.data.roles) ? r.data.roles.join(", ") : r.data.roles));
            if (r.data.status)  lines.push("Estado: " + r.data.status);
          } else {
            lines.push("Usuario autenticado: " + userId);
          }
        } else {
          lines.push("Usuario: " + userId);
        }
      } catch (e) {
        lines.push("Usuario: " + userId);
      }
      return lines.join("\n");
    },

    _iie_: function (userId) {
      return "=== IIE (Semántica Institucional) ===\n" +
        "Repositorio semántico de indicadores, procesos, procedimientos, planes de acción y evidencias disponible.\n" +
        "Entidades accesibles: Indicadores KPI, Procesos Institucionales, Evidencias, Riesgos, Alertas.\n" +
        "Solicitante: " + userId;
    },

    _gwp_: function (userId) {
      var lines = ["=== GWP (Google Workspace) ==="];
      try {
        if (typeof GWPController !== "undefined" && typeof GWPController.handle === "function") {
          var r = GWPController.handle("getOAuthStatus", { userId: userId }, { userId: userId });
          if (r && r.data) {
            lines.push("OAuth: " + (r.data.connected ? "conectado" : "desconectado"));
            if (r.data.userEmail)   lines.push("Cuenta Google: " + r.data.userEmail);
            if (r.data.domain)      lines.push("Dominio: " + r.data.domain);
          } else {
            lines.push("Google Workspace integrado (Drive, Gmail, Calendar, Chat).");
          }
        } else {
          lines.push("Google Workspace disponible como servicio.");
        }
      } catch (e) {
        lines.push("Google Workspace: servicio activo.");
      }
      return lines.join("\n");
    },

    _ioe_: function () {
      return "=== IOE (Indicadores y Objetivos Estratégicos) ===\n" +
        "Seguimiento de objetivos estratégicos e indicadores de gestión disponible. " +
        "KPIs institucionales, metas y brechas de cumplimiento accesibles.";
    },

    _nce_: function () {
      return "=== NCE (Notificaciones y Comunicaciones) ===\n" +
        "Motor de notificaciones institucional activo. Plantillas, preferencias y canales configurados.";
    },
  };

  // ─── PromptBuilder_ ──────────────────────────────────────────────────────

  var PROMPT_DEFAULTS_ = {
    institutional:
      "Eres el Asistente Institucional de SSE-VRAF de la Universidad Pedagógica de El Salvador (UPES). " +
      "Tu función es apoyar la gestión institucional respondiendo consultas sobre indicadores, procesos, " +
      "planes estratégicos, riesgos, evidencias, alertas y actividades. " +
      "Eres preciso, profesional y respondes siempre en español formal.",

    executive:
      "Eres el Asistente Ejecutivo de la Vicerrectoría Administrativa y Financiera (UPES). " +
      "Apoyas la toma de decisiones con análisis de alto nivel: KPIs estratégicos, cumplimiento de planes, " +
      "alertas críticas y diagnósticos consolidados. Responde de forma concisa y orientada a decisiones.",

    analytical:
      "Eres un Analista Institucional de SSE-VRAF (UPES). " +
      "Generas análisis detallados sobre procesos institucionales, indicadores de gestión, riesgos identificados, " +
      "oportunidades de mejora y brechas de cumplimiento. Estructura tus respuestas con datos y claridad.",

    operational:
      "Eres el Asistente Operativo de SSE-VRAF (UPES). " +
      "Apoyas con gestión de tareas, actividades, planes de acción y seguimiento operativo diario. " +
      "Eres ágil, preciso y orientado a la acción concreta.",

    administrative:
      "Eres el Asistente Administrativo de SSE-VRAF (UPES). " +
      "Apoyas en gestión documental, notificaciones, comunicaciones institucionales y actividades administrativas. " +
      "Mantienes un tono formal y profesional en todo momento.",
  };

  var PromptBuilder_ = {

    getSystemPrompt: function (promptType, institutionalContext, userId) {
      var base = PromptBuilder_._getTemplate_(promptType);
      return base + "\n\n" +
        "=== CONTEXTO INSTITUCIONAL ===\n" + (institutionalContext || "Contexto institucional no disponible.") + "\n\n" +
        "=== REGLAS OBLIGATORIAS ===\n" +
        "1. Responde EXCLUSIVAMENTE sobre el ecosistema SSE-VRAF e UPES.\n" +
        "2. Nunca inventes datos, cifras ni información que no tengas. Di claramente cuando no sabes algo.\n" +
        "3. NUNCA reveles credenciales, tokens OAuth, API keys, contraseñas ni información sensible.\n" +
        "4. Si el usuario solicita una acción ejecutable, inclúyela al final entre <ACTION>{JSON}</ACTION>.\n" +
        "5. Responde siempre en español formal institucional.\n" +
        "6. Usa markdown para estructurar tu respuesta (# encabezados, **negrita**, - listas, tablas, ```código```).\n" +
        "7. Antes de proponer ejecutar cualquier acción verifica que el usuario tenga permiso RBAC.\n" +
        "8. No accedas directamente a bases de datos, APIs externas, Drive, Gmail ni Calendar directamente.\n" +
        "Usuario activo: " + userId + ".";
    },

    _getTemplate_: function (promptType) {
      try {
        var rows = SheetRepository.for("IIA_PromptTemplates").findAll();
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].type === promptType && rows[i].content) return rows[i].content;
        }
      } catch (e) { /* use default */ }
      return PROMPT_DEFAULTS_[promptType] || PROMPT_DEFAULTS_.institutional;
    },
  };

  // ─── ResponseParser_ ─────────────────────────────────────────────────────

  var ResponseParser_ = {

    parse: function (geminiResult) {
      var data      = geminiResult.data;
      var candidate = data.candidates && data.candidates[0];
      if (!candidate) return { text: "Sin respuesta de Gemini.", actions: [], tokensIn: 0, tokensOut: 0, model: geminiResult.model };

      var rawText = "";
      if (candidate.content && candidate.content.parts) {
        rawText = candidate.content.parts.map(function (p) { return p.text || ""; }).join("");
      }

      var actions   = ResponseParser_._extractActions_(rawText);
      var cleanText = rawText.replace(/<ACTION>[\s\S]*?<\/ACTION>/gi, "").trim();
      var usage     = data.usageMetadata || {};

      return {
        text:      cleanText,
        actions:   actions,
        tokensIn:  usage.promptTokenCount     || 0,
        tokensOut: usage.candidatesTokenCount || 0,
        model:     geminiResult.model,
      };
    },

    _extractActions_: function (text) {
      var actions = [];
      var re      = /<ACTION>([\s\S]*?)<\/ACTION>/gi;
      var match;
      while ((match = re.exec(text)) !== null) {
        try { actions.push(JSON.parse(match[1].trim())); } catch (e) { /* invalid JSON — skip */ }
      }
      return actions;
    },
  };

  // ─── ConversationManager_ ────────────────────────────────────────────────

  var ConversationManager_ = {

    getOrCreate: function (userId, conversationId, firstMsg) {
      var repo = SheetRepository.for("IIA_Conversations");
      if (conversationId) {
        var rows = repo.findAll();
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].id === conversationId && rows[i].userId === userId) return rows[i];
        }
      }
      var now     = new Date().toISOString();
      var expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      var conv = {
        id:           IdGen.entityId("IIA_CONV"),
        userId:       userId,
        title:        String(firstMsg || "Nueva conversación").substring(0, 60),
        messageCount: 0,
        lastMessage:  "",
        createdAt:    now,
        updatedAt:    now,
        expiresAt:    expires,
      };
      repo.create(conv);
      return conv;
    },

    getMessages: function (conversationId, limit) {
      var all  = SheetRepository.for("IIA_Messages").findAll();
      var msgs = all.filter(function (r) { return r.conversationId === conversationId; });
      msgs.sort(function (a, b) { return a.timestamp < b.timestamp ? -1 : 1; });
      return (limit && limit > 0) ? msgs.slice(-limit) : msgs;
    },

    addMessage: function (convId, userId, role, content, tokensIn, tokensOut, latencyMs) {
      var now = new Date().toISOString();
      var msg = {
        id:             IdGen.entityId("IIA_MSG"),
        conversationId: convId,
        userId:         userId,
        role:           role,
        content:        content,
        tokensIn:       tokensIn  || 0,
        tokensOut:      tokensOut || 0,
        latencyMs:      latencyMs || 0,
        timestamp:      now,
      };
      SheetRepository.for("IIA_Messages").create(msg);

      try {
        var convRepo = SheetRepository.for("IIA_Conversations");
        var convRows = convRepo.findAll();
        for (var i = 0; i < convRows.length; i++) {
          if (convRows[i].id === convId) {
            convRepo.update(convRows[i].id, {
              messageCount: (parseInt(convRows[i].messageCount, 10) || 0) + 1,
              lastMessage:  String(content).substring(0, 100),
              updatedAt:    now,
            });
            break;
          }
        }
      } catch (e) { AppLogger.warn("IIA: conv metadata update failed: " + e.message); }

      return msg;
    },

    toGeminiContents: function (messages) {
      return messages
        .filter(function (m) { return m.role !== "system"; })
        .map(function (m) {
          return { role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] };
        });
    },
  };

  // ─── GeminiService_ ──────────────────────────────────────────────────────

  var GeminiService_ = {

    chat: function (userId, conversationId, userMessage, promptType, contextSources) {
      var t0      = new Date().getTime();
      var context = ContextBuilder_.build(userId, contextSources || ["isp"]);
      var sysP    = PromptBuilder_.getSystemPrompt(promptType || "institutional", context, userId);
      var conv    = ConversationManager_.getOrCreate(userId, conversationId, userMessage);
      var history = ConversationManager_.getMessages(conv.id, 20);
      var contents = ConversationManager_.toGeminiContents(history);
      contents.push({ role: "user", parts: [{ text: userMessage }] });

      ConversationManager_.addMessage(conv.id, userId, "user", userMessage, 0, 0, 0);

      var geminiResult, parsed;
      try {
        geminiResult = GeminiAdapter_.generate(contents, sysP, {});
        parsed       = ResponseParser_.parse(geminiResult);
      } catch (e) {
        _audit_(userId, "chat", 0, 0, new Date().getTime() - t0, "", "error", e.message);
        throw e;
      }

      var latencyMs = new Date().getTime() - t0;
      var msg = ConversationManager_.addMessage(
        conv.id, userId, "assistant",
        parsed.text, parsed.tokensIn, parsed.tokensOut, latencyMs
      );
      _audit_(userId, "chat", parsed.tokensIn, parsed.tokensOut, latencyMs, parsed.model, "success", "");

      return {
        conversationId: conv.id,
        messageId:      msg.id,
        response:       parsed.text,
        tokensIn:       parsed.tokensIn,
        tokensOut:      parsed.tokensOut,
        latencyMs:      latencyMs,
        model:          parsed.model,
        actions:        parsed.actions || [],
      };
    },
  };

  // ─── Audit log ────────────────────────────────────────────────────────────

  function _audit_(userId, action, tokensIn, tokensOut, latencyMs, model, status, errorMsg) {
    try {
      SheetRepository.for("IIA_AuditLog").create({
        id:           IdGen.entityId("IIA_AUDIT"),
        userId:       userId    || "",
        action:       action    || "",
        tokensIn:     tokensIn  || 0,
        tokensOut:    tokensOut || 0,
        latencyMs:    latencyMs || 0,
        model:        model     || "",
        status:       status    || "success",
        timestamp:    new Date().toISOString(),
        errorMessage: errorMsg  || "",
      });
    } catch (e) { AppLogger.warn("IIA audit write failed: " + e.message); }
  }

  // ─── Dashboard metrics ────────────────────────────────────────────────────

  function _dashboardMetrics_() {
    var auditRows = [], convRows = [];
    try { auditRows = SheetRepository.for("IIA_AuditLog").findAll();     } catch (e) {}
    try { convRows  = SheetRepository.for("IIA_Conversations").findAll(); } catch (e) {}

    var totalTokensIn = 0, totalTokensOut = 0, totalLatency = 0, errors = 0;
    var now = new Date();

    auditRows.forEach(function (r) {
      if (r.status === "error") errors++;
      totalTokensIn  += parseInt(r.tokensIn,  10) || 0;
      totalTokensOut += parseInt(r.tokensOut, 10) || 0;
      totalLatency   += parseInt(r.latencyMs, 10) || 0;
    });

    var activeConvs = convRows.filter(function (r) {
      return r.expiresAt && new Date(r.expiresAt) > now;
    }).length;

    var ping = GeminiAdapter_.ping();

    return {
      totalQueries:        auditRows.length,
      avgResponseTimeMs:   auditRows.length > 0 ? Math.round(totalLatency / auditRows.length) : 0,
      totalTokensIn:       totalTokensIn,
      totalTokensOut:      totalTokensOut,
      actionsExecuted:     0,
      errors:              errors,
      activeModel:         String(_cfgGet_("model", "gemini-1.5-flash")),
      geminiStatus:        ping.status,
      activeConversations: activeConvs,
      generatedAt:         now.toISOString(),
    };
  }

  // ─── Bootstrap defaults ───────────────────────────────────────────────────

  function _bootstrapDefaults_() {
    var promptRepo = SheetRepository.for("IIA_PromptTemplates");
    var existing   = promptRepo.findAll();
    var now        = new Date().toISOString();

    Object.keys(PROMPT_DEFAULTS_).forEach(function (t) {
      var found = existing.some(function (r) { return r.type === t; });
      if (!found) {
        promptRepo.create({
          id:        IdGen.entityId("IIA_PROMPT"),
          type:      t,
          name:      t.charAt(0).toUpperCase() + t.slice(1),
          content:   PROMPT_DEFAULTS_[t],
          version:   1,
          updatedAt: now,
          updatedBy: "system",
        });
      }
    });

    [
      { key: "model",       value: "gemini-1.5-flash", s: false },
      { key: "temperature", value: "0.7",               s: false },
      { key: "maxTokens",   value: "2048",              s: false },
      { key: "timeout",     value: "30",                s: false },
      { key: "retries",     value: "2",                 s: false },
      { key: "debugMode",   value: "false",             s: false },
    ].forEach(function (d) { _cfgSet_(d.key, d.value, d.s, "system"); });
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  return {

    bootstrap: function () {
      try { _bootstrapDefaults_(); } catch (e) { AppLogger.warn("IIA bootstrap: " + e.message); }
    },

    handle: function (action, params, context) {
      var h = this;
      switch (action) {
        case "chat":               return { data: h.chat(params, context) };
        case "listConversations":  return { data: h.listConversations(params) };
        case "getConversation":    return { data: h.getConversation(params) };
        case "deleteConversation": return { data: h.deleteConversation(params) };
        case "getDashboard":       return { data: h.getDashboard() };
        case "getConfig":          return { data: h.getConfig() };
        case "updateConfig":       return { data: h.updateConfig(params, context) };
        case "listPrompts":        return { data: h.listPrompts() };
        case "updatePrompt":       return { data: h.updatePrompt(params, context) };
        case "getHistory":         return { data: h.getHistory(params) };
        case "checkStatus":        return { data: h.checkStatus() };
        case "clearHistory":       return { data: h.clearHistory() };
        default: throw new Error("IIA: acción desconocida: " + action);
      }
    },

    chat: function (params) {
      return GeminiService_.chat(
        params.userId,
        params.conversationId || null,
        params.message,
        params.promptType     || "institutional",
        params.contextSources || ["isp"]
      );
    },

    listConversations: function (params) {
      var rows   = SheetRepository.for("IIA_Conversations").findAll();
      var limit  = parseInt(params.limit, 10) || 50;
      var uid    = params.userId;
      return rows
        .filter(function (r) { return !uid || r.userId === uid; })
        .sort(function (a, b) { return a.updatedAt > b.updatedAt ? -1 : 1; })
        .slice(0, limit);
    },

    getConversation: function (params) {
      var rows = SheetRepository.for("IIA_Conversations").findAll();
      var conv = null;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].id === params.conversationId) { conv = rows[i]; break; }
      }
      if (!conv) throw new Error("Conversación no encontrada: " + params.conversationId);
      return Object.assign({}, conv, { messages: ConversationManager_.getMessages(params.conversationId, 0) });
    },

    deleteConversation: function (params) {
      var cid      = params.conversationId;
      var convRepo = SheetRepository.for("IIA_Conversations");
      var msgRepo  = SheetRepository.for("IIA_Messages");
      convRepo.remove(cid);
      msgRepo.findAll().forEach(function (m) { if (m.conversationId === cid) msgRepo.remove(m.id); });
      return { deleted: true, id: cid };
    },

    getDashboard: function () {
      return _dashboardMetrics_();
    },

    getConfig: function () {
      var rows = _cfgRows_();
      var cfg  = { model: "gemini-1.5-flash", temperature: 0.7, maxTokens: 2048, timeout: 30, retries: 2, debugMode: false, geminiConfigured: false };
      var hasKey = false;
      rows.forEach(function (r) {
        if (r.key === "apiKey" && r.value) { hasKey = true; return; }
        if (r.isSecret === "true" || r.isSecret === true) return;
        switch (r.key) {
          case "model":       cfg.model       = r.value;                       break;
          case "temperature": cfg.temperature = parseFloat(r.value) || 0.7;   break;
          case "maxTokens":   cfg.maxTokens   = parseInt(r.value, 10) || 2048; break;
          case "timeout":     cfg.timeout     = parseInt(r.value, 10) || 30;   break;
          case "retries":     cfg.retries     = parseInt(r.value, 10) || 2;    break;
          case "debugMode":   cfg.debugMode   = r.value === "true";            break;
        }
      });
      cfg.geminiConfigured = hasKey;
      return cfg;
    },

    updateConfig: function (params, ctx) {
      var uid = (ctx && ctx.userId) || "";
      if (params.apiKey      !== undefined) _cfgSet_("apiKey",       params.apiKey,                  true,  uid);
      if (params.model       !== undefined) _cfgSet_("model",        params.model,                   false, uid);
      if (params.temperature !== undefined) _cfgSet_("temperature",  String(params.temperature),     false, uid);
      if (params.maxTokens   !== undefined) _cfgSet_("maxTokens",    String(params.maxTokens),       false, uid);
      if (params.timeout     !== undefined) _cfgSet_("timeout",      String(params.timeout),         false, uid);
      if (params.retries     !== undefined) _cfgSet_("retries",      String(params.retries),         false, uid);
      if (params.debugMode   !== undefined) _cfgSet_("debugMode",    String(params.debugMode),       false, uid);
      return this.getConfig();
    },

    listPrompts: function () {
      return SheetRepository.for("IIA_PromptTemplates").findAll();
    },

    updatePrompt: function (params, ctx) {
      var repo = SheetRepository.for("IIA_PromptTemplates");
      repo.update(params.id, {
        content:   params.content,
        version:   (parseInt(params.version, 10) || 1) + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: (ctx && ctx.userId) || "",
      });
      return repo.findAll().filter(function (r) { return r.id === params.id; })[0] || { id: params.id };
    },

    getHistory: function (params) {
      var rows   = SheetRepository.for("IIA_AuditLog").findAll();
      var limit  = parseInt(params.limit, 10) || 100;
      var uid    = params.userId;
      var stat   = params.status;
      return rows
        .filter(function (r) {
          if (uid  && r.userId !== uid)  return false;
          if (stat && r.status !== stat) return false;
          return true;
        })
        .sort(function (a, b) { return a.timestamp > b.timestamp ? -1 : 1; })
        .slice(0, limit);
    },

    checkStatus: function () {
      return GeminiAdapter_.ping();
    },

    clearHistory: function () {
      var repo  = SheetRepository.for("IIA_Conversations");
      var rows  = repo.findAll();
      var now   = new Date();
      var count = 0;
      rows.forEach(function (r) {
        if (r.expiresAt && new Date(r.expiresAt) < now) {
          try {
            repo.remove(r.id);
            var msgRepo = SheetRepository.for("IIA_Messages");
            msgRepo.findAll().forEach(function (m) { if (m.conversationId === r.id) msgRepo.remove(m.id); });
            count++;
          } catch (e) {}
        }
      });
      return { cleared: count };
    },
  };
})();
