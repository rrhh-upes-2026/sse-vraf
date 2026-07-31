/**
 * WorkspacePermissions — RBAC role → permission mapping.
 *
 * Role hierarchy (highest to lowest):
 *   ADMINISTRADOR_GENERAL  — platform-wide, all permissions, all workspaces
 *   ADMINISTRADOR_UNIDAD   — full access to their assigned workspace
 *   JEFE_UNIDAD            — manages their workspace
 *   COORDINADOR            — coordination and management tasks
 *   ANALISTA               — analytical work and data recording
 *   USUARIO                — basic operations within a workspace
 *   CONSULTA               — read-only access
 *
 * Backward-compatible aliases (ADMIN, HEAD, OPS, AUDIT) are kept so that
 * existing wsUsers rows written before the role migration continue to work.
 *
 * Permission decisions are role-based only — no email or ID hardcoding.
 */

var ALL_WS_PERMISSIONS = [
  "ws.admin.access",
  "ws.processes.manage",  "ws.processes.read",
  "ws.indicators.manage", "ws.indicators.read",
  "ws.requests.manage",   "ws.requests.create",
  "ws.automations.manage",
  "ws.users.manage",
  "ws.forms.manage",
  "ws.documents.manage",  "ws.documents.upload",  "ws.documents.read",
  "ws.settings.manage",
  "ws.kpis.manage",       "ws.kpis.read",          "ws.kpis.record",
  "ws.reports.manage",
  "ws.dashboards.manage",
  "ws.objectives.manage",
  "ws.procedures.manage",
  "ws.projects.manage",
  "ws.template.export",
  "ws.audit.view",
];

var ROLE_PERMISSIONS = {
  // ── New canonical roles ──────────────────────────────────────────────────────
  ADMINISTRADOR_GENERAL: ALL_WS_PERMISSIONS, // bypass handled in hasPermission

  ADMINISTRADOR_UNIDAD: [
    "ws.admin.access",
    "ws.processes.manage",  "ws.processes.read",
    "ws.indicators.manage", "ws.indicators.read",
    "ws.requests.manage",   "ws.requests.create",
    "ws.automations.manage",
    "ws.users.manage",
    "ws.forms.manage",
    "ws.documents.manage",  "ws.documents.upload",  "ws.documents.read",
    "ws.settings.manage",
    "ws.kpis.manage",       "ws.kpis.read",          "ws.kpis.record",
    "ws.reports.manage",
    "ws.dashboards.manage",
    "ws.objectives.manage",
    "ws.procedures.manage",
    "ws.projects.manage",
    "ws.template.export",
    "ws.audit.view",
  ],

  JEFE_UNIDAD: [
    "ws.admin.access",
    "ws.processes.manage",  "ws.processes.read",
    "ws.indicators.manage", "ws.indicators.read",
    "ws.requests.manage",   "ws.requests.create",
    "ws.automations.manage",
    "ws.forms.manage",
    "ws.documents.manage",  "ws.documents.upload",  "ws.documents.read",
    "ws.kpis.manage",       "ws.kpis.read",          "ws.kpis.record",
    "ws.reports.manage",
    "ws.dashboards.manage",
    "ws.objectives.manage",
    "ws.procedures.manage",
    "ws.projects.manage",
  ],

  COORDINADOR: [
    "ws.admin.access",
    "ws.processes.manage",  "ws.processes.read",
    "ws.indicators.read",
    "ws.requests.manage",   "ws.requests.create",
    "ws.forms.manage",
    "ws.documents.manage",  "ws.documents.upload",  "ws.documents.read",
    "ws.kpis.read",          "ws.kpis.record",
    "ws.reports.manage",
    "ws.dashboards.manage",
    "ws.objectives.manage",
  ],

  ANALISTA: [
    "ws.processes.read",
    "ws.indicators.read",
    "ws.requests.create",
    "ws.documents.upload",  "ws.documents.read",
    "ws.kpis.read",          "ws.kpis.record",
    "ws.dashboards.manage",
  ],

  USUARIO: [
    "ws.processes.read",
    "ws.requests.create",
    "ws.documents.upload",  "ws.documents.read",
    "ws.kpis.record",
  ],

  CONSULTA: [
    "ws.processes.read",
    "ws.indicators.read",
    "ws.kpis.read",
    "ws.documents.read",
  ],

  // ── Backward-compatible aliases ──────────────────────────────────────────────
  ADMIN: ALL_WS_PERMISSIONS,

  HEAD: [
    "ws.admin.access",
    "ws.processes.manage",  "ws.processes.read",
    "ws.indicators.manage", "ws.indicators.read",
    "ws.requests.manage",   "ws.requests.create",
    "ws.automations.manage",
    "ws.users.manage",
    "ws.forms.manage",
    "ws.documents.manage",  "ws.documents.upload",
    "ws.kpis.manage",       "ws.kpis.read",          "ws.kpis.record",
  ],

  ANALYST: [
    "ws.processes.read",
    "ws.indicators.read",
    "ws.kpis.read",          "ws.kpis.record",
    "ws.requests.create",
    "ws.documents.upload",
  ],

  OPS: [
    "ws.processes.read",
    "ws.requests.create",
    "ws.documents.upload",
  ],

  AUDIT: [
    "ws.processes.read",
    "ws.indicators.read",
    "ws.kpis.read",
    "ws.documents.read",
  ],
};

var WorkspacePermissions = {
  /**
   * Resolve the effective role of a user for a given workspace.
   *
   * Look-up order:
   *   1. Platform-level role in `usuarios` table.
   *      - ADMINISTRADOR_GENERAL → access any workspace, return that role.
   *      - ADMINISTRADOR_UNIDAD  → access their own workspace, return that role.
   *   2. Workspace-specific role in `wsUsers` table.
   *
   * @param {string} wsId
   * @param {string} userEmail
   * @returns {string|null}
   */
  getUserRole: function (wsId, userEmail) {
    if (!wsId || !userEmail) return null;

    // 1. Check platform-level role first
    try {
      var userResult = listEntities_("usuarios", { email: userEmail });
      var userItems  = userResult && userResult.items || [];
      for (var j = 0; j < userItems.length; j++) {
        var u = userItems[j];
        if (u.email === userEmail && u.activo !== false && u.activo !== "false" && !u.deletedAt) {
          var platformRole = u.rol || null;
          // ADMINISTRADOR_GENERAL spans all workspaces
          if (platformRole === "ADMINISTRADOR_GENERAL") return "ADMINISTRADOR_GENERAL";
          // ADMINISTRADOR_UNIDAD has access to their assigned workspace
          if (platformRole === "ADMINISTRADOR_UNIDAD" && u.unidadId === wsId) return "ADMINISTRADOR_UNIDAD";
          break;
        }
      }
    } catch (e) {
      AppLogger.warn("WorkspacePermissions.getUserRole: platform lookup failed", { error: String(e.message || e) });
    }

    // 2. Workspace-specific role
    var result = listEntities_("wsUsers", { wsId: wsId, email: userEmail });
    var items  = result && result.items || [];
    for (var i = 0; i < items.length; i++) {
      var wu = items[i];
      if (wu.email === userEmail && wu.activo !== "false" && !wu.deletedAt) {
        return wu.rol || null;
      }
    }
    return null;
  },

  /**
   * Check whether a role has a given permission.
   * ADMINISTRADOR_GENERAL always returns true (platform-wide bypass).
   *
   * @param {string} role
   * @param {string} permission
   * @returns {boolean}
   */
  hasPermission: function (role, permission) {
    if (!role) return false;
    // Platform-wide bypass for global admin
    if (role === "ADMINISTRADOR_GENERAL" || role === "ADMIN") return true;
    var perms = ROLE_PERMISSIONS[role];
    if (!perms) return false;
    for (var i = 0; i < perms.length; i++) {
      if (perms[i] === permission) return true;
    }
    return false;
  },

  /**
   * Throw unless the acting user has the given permission in the workspace.
   *
   * @param {string} wsId
   * @param {string} userEmail
   * @param {string} permission
   */
  requirePermission: function (wsId, userEmail, permission) {
    var role = WorkspacePermissions.getUserRole(wsId, userEmail);
    if (!WorkspacePermissions.hasPermission(role, permission)) {
      var err = new Error("Forbidden: " + userEmail + " lacks " + permission + " in workspace " + wsId);
      err.code = "FORBIDDEN";
      throw err;
    }
  },

  /**
   * Return all permissions for a role, or [] if unknown.
   *
   * @param {string} role
   * @returns {string[]}
   */
  permissionsForRole: function (role) {
    if (role === "ADMINISTRADOR_GENERAL" || role === "ADMIN") return ALL_WS_PERMISSIONS;
    return ROLE_PERMISSIONS[role] || [];
  },
};
