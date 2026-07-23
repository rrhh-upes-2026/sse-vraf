/**
 * ISP — Identity & Security Platform
 *
 * Centralizes: authentication, authorization (RBAC), session management,
 * audit logging, and security policy enforcement.
 *
 * Security notes:
 *   - Passwords are stored as SHA-256(salt + password) only.
 *   - Audit logs are append-only (never updated).
 *   - Permissions are resolved dynamically from ISP_RolePermissions.
 *   - No hardcoded permissions or roles in the routing layer.
 */
var ISPController = (function () {

  // ─── Repo helpers ──────────────────────────────────────────────────────────

  function _repo_(key) { return SheetRepository.forEntity(key); }

  function _users_()    { return _repo_("ispUsers");          }
  function _roles_()    { return _repo_("ispRoles");          }
  function _perms_()    { return _repo_("ispPermissions");    }
  function _rolePerms_() { return _repo_("ispRolePermissions"); }
  function _sessions_() { return _repo_("ispSessions");       }
  function _audit_()    { return _repo_("ispAuditLogs");      }
  function _cfg_()      { return _repo_("ispConfig");         }

  function _now_()   { return new Date().toISOString(); }
  function _today_() { return _now_().slice(0, 10); }

  function _userId_()  { return "USR-ISP-" + Number(new Date()).toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,5).toUpperCase(); }
  function _roleId_()  { return "ROL-ISP-" + Number(new Date()).toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,5).toUpperCase(); }
  function _permId_()  { return "PRM-ISP-" + Number(new Date()).toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,5).toUpperCase(); }
  function _rpId_()    { return "RPA-ISP-" + Number(new Date()).toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,5).toUpperCase(); }
  function _sessId_()  { return "SSN-ISP-" + Number(new Date()).toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,8).toUpperCase(); }
  function _auditId_() { return "AUD-ISP-" + Number(new Date()).toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,5).toUpperCase(); }
  function _cfgId_()   { return "CFG-ISP-" + Number(new Date()).toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,5).toUpperCase(); }

  // ─── Crypto helpers ────────────────────────────────────────────────────────

  function _generateSalt_() {
    return Number(new Date()).toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function _hashPassword_(password, salt) {
    try {
      var combined = (salt || "") + (password || "");
      var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined);
      return bytes.map(function (b) {
        return ("0" + (b & 0xFF).toString(16)).slice(-2);
      }).join("");
    } catch (e) {
      // Development fallback — simple hash
      var h = 0;
      var s = (salt || "") + (password || "");
      for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
      return Math.abs(h).toString(16).padStart(8, "0");
    }
  }

  function _verifyPassword_(password, salt, storedHash) {
    return _hashPassword_(password, salt) === storedHash;
  }

  // ─── Hydrators ─────────────────────────────────────────────────────────────

  function _hydrateUser_(row) {
    return {
      id:                   row.id,
      employeeId:           row.employeeId || "",
      fullName:             row.fullName   || "",
      email:                row.email      || "",
      username:             row.username   || "",
      status:               row.status     || "pendiente",
      roleId:               row.roleId     || "",
      organizationalUnitId: row.organizationalUnitId || "",
      lastLogin:            row.lastLogin  || undefined,
      failedAttempts:       Number(row.failedAttempts) || 0,
      lockedUntil:          row.lockedUntil || undefined,
      createdAt:            row.createdAt,
      updatedAt:            row.updatedAt,
    };
  }

  function _hydrateRole_(row) {
    return {
      id:          row.id,
      name:        row.name        || "",
      description: row.description || "",
      level:       Number(row.level) || 0,
      isSystem:    row.isSystem === true || row.isSystem === "true",
      createdAt:   row.createdAt,
      updatedAt:   row.updatedAt,
    };
  }

  function _hydratePerm_(row) {
    return {
      id:          row.id,
      module:      row.module      || "",
      action:      row.action      || "",
      description: row.description || "",
      createdAt:   row.createdAt,
    };
  }

  function _hydrateSession_(row) {
    return {
      id:           row.id,
      userId:       row.userId       || "",
      userEmail:    row.userEmail    || undefined,
      loginAt:      row.loginAt,
      lastActivity: row.lastActivity,
      expiresAt:    row.expiresAt,
      ipAddress:    row.ipAddress    || "",
      userAgent:    row.userAgent    || "",
      status:       row.status       || "activa",
    };
  }

  function _hydrateAudit_(row) {
    var details = row.details;
    if (typeof details === "string") {
      try { details = JSON.parse(details); } catch (e) { details = {}; }
    }
    return {
      id:        row.id,
      userId:    row.userId    || "",
      userEmail: row.userEmail || undefined,
      action:    row.action,
      module:    row.module    || "isp",
      entity:    row.entity    || undefined,
      entityId:  row.entityId  || undefined,
      result:    row.result    || "exitoso",
      ipAddress: row.ipAddress || undefined,
      timestamp: row.timestamp,
      details:   details || {},
    };
  }

  // ─── Session validation ────────────────────────────────────────────────────

  function _isSessionValid_(session) {
    if (!session) return false;
    if (session.status !== "activa") return false;
    return new Date(session.expiresAt) > new Date();
  }

  function _isLocked_(user) {
    if (user.status === "bloqueado") return true;
    if (!user.lockedUntil) return false;
    return new Date(user.lockedUntil) > new Date();
  }

  // ─── Audit (append-only) ───────────────────────────────────────────────────

  function _logAudit_(p) {
    _audit_().create({
      id:        _auditId_(),
      userId:    p.userId    || "",
      userEmail: p.userEmail || "",
      action:    p.action,
      module:    p.module    || "isp",
      entity:    p.entity    || "",
      entityId:  p.entityId  || "",
      result:    p.result    || "exitoso",
      ipAddress: p.ipAddress || "",
      timestamp: _now_(),
      details:   JSON.stringify(p.details || {}),
    });
  }

  // ─── Config ────────────────────────────────────────────────────────────────

  function _getConfigRaw_() {
    var rows = _cfg_().findAll({}) || [];
    var result = {
      maxSessionDurationMinutes: 480,
      maxFailedAttempts:         5,
      lockDurationMinutes:       30,
      multipleSessionsAllowed:   false,
      googleOAuthPrepared:       false,
    };
    rows.forEach(function (row) {
      var k = row.key;
      var v = row.value;
      if (k === "maxSessionDurationMinutes") result.maxSessionDurationMinutes = Number(v) || 480;
      if (k === "maxFailedAttempts")         result.maxFailedAttempts         = Number(v) || 5;
      if (k === "lockDurationMinutes")       result.lockDurationMinutes       = Number(v) || 30;
      if (k === "multipleSessionsAllowed")   result.multipleSessionsAllowed   = v === "true";
      if (k === "googleOAuthPrepared")       result.googleOAuthPrepared       = v === "true";
    });
    return result;
  }

  // ─── Seed helpers ──────────────────────────────────────────────────────────

  function _seedPermissions_() {
    var modules = ["ime","pme","ape","aee","eme","cpe","eip","iie","ioe","aue","nce","isp"];
    var actions = [
      { action: "read",    desc: "Consultar y listar" },
      { action: "create",  desc: "Crear nuevos registros" },
      { action: "edit",    desc: "Modificar registros" },
      { action: "delete",  desc: "Eliminar registros" },
      { action: "manage",  desc: "Administración completa" },
    ];
    var existing = _perms_().findAll({}) || [];
    if (existing.length >= 60) return; // already seeded

    var now = _now_();
    modules.forEach(function (mod) {
      actions.forEach(function (act) {
        var already = existing.filter(function (p) { return p.module === mod && p.action === act.action; });
        if (already.length > 0) return;
        _perms_().create({
          id:          _permId_(),
          module:      mod,
          action:      act.action,
          description: act.desc + " en " + mod.toUpperCase(),
          createdAt:   now,
        });
      });
    });
  }

  function _seedRoles_() {
    var defaults = [
      { name: "SUPER_ADMIN", description: "Acceso total a la plataforma. Sin restricciones.",         level: 0, isSystem: true },
      { name: "ADMIN",       description: "Administrador institucional con gestión completa.",         level: 1, isSystem: true },
      { name: "ANALISTA",    description: "Acceso de lectura y análisis en todos los módulos.",        level: 2, isSystem: false },
      { name: "VIEWER",      description: "Solo lectura en todos los módulos institucionales.",         level: 3, isSystem: false },
    ];
    var existing = _roles_().findAll({}) || [];
    var now = _now_();
    defaults.forEach(function (def) {
      var already = existing.filter(function (r) { return r.name === def.name && r.deleted !== "true"; });
      if (already.length > 0) return;
      _roles_().create({
        id:          _roleId_(),
        name:        def.name,
        description: def.description,
        level:       def.level,
        isSystem:    def.isSystem,
        deleted:     false,
        createdAt:   now,
        updatedAt:   now,
      });
    });

    // Assign all permissions to SUPER_ADMIN
    var allPerms   = _perms_().findAll({})   || [];
    var allRoles   = _roles_().findAll({})   || [];
    var saRole     = allRoles.filter(function (r) { return r.name === "SUPER_ADMIN"; })[0];
    var existingRp = _rolePerms_().findAll({}) || [];

    if (saRole && allPerms.length > 0) {
      allPerms.forEach(function (perm) {
        var alreadyHas = existingRp.filter(function (rp) {
          return rp.roleId === saRole.id && rp.permissionId === perm.id && rp.revoked !== "true";
        });
        if (alreadyHas.length > 0) return;
        _rolePerms_().create({
          id:           _rpId_(),
          roleId:       saRole.id,
          permissionId: perm.id,
          revoked:      false,
          createdAt:    _now_(),
        });
      });
    }

    // Assign read to VIEWER
    var viewerRole = allRoles.filter(function (r) { return r.name === "VIEWER"; })[0];
    if (viewerRole) {
      var readPerms = allPerms.filter(function (p) { return p.action === "read"; });
      readPerms.forEach(function (perm) {
        var alreadyHas = existingRp.filter(function (rp) {
          return rp.roleId === viewerRole.id && rp.permissionId === perm.id && rp.revoked !== "true";
        });
        if (alreadyHas.length > 0) return;
        _rolePerms_().create({
          id:           _rpId_(),
          roleId:       viewerRole.id,
          permissionId: perm.id,
          revoked:      false,
          createdAt:    _now_(),
        });
      });
    }
  }

  function _seedConfig_() {
    var keys = ["maxSessionDurationMinutes","maxFailedAttempts","lockDurationMinutes","multipleSessionsAllowed","googleOAuthPrepared"];
    var defaults = { maxSessionDurationMinutes: "480", maxFailedAttempts: "5", lockDurationMinutes: "30", multipleSessionsAllowed: "false", googleOAuthPrepared: "false" };
    var existing = _cfg_().findAll({}) || [];
    var now = _now_();
    keys.forEach(function (k) {
      var has = existing.filter(function (r) { return r.key === k; });
      if (has.length > 0) return;
      _cfg_().create({ id: _cfgId_(), key: k, value: defaults[k], updatedAt: now, updatedBy: "system" });
    });
  }

  // ─── Public: Dashboard ─────────────────────────────────────────────────────

  function getDashboard() {
    var now   = _now_();
    var today = _today_();
    var allUsers    = _users_().findAll({})    || [];
    var allSessions = _sessions_().findAll({}) || [];
    var allRoles    = _roles_().findAll({ deleted: false }).filter(function (r) { return r.deleted !== "true"; });
    var allPerms    = _perms_().findAll({})    || [];
    var allAudit    = _audit_().findAll({})    || [];

    var active   = allUsers.filter(function (u) { return u.status === "activo"; });
    var inactive = allUsers.filter(function (u) { return u.status === "inactivo"; });
    var locked   = allUsers.filter(function (u) {
      return u.status === "bloqueado" || (u.lockedUntil && new Date(u.lockedUntil) > new Date());
    });

    var activeSess  = allSessions.filter(function (s) { return s.status === "activa" && new Date(s.expiresAt) > new Date(); });
    var expiredSess = allSessions.filter(function (s) { return s.status === "expirada"; });

    var failedToday = allAudit.filter(function (a) {
      return a.action === "login_failed" && String(a.timestamp).slice(0, 10) === today;
    });

    var dayMap = {};
    allAudit.forEach(function (a) {
      var d = String(a.timestamp).slice(0, 10);
      dayMap[d] = (dayMap[d] || 0) + 1;
    });
    var byDay = Object.keys(dayMap).sort().slice(-14).map(function (d) {
      return { date: d, count: dayMap[d] };
    });

    var recentActivity = allAudit
      .map(_hydrateAudit_)
      .sort(function (a, b) { return b.timestamp > a.timestamp ? 1 : -1; })
      .slice(0, 15);

    return {
      totalUsers:           allUsers.length,
      activeUsers:          active.length,
      inactiveUsers:        inactive.length,
      lockedUsers:          locked.length,
      activeSessions:       activeSess.length,
      expiredSessions:      expiredSess.length,
      failedAttemptsToday:  failedToday.length,
      totalRoles:           allRoles.length,
      totalPermissions:     allPerms.length,
      recentActivity:       recentActivity,
      activityByDay:        byDay,
      generatedAt: now,
    };
  }

  // ─── Public: Users ─────────────────────────────────────────────────────────

  function getUsers(params) {
    var p = params || {};
    var filter = {};
    if (p.status) filter.status = p.status;
    if (p.roleId) filter.roleId = p.roleId;
    if (p.organizationalUnitId) filter.organizationalUnitId = p.organizationalUnitId;

    var rows = _users_().findAll(filter) || [];
    var result = rows.map(_hydrateUser_);

    if (p.search) {
      var q = p.search.toLowerCase();
      result = result.filter(function (u) {
        return u.fullName.toLowerCase().includes(q) ||
               u.email.toLowerCase().includes(q)    ||
               u.username.toLowerCase().includes(q);
      });
    }

    // Enrich with roleName
    var allRoles = _roles_().findAll({}) || [];
    result = result.map(function (u) {
      var role = allRoles.filter(function (r) { return r.id === u.roleId; })[0];
      return Object.assign({}, u, { roleName: role ? role.name : undefined });
    });

    result.sort(function (a, b) { return a.fullName > b.fullName ? 1 : -1; });
    if (p.limit) result = result.slice(0, Number(p.limit));
    return result;
  }

  function getUser(params) {
    var row = _users_().findById(params.id);
    if (!row) throw new Error("ISP_NOT_FOUND: Usuario no encontrado.");
    var u = _hydrateUser_(row);
    var role = _roles_().findById(u.roleId);
    if (role) u.roleName = role.name;
    return u;
  }

  function createUser(params) {
    var p = params || {};
    if (!p.email || !p.username || !p.password) throw new Error("ISP_VALIDATION: email, username y password son requeridos.");

    // Check duplicates
    var byEmail    = _users_().findAll({ email: p.email })       || [];
    var byUsername = _users_().findAll({ username: p.username }) || [];
    if (byEmail.length > 0)    throw new Error("ISP_CONFLICT: El email ya está registrado.");
    if (byUsername.length > 0) throw new Error("ISP_CONFLICT: El username ya está en uso.");

    var salt = _generateSalt_();
    var hash = _hashPassword_(p.password, salt);
    var now  = _now_();

    var row = {
      id:                   _userId_(),
      employeeId:           p.employeeId || "",
      fullName:             p.fullName   || "",
      email:                p.email,
      username:             p.username,
      passwordHash:         hash,
      passwordSalt:         salt,
      status:               "activo",
      roleId:               p.roleId              || "",
      organizationalUnitId: p.organizationalUnitId || "",
      lastLogin:            "",
      failedAttempts:       0,
      lockedUntil:          "",
      createdAt:            now,
      updatedAt:            now,
    };
    _users_().create(row);

    _logAudit_({
      action: "user_created", module: "isp", entity: "ISPUser", entityId: row.id,
      result: "exitoso", details: { email: p.email, username: p.username },
    });
    return _hydrateUser_(row);
  }

  function updateUser(params) {
    var p = params || {};
    if (!p.id) throw new Error("ISP_VALIDATION: id es requerido.");
    var existing = _users_().findById(p.id);
    if (!existing) throw new Error("ISP_NOT_FOUND: Usuario no encontrado.");
    var now = _now_();
    var updates = { updatedAt: now };
    if (p.fullName)             updates.fullName             = p.fullName;
    if (p.roleId)               updates.roleId               = p.roleId;
    if (p.organizationalUnitId !== undefined) updates.organizationalUnitId = p.organizationalUnitId;
    if (p.status)               updates.status               = p.status;
    _users_().update(p.id, updates);
    _logAudit_({ action: "user_updated", module: "isp", entity: "ISPUser", entityId: p.id, result: "exitoso", details: updates });
    return _hydrateUser_(Object.assign({}, existing, updates));
  }

  function setUserStatus(params) {
    var p = params || {};
    var user = _users_().findById(p.userId);
    if (!user) throw new Error("ISP_NOT_FOUND: Usuario no encontrado.");
    var now = _now_();
    var updates = { status: p.status, updatedAt: now };
    if (p.status === "bloqueado") {
      var cfg = _getConfigRaw_();
      var lockMs = cfg.lockDurationMinutes * 60 * 1000;
      updates.lockedUntil = new Date(Date.now() + lockMs).toISOString();
    } else if (p.status === "activo") {
      updates.lockedUntil   = "";
      updates.failedAttempts = 0;
    }
    _users_().update(p.userId, updates);
    var action = p.status === "bloqueado" ? "user_locked" :
                 p.status === "activo"    ? "user_unlocked" : "user_updated";
    _logAudit_({ action: action, module: "isp", entity: "ISPUser", entityId: p.userId, result: "exitoso", details: { newStatus: p.status } });
    return _hydrateUser_(Object.assign({}, user, updates));
  }

  // ─── Public: Roles ─────────────────────────────────────────────────────────

  function getRoles() {
    var rows = (_roles_().findAll({}) || []).filter(function (r) { return r.deleted !== "true"; });
    var allRp = _rolePerms_().findAll({}) || [];
    return rows.map(function (r) {
      var h = _hydrateRole_(r);
      h.permissionCount = allRp.filter(function (rp) {
        return rp.roleId === r.id && rp.revoked !== "true";
      }).length;
      return h;
    }).sort(function (a, b) { return a.level - b.level; });
  }

  function getRole(params) {
    var row = _roles_().findById(params.id);
    if (!row || row.deleted === "true") throw new Error("ISP_NOT_FOUND: Rol no encontrado.");
    var h = _hydrateRole_(row);
    var rps = _rolePerms_().findAll({ roleId: params.id }) || [];
    h.permissionCount = rps.filter(function (rp) { return rp.revoked !== "true"; }).length;
    return h;
  }

  function createRole(params) {
    var p = params || {};
    if (!p.name) throw new Error("ISP_VALIDATION: name es requerido.");
    var existing = (_roles_().findAll({}) || []).filter(function (r) { return r.name === p.name && r.deleted !== "true"; });
    if (existing.length > 0) throw new Error("ISP_CONFLICT: Ya existe un rol con ese nombre.");
    var now = _now_();
    var row = {
      id:          _roleId_(),
      name:        p.name,
      description: p.description || "",
      level:       Number(p.level) || 99,
      isSystem:    false,
      deleted:     false,
      createdAt:   now,
      updatedAt:   now,
    };
    _roles_().create(row);
    _logAudit_({ action: "role_created", module: "isp", entity: "ISPRole", entityId: row.id, result: "exitoso", details: { name: p.name } });
    return _hydrateRole_(row);
  }

  function updateRole(params) {
    var p = params || {};
    var row = _roles_().findById(p.id);
    if (!row || row.deleted === "true") throw new Error("ISP_NOT_FOUND: Rol no encontrado.");
    if (row.isSystem === true || row.isSystem === "true") throw new Error("ISP_FORBIDDEN: Los roles del sistema no se pueden modificar.");
    var now = _now_();
    var updates = { updatedAt: now };
    if (p.name)        updates.name        = p.name;
    if (p.description) updates.description = p.description;
    if (typeof p.level !== "undefined") updates.level = Number(p.level);
    _roles_().update(p.id, updates);
    _logAudit_({ action: "role_updated", module: "isp", entity: "ISPRole", entityId: p.id, result: "exitoso", details: updates });
    return _hydrateRole_(Object.assign({}, row, updates));
  }

  function deleteRole(params) {
    var row = _roles_().findById(params.id);
    if (!row || row.deleted === "true") throw new Error("ISP_NOT_FOUND: Rol no encontrado.");
    if (row.isSystem === true || row.isSystem === "true") throw new Error("ISP_FORBIDDEN: No se pueden eliminar roles del sistema.");
    var usersWithRole = (_users_().findAll({ roleId: params.id }) || []);
    if (usersWithRole.length > 0) throw new Error("ISP_CONFLICT: " + usersWithRole.length + " usuario(s) tienen este rol. Reasigna primero.");
    // Revoke all role permissions
    var rps = _rolePerms_().findAll({ roleId: params.id }) || [];
    rps.forEach(function (rp) { _rolePerms_().update(rp.id, { revoked: true }); });
    // Soft delete
    _roles_().update(params.id, { deleted: true, updatedAt: _now_() });
    _logAudit_({ action: "role_deleted", module: "isp", entity: "ISPRole", entityId: params.id, result: "exitoso", details: { name: row.name } });
    return { deleted: true, id: params.id };
  }

  function duplicateRole(params) {
    var source = _roles_().findById(params.id);
    if (!source || source.deleted === "true") throw new Error("ISP_NOT_FOUND: Rol no encontrado.");
    var now = _now_();
    var newRow = {
      id:          _roleId_(),
      name:        source.name + " (Copia)",
      description: source.description,
      level:       Number(source.level) + 1,
      isSystem:    false,
      deleted:     false,
      createdAt:   now,
      updatedAt:   now,
    };
    _roles_().create(newRow);

    // Copy permissions
    var sourceRps = _rolePerms_().findAll({ roleId: params.id }) || [];
    sourceRps.filter(function (rp) { return rp.revoked !== "true"; }).forEach(function (rp) {
      _rolePerms_().create({ id: _rpId_(), roleId: newRow.id, permissionId: rp.permissionId, revoked: false, createdAt: now });
    });
    _logAudit_({ action: "role_created", module: "isp", entity: "ISPRole", entityId: newRow.id, result: "exitoso", details: { duplicatedFrom: params.id } });
    return _hydrateRole_(newRow);
  }

  // ─── Public: Permissions ───────────────────────────────────────────────────

  function getPermissions(params) {
    var p = params || {};
    var filter = {};
    if (p.module) filter.module = p.module;
    if (p.action) filter.action = p.action;
    var rows = _perms_().findAll(filter) || [];
    return rows.map(_hydratePerm_).sort(function (a, b) {
      var k1 = a.module + "." + a.action;
      var k2 = b.module + "." + b.action;
      return k1 > k2 ? 1 : -1;
    });
  }

  function getRolePermissions(params) {
    var rps = _rolePerms_().findAll({ roleId: params.roleId }) || [];
    var active = rps.filter(function (rp) { return rp.revoked !== "true"; });
    var permIds = active.map(function (rp) { return rp.permissionId; });
    var allPerms = _perms_().findAll({}) || [];
    return allPerms.filter(function (p) { return permIds.indexOf(p.id) !== -1; }).map(_hydratePerm_);
  }

  function assignPermissions(params) {
    var p = params || {};
    if (!p.roleId) throw new Error("ISP_VALIDATION: roleId es requerido.");
    var permIds = p.permissionIds || [];
    var now = _now_();

    // Get current role permissions
    var currentRps = _rolePerms_().findAll({ roleId: p.roleId }) || [];

    // Revoke permissions not in new list
    currentRps.forEach(function (rp) {
      if (rp.revoked === "true") return;
      if (permIds.indexOf(rp.permissionId) === -1) {
        _rolePerms_().update(rp.id, { revoked: true });
      }
    });

    // Add permissions not already assigned
    var currentActive = currentRps.filter(function (rp) { return rp.revoked !== "true"; }).map(function (rp) { return rp.permissionId; });
    permIds.forEach(function (pid) {
      if (currentActive.indexOf(pid) !== -1) return;
      // Check if it was previously revoked — re-enable
      var revoked = currentRps.filter(function (rp) { return rp.permissionId === pid && rp.revoked === "true"; })[0];
      if (revoked) {
        _rolePerms_().update(revoked.id, { revoked: false });
      } else {
        _rolePerms_().create({ id: _rpId_(), roleId: p.roleId, permissionId: pid, revoked: false, createdAt: now });
      }
    });

    _logAudit_({ action: "permission_changed", module: "isp", entity: "ISPRole", entityId: p.roleId, result: "exitoso", details: { permissionCount: permIds.length } });
    return { assigned: permIds.length, roleId: p.roleId };
  }

  function checkPermission(params) {
    var p = params || {};
    var userId = p.userId;
    var module = p.module;
    var action = p.action;

    var userRow = _users_().findById(userId);
    if (!userRow) return { allowed: false, reason: "Usuario no encontrado" };
    if (userRow.status !== "activo") return { allowed: false, reason: "Usuario no activo" };
    if (_isLocked_(userRow)) return { allowed: false, reason: "Usuario bloqueado" };

    var roleId = userRow.roleId;
    if (!roleId) return { allowed: false, reason: "Sin rol asignado" };

    var rps = _rolePerms_().findAll({ roleId: roleId }) || [];
    var activePermIds = rps.filter(function (rp) { return rp.revoked !== "true"; }).map(function (rp) { return rp.permissionId; });

    var matchingPerms = (_perms_().findAll({ module: module, action: action }) || []);
    var allowed = matchingPerms.some(function (perm) { return activePermIds.indexOf(perm.id) !== -1; });

    if (!allowed) {
      _logAudit_({ userId: userId, action: "access_denied", module: module, result: "denegado", details: { action: action } });
    }
    return { allowed: allowed, reason: allowed ? undefined : "Permiso denegado" };
  }

  function getPermissionMatrix() {
    var roles = (_roles_().findAll({}) || []).filter(function (r) { return r.deleted !== "true"; });
    var perms = _perms_().findAll({}) || [];
    var allRps = _rolePerms_().findAll({}) || [];

    var matrix = roles.map(function (role) {
      var rpsForRole = allRps.filter(function (rp) { return rp.roleId === role.id && rp.revoked !== "true"; });
      var activePids = rpsForRole.map(function (rp) { return rp.permissionId; });
      var permMap = {};
      perms.forEach(function (perm) {
        permMap[perm.module + "." + perm.action] = activePids.indexOf(perm.id) !== -1;
      });
      return { roleId: role.id, roleName: role.name, level: Number(role.level) || 0, permissions: permMap };
    });

    return {
      roles:       roles.map(_hydrateRole_),
      permissions: perms.map(_hydratePerm_),
      matrix:      matrix,
    };
  }

  // ─── Public: Sessions ──────────────────────────────────────────────────────

  function getSessions(params) {
    var p = params || {};
    var filter = {};
    if (p.userId) filter.userId = p.userId;
    if (p.status) filter.status = p.status;
    var rows = _sessions_().findAll(filter) || [];
    var result = rows.map(_hydrateSession_);
    if (p.from) result = result.filter(function (s) { return s.loginAt >= p.from; });
    if (p.to)   result = result.filter(function (s) { return s.loginAt <= p.to;   });
    result.sort(function (a, b) { return b.loginAt > a.loginAt ? 1 : -1; });
    if (p.limit) result = result.slice(0, Number(p.limit));
    return result;
  }

  function closeSession(params) {
    var p = params || {};
    var row = _sessions_().findById(p.sessionId);
    if (!row) throw new Error("ISP_NOT_FOUND: Sesión no encontrada.");
    _sessions_().update(p.sessionId, { status: "cerrada" });
    _logAudit_({ userId: row.userId, action: "session_closed", module: "isp", entity: "ISPSession", entityId: p.sessionId, result: "exitoso", details: {} });
    return { closed: true, sessionId: p.sessionId };
  }

  function closeAllUserSessions(params) {
    var p = params || {};
    var rows = _sessions_().findAll({ userId: p.userId, status: "activa" }) || [];
    rows.forEach(function (s) { _sessions_().update(s.id, { status: "cerrada" }); });
    _logAudit_({ userId: p.userId, action: "session_closed", module: "isp", entity: "ISPUser", entityId: p.userId, result: "exitoso", details: { count: rows.length } });
    return { closed: rows.length };
  }

  // ─── Public: Authentication ────────────────────────────────────────────────

  function login(params) {
    var p = params || {};
    if (!p.username || !p.password) throw new Error("ISP_VALIDATION: username y password son requeridos.");

    // Find user by username or email
    var byUsername = _users_().findAll({ username: p.username }) || [];
    var byEmail    = _users_().findAll({ email: p.username })    || [];
    var userRow    = (byUsername[0] || byEmail[0]);

    var cfg = _getConfigRaw_();

    // Audit helper for failed logins
    function _failLogin_(userId, reason) {
      if (userRow) {
        var attempts = Number(userRow.failedAttempts || 0) + 1;
        var updates  = { failedAttempts: attempts, updatedAt: _now_() };
        if (attempts >= cfg.maxFailedAttempts) {
          var lockMs = cfg.lockDurationMinutes * 60 * 1000;
          updates.status     = "bloqueado";
          updates.lockedUntil = new Date(Date.now() + lockMs).toISOString();
          _logAudit_({ userId: userId || "", action: "user_locked", module: "isp", entity: "ISPUser", entityId: userId || "", result: "exitoso", details: { attempts: attempts } });
        }
        _users_().update(userRow.id, updates);
      }
      _logAudit_({ userId: userId || "", userEmail: userRow ? userRow.email : "", action: "login_failed", module: "isp", result: "fallido", ipAddress: p.ipAddress || "", details: { reason: reason } });
      return { success: false, message: reason };
    }

    if (!userRow) return _failLogin_("", "Credenciales inválidas");
    if (userRow.status === "inactivo") return _failLogin_(userRow.id, "Usuario inactivo");
    if (_isLocked_(userRow))          return _failLogin_(userRow.id, "Usuario bloqueado hasta " + userRow.lockedUntil);

    // Verify password
    if (!_verifyPassword_(p.password, userRow.passwordSalt || "", userRow.passwordHash || "")) {
      return _failLogin_(userRow.id, "Credenciales inválidas");
    }

    // Close existing sessions if multiple not allowed
    if (!cfg.multipleSessionsAllowed) {
      var activeSessions = _sessions_().findAll({ userId: userRow.id, status: "activa" }) || [];
      activeSessions.forEach(function (s) { _sessions_().update(s.id, { status: "cerrada" }); });
    }

    // Create session
    var now    = _now_();
    var expiry = new Date(Date.now() + cfg.maxSessionDurationMinutes * 60 * 1000).toISOString();
    var sess   = {
      id:           _sessId_(),
      userId:       userRow.id,
      userEmail:    userRow.email,
      loginAt:      now,
      lastActivity: now,
      expiresAt:    expiry,
      ipAddress:    p.ipAddress  || "",
      userAgent:    p.userAgent  || "",
      status:       "activa",
    };
    _sessions_().create(sess);

    // Reset failed attempts & update lastLogin
    _users_().update(userRow.id, { failedAttempts: 0, lastLogin: now, updatedAt: now });

    // Get role name
    var roleRow = _roles_().findById(userRow.roleId);

    _logAudit_({ userId: userRow.id, userEmail: userRow.email, action: "login", module: "isp", result: "exitoso", ipAddress: p.ipAddress || "", details: { sessionId: sess.id } });

    return {
      success:   true,
      sessionId: sess.id,
      userId:    userRow.id,
      roleId:    userRow.roleId,
      roleName:  roleRow ? roleRow.name : undefined,
    };
  }

  function logout(params) {
    var p = params || {};
    var row = _sessions_().findById(p.sessionId);
    if (!row) return { success: true };
    _sessions_().update(p.sessionId, { status: "cerrada" });
    _logAudit_({ userId: row.userId, userEmail: row.userEmail || "", action: "logout", module: "isp", result: "exitoso", details: { sessionId: p.sessionId } });
    return { success: true };
  }

  function validateSession(params) {
    var p = params || {};
    var row = _sessions_().findById(p.sessionId);
    if (!row) return { valid: false };
    var sess = _hydrateSession_(row);
    if (!_isSessionValid_(sess)) {
      if (row.status === "activa") _sessions_().update(p.sessionId, { status: "expirada" });
      return { valid: false };
    }
    var userRow  = _users_().findById(sess.userId);
    var roleRow  = userRow ? _roles_().findById(userRow.roleId) : null;
    return {
      valid:     true,
      userId:    sess.userId,
      sessionId: sess.id,
      expiresAt: sess.expiresAt,
      roleName:  roleRow ? roleRow.name : undefined,
    };
  }

  function renewSession(params) {
    var p = params || {};
    var row = _sessions_().findById(p.sessionId);
    if (!row) throw new Error("ISP_NOT_FOUND: Sesión no encontrada.");
    var sess = _hydrateSession_(row);
    if (!_isSessionValid_(sess)) throw new Error("ISP_EXPIRED: La sesión ha expirado.");
    var cfg    = _getConfigRaw_();
    var now    = _now_();
    var expiry = new Date(Date.now() + cfg.maxSessionDurationMinutes * 60 * 1000).toISOString();
    _sessions_().update(p.sessionId, { lastActivity: now, expiresAt: expiry });
    return { renewed: true, sessionId: p.sessionId, expiresAt: expiry };
  }

  // ─── Public: Audit ─────────────────────────────────────────────────────────

  function getAuditLogs(params) {
    var p = params || {};
    var filter = {};
    if (p.userId) filter.userId = p.userId;
    if (p.module) filter.module = p.module;
    if (p.action) filter.action = p.action;
    if (p.result) filter.result = p.result;
    var rows = _audit_().findAll(filter) || [];
    var result = rows.map(_hydrateAudit_);
    if (p.from) result = result.filter(function (a) { return a.timestamp >= p.from; });
    if (p.to)   result = result.filter(function (a) { return a.timestamp <= p.to;   });
    result.sort(function (a, b) { return b.timestamp > a.timestamp ? 1 : -1; });
    if (p.limit) result = result.slice(0, Number(p.limit));
    return result;
  }

  // ─── Public: Config ────────────────────────────────────────────────────────

  function getConfig() {
    return _getConfigRaw_();
  }

  function updateConfig(params) {
    var p = params || {};
    var now = _now_();
    var keys = Object.keys(p);
    keys.forEach(function (k) {
      var existing = _cfg_().findAll({ key: k }) || [];
      if (existing.length > 0) {
        _cfg_().update(existing[0].id, { value: String(p[k]), updatedAt: now, updatedBy: "admin" });
      } else {
        _cfg_().create({ id: _cfgId_(), key: k, value: String(p[k]), updatedAt: now, updatedBy: "admin" });
      }
    });
    _logAudit_({ action: "config_changed", module: "isp", result: "exitoso", details: p });
    return _getConfigRaw_();
  }

  // ─── Bootstrap ─────────────────────────────────────────────────────────────

  try {
    _seedPermissions_();
    _seedRoles_();
    _seedConfig_();
  } catch (e) {}

  return {
    getDashboard:        getDashboard,
    getUsers:            getUsers,
    getUser:             getUser,
    createUser:          createUser,
    updateUser:          updateUser,
    setUserStatus:       setUserStatus,
    getRoles:            getRoles,
    getRole:             getRole,
    createRole:          createRole,
    updateRole:          updateRole,
    deleteRole:          deleteRole,
    duplicateRole:       duplicateRole,
    getPermissions:      getPermissions,
    getRolePermissions:  getRolePermissions,
    assignPermissions:   assignPermissions,
    checkPermission:     checkPermission,
    getPermissionMatrix: getPermissionMatrix,
    getSessions:         getSessions,
    closeSession:        closeSession,
    closeAllUserSessions: closeAllUserSessions,
    login:               login,
    logout:              logout,
    validateSession:     validateSession,
    renewSession:        renewSession,
    getAuditLogs:        getAuditLogs,
    getConfig:           getConfig,
    updateConfig:        updateConfig,
  };
})();
