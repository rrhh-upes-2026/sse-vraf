/**
 * Ejecutivo Organizational Unit Definition — Executive Dashboard.
 *
 * Transversal unit that consolidates all organizational units into a single
 * executive view. Delegates all logic to ExecutiveDashboardController and
 * KPIEngine — no unit-specific business logic here.
 */

var EJECUTIVO_UNIT_DEF = {

  // ── Identity ────────────────────────────────────────────────────────────────
  key:         "ejecutivo",
  label:       "Dashboard Ejecutivo",
  description: "Vista consolidada institucional: KPIs, semáforos, alertas, " +
               "tendencias y resúmenes de todas las unidades organizacionales.",
  version:     "1.0.0",
  enabled:     true,
  icon:        "LayoutDashboard",
  color:       "#7C3AED",
  owner: {
    rol:   "RECTOR",
    label: "Rectoría",
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  navigation: [
    {
      key: "dashboard-ejecutivo", label: "Dashboard Ejecutivo", icon: "LayoutDashboard",
      path: "/admin/dashboard-ejecutivo", requiredRoles: [],
    },
  ],

  // ── Entities (none — read-only aggregation) ──────────────────────────────────
  entities: [],

  // ── Handlers ─────────────────────────────────────────────────────────────────
  handlers: {
    getDashboard:          function (p, c) { return ExecutiveDashboardController.getDashboard(p, c); },
    getUnitSummary:        function (p, c) { return ExecutiveDashboardController.getUnitSummary(p, c); },
    getAllKPIs:             function (p, c) { return ExecutiveDashboardController.getAllKPIs(p, c); },
    getKPIsByDashboard:    function (p, c) { return ExecutiveDashboardController.getKPIsByDashboard(p, c); },
    getKPIsByUnit:         function (p, c) { return ExecutiveDashboardController.getKPIsByUnit(p, c); },
    getKPIsByCategoria:    function (p, c) { return ExecutiveDashboardController.getKPIsByCategoria(p, c); },
    getKPIsSemaforo:       function (p, c) { return ExecutiveDashboardController.getKPIsSemaforo(p, c); },
    getRegisteredAdapters: function (p, c) { return ExecutiveDashboardController.getRegisteredAdapters(p, c); },
  },

  // ── Permissions ───────────────────────────────────────────────────────────────
  permissions: [
    { key: "ejecutivo.read",   label: "Ver dashboard ejecutivo",      roles: ["RECTOR", "VICERRECTOR", "HEAD"] },
    { key: "ejecutivo.export", label: "Exportar reportes ejecutivos", roles: ["RECTOR", "VICERRECTOR"] },
  ],
};
