/**
 * Authentication bridge between Auth.js (frontend) and Apps Script (backend).
 *
 * The primary access gate is the Google Workspace domain restriction in
 * appsscript.json — only authenticated Workspace users from the deploying
 * account's domain can call this Web App at all. AuthBridge adds the
 * application layer on top: mapping a Google identity (email) to a system
 * Usuario record (role, unidadId) without duplicating any auth logic.
 *
 * The JWT callback in web/auth.ts calls `auth.getUser` after a successful
 * Google OAuth to hydrate the session with SSE-VRAF role and workspace data.
 *
 * Handled actions: auth.getUser, auth.ping
 */
var AuthBridge = {
  /**
   * Dispatch an auth.* verb.
   * @param {string} verb
   * @param {Object} params
   * @returns {*}
   */
  route: function (verb, params) {
    switch (verb) {
      case "getUser":
        return AuthBridge.getUser(params);
      case "ping":
        return AuthBridge.ping();
      default:
        throw new Error("Unknown auth action: auth." + verb);
    }
  },

  /**
   * Look up a Usuario by email. Returns the subset of fields the Auth.js JWT
   * callback needs to hydrate the session, or null if not found.
   *
   * @param {Object} params
   * @param {string} params.email
   * @returns {{ usuarioId, nombre, email, rol, unidadId, activo } | null}
   */
  getUser: function (params) {
    Validator.requireFields(params, ["email"]);
    var results = listEntities_("usuarios", { email: params.email });
    if (!results.items || results.items.length === 0) return null;

    var u = results.items[0];
    return {
      usuarioId: u.id,
      nombre:    u.nombre,
      email:     u.email,
      rol:       u.rol,
      unidadId:  u.unidadId,
      activo:    u.activo,
    };
  },

  /**
   * Health-check endpoint — confirms the Web App is reachable and returns
   * the configured instance name.
   * @returns {{ status, instance }}
   */
  ping: function () {
    return {
      status:   "ok",
      instance: Config.instanceName(),
      sprint:   "2 — Google Core",
    };
  },
};
