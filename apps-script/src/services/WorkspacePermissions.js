/**
 * WorkspacePermissions — server-side role → permission mapping.
 *
 * Role names match web/types/workspace-admin.ts WorkspaceUserRole.
 * Permissions are coarse-grained action strings checked in WorkspaceController
 * and the router before any mutating operation on ws* entities.
 *
 * This file deliberately contains no SpreadsheetApp calls.
 */

var ROLE_PERMISSIONS = {
  ADMIN: [
    "ws.admin.access",
    "ws.processes.manage",
    "ws.processes.read",
    "ws.indicators.manage",
    "ws.indicators.read",
    "ws.requests.manage",
    "ws.requests.create",
    "ws.automations.manage",
    "ws.users.manage",
    "ws.forms.manage",
    "ws.documents.manage",
    "ws.documents.upload",
    "ws.settings.manage",
    "ws.kpis.manage",
    "ws.kpis.read",
    "ws.kpis.record",
  ],
  HEAD: [
    "ws.admin.access",
    "ws.processes.manage",
    "ws.processes.read",
    "ws.indicators.manage",
    "ws.indicators.read",
    "ws.requests.manage",
    "ws.requests.create",
    "ws.automations.manage",
    "ws.users.manage",
    "ws.forms.manage",
    "ws.documents.manage",
    "ws.documents.upload",
    "ws.kpis.manage",
    "ws.kpis.read",
    "ws.kpis.record",
  ],
  ANALYST: [
    "ws.admin.access",
    "ws.processes.read",
    "ws.indicators.read",
    "ws.kpis.read",
    "ws.kpis.record",
    "ws.requests.create",
    "ws.documents.upload",
  ],
  OPS: [
    "ws.processes.read",
    "ws.requests.create",
    "ws.documents.upload",
  ],
  AUDIT: [
    "ws.admin.access",
    "ws.processes.read",
    "ws.indicators.read",
    "ws.kpis.read",
    "ws.documents.read",
  ],
};

var WorkspacePermissions = {
  /**
   * Resolve the role of a user from the wsUsers sheet for a given workspace.
   * Returns the role string (ADMIN, HEAD, etc.) or null if the user is not
   * found or is not active.
   *
   * @param {string} wsId
   * @param {string} userEmail
   * @returns {string|null}
   */
  getUserRole: function (wsId, userEmail) {
    if (!wsId || !userEmail) return null;

    var result = listEntities_("wsUsers", { wsId: wsId, email: userEmail });
    var items  = result && result.items || [];

    for (var i = 0; i < items.length; i++) {
      var u = items[i];
      if (u.email === userEmail && u.activo !== "false" && !u.deletedAt) {
        return u.rol || null;
      }
    }
    return null;
  },

  /**
   * Check whether a role has a given permission string.
   *
   * @param {string} role        — e.g. "ADMIN"
   * @param {string} permission  — e.g. "ws.processes.manage"
   * @returns {boolean}
   */
  hasPermission: function (role, permission) {
    if (!role) return false;
    var perms = ROLE_PERMISSIONS[role];
    if (!perms) return false;
    for (var i = 0; i < perms.length; i++) {
      if (perms[i] === permission) return true;
    }
    return false;
  },

  /**
   * Throw unless the acting user has the given permission in the workspace.
   * Pass context.userEmail and wsId from the incoming request.
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
   * Useful for the auth.getUser response.
   *
   * @param {string} role
   * @returns {string[]}
   */
  permissionsForRole: function (role) {
    return ROLE_PERMISSIONS[role] || [];
  },
};
