/**
 * OrgUnitRegistry — Central discovery point for all Organizational Units.
 *
 * Each unit registers a UnitDefinition object that fully describes its
 * navigation, workflows, automations, reports, handlers, catalogs, and
 * settings. The registry is the ONLY place where unit-specific logic is
 * wired; no unit identifiers appear in the router or engine internals.
 *
 * Usage:
 *   OrgUnitRegistry.register(MY_UNIT_DEF);
 *   OrgUnitRegistry.invokeHandler("rrhh", "validarRequisicion", params, ctx);
 *   OrgUnitRegistry.getNavigation("rrhh", "HEAD");
 *
 * Call registerAllUnits_() once during bootstrap (Code.js IIFE) after all
 * unit definition vars have been assigned.
 */
var OrgUnitRegistry = (function () {

  var _registry = {};

  // ── Registration ─────────────────────────────────────────────────────────────

  function register(def) {
    if (!def || !def.key) throw new Error("UnitDefinition requires a 'key' field.");
    _registry[def.key] = def;
    AppLogger.info("OrgUnitRegistry.register", { key: def.key, version: def.version || "1.0" });
  }

  function has(key) {
    return Object.prototype.hasOwnProperty.call(_registry, key);
  }

  function get(key) {
    return has(key) ? _safeExport_(_registry[key]) : null;
  }

  function list() {
    return Object.keys(_registry).map(function (k) { return _safeExport_(_registry[k]); });
  }

  // Strip handler functions — they are not serializable to JSON.
  function _safeExport_(def) {
    var safe = {};
    var skip = { handlers: true };
    for (var k in def) {
      if (Object.prototype.hasOwnProperty.call(def, k) && !skip[k]) {
        safe[k] = def[k];
      }
    }
    // Replace handlers map with presence-only summary
    if (def.handlers) {
      safe.handlers = {};
      var keys = Object.keys(def.handlers);
      for (var i = 0; i < keys.length; i++) {
        safe.handlers[keys[i]] = { registered: true };
      }
    }
    return safe;
  }

  // ── Handler invocation (WorkflowEngine bridge) ────────────────────────────────

  function invokeHandler(unitKey, handlerKey, params, context) {
    var def = _registry[unitKey];
    if (!def) throw new Error("OrgUnitRegistry: unknown unit '" + unitKey + "'.");
    if (!def.enabled) throw new Error("Unit '" + unitKey + "' is disabled.");
    if (!def.handlers || typeof def.handlers[handlerKey] !== "function") {
      throw new Error("Handler '" + handlerKey + "' not found in unit '" + unitKey + "'.");
    }
    AppLogger.info("OrgUnitRegistry.invokeHandler", { unit: unitKey, handler: handlerKey });
    return def.handlers[handlerKey](params, context);
  }

  // ── Direct unit routing (router.js hook) ─────────────────────────────────────

  function route(unitKey, verb, params, context) {
    var def = _registry[unitKey];
    if (!def) throw new Error("OrgUnitRegistry: unknown unit '" + unitKey + "'.");
    if (!def.enabled) throw new Error("Unit '" + unitKey + "' is disabled.");

    var userEmail = context && context.userEmail || "";
    var wsId = params && params.wsId || "";
    if (wsId && userEmail) {
      WorkspacePermissions.requirePermission(wsId, userEmail, "ws.admin.access");
    }

    return invokeHandler(unitKey, verb, params, context);
  }

  // ── Navigation discovery ──────────────────────────────────────────────────────

  function getNavigation(unitKey, userRole) {
    var def = _registry[unitKey];
    if (!def) return [];
    return _filterByRole_(def.navigation || [], userRole);
  }

  function getAllNavigation(userRole) {
    var result = {};
    var keys = Object.keys(_registry);
    for (var i = 0; i < keys.length; i++) {
      var def = _registry[keys[i]];
      if (def.enabled) {
        result[keys[i]] = _filterByRole_(def.navigation || [], userRole);
      }
    }
    return result;
  }

  function _filterByRole_(items, userRole) {
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var roles = item.requiredRoles;
      if (!roles || roles.length === 0 || !userRole || roles.indexOf(userRole) !== -1) {
        var clone = Object.assign({}, item);
        if (Array.isArray(item.children)) {
          clone.children = _filterByRole_(item.children, userRole);
        }
        out.push(clone);
      }
    }
    return out;
  }

  // ── Module / workflow / report discovery ─────────────────────────────────────

  function getModules(unitKey) {
    var def = _registry[unitKey];
    return def ? (def.modules || []) : [];
  }

  function getWorkflows(unitKey) {
    var def = _registry[unitKey];
    return def ? (def.workflows || []) : [];
  }

  function getReports(unitKey, userRole) {
    var def = _registry[unitKey];
    if (!def) return [];
    return _filterByRole_(def.reports || [], userRole);
  }

  function getPermissions(unitKey) {
    var def = _registry[unitKey];
    return def ? (def.permissions || {}) : {};
  }

  function getSettings(unitKey) {
    var def = _registry[unitKey];
    return def ? (def.settings || {}) : {};
  }

  function getCatalogs(unitKey) {
    var def = _registry[unitKey];
    return def ? (def.catalogs || []) : [];
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  return {
    register:       register,
    has:            has,
    get:            get,
    list:           list,
    route:          route,
    invokeHandler:  invokeHandler,
    getNavigation:  getNavigation,
    getAllNavigation: getAllNavigation,
    getModules:     getModules,
    getWorkflows:   getWorkflows,
    getReports:     getReports,
    getPermissions: getPermissions,
    getSettings:    getSettings,
    getCatalogs:    getCatalogs,
  };

})();

/**
 * Register all six organizational units. Called once from Code.js bootstrap.
 * Unit vars must be defined before this runs (they are defined in units/*.js).
 */
function registerAllUnits_() {
  var defs = [
    typeof RRHH_UNIT_DEF         !== "undefined" ? RRHH_UNIT_DEF         : null,
    typeof VRAF_UNIT_DEF         !== "undefined" ? VRAF_UNIT_DEF         : null,
    typeof CONTABILIDAD_UNIT_DEF !== "undefined" ? CONTABILIDAD_UNIT_DEF : null,
    typeof COMPRAS_UNIT_DEF      !== "undefined" ? COMPRAS_UNIT_DEF      : null,
    typeof MANTENIMIENTO_UNIT_DEF !== "undefined" ? MANTENIMIENTO_UNIT_DEF : null,
    typeof SALUD_SSO_UNIT_DEF    !== "undefined" ? SALUD_SSO_UNIT_DEF    : null,
  ];
  var count = 0;
  for (var i = 0; i < defs.length; i++) {
    if (defs[i]) { OrgUnitRegistry.register(defs[i]); count++; }
  }
  AppLogger.info("registerAllUnits_: registered units", { count: count });
}
