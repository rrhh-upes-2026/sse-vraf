// ============================================================
// OIM — Official Indicator Migration  |  Unit Definition
// ============================================================

var OIM_UNIT_DEF = {
  id:          "oim",
  name:        "Official Indicator Migration",
  description: "Motor de migración oficial de los 10 indicadores VRAF hacia el IDE. Sprint 017.",
  version:     "1.0.0",
  color:       "#6366F1",
  handlers: [
    { action: "oim.runMigration",      handler: function (p, c) { return VRAFMigration.handle("oim.runMigration",      p, c); } },
    { action: "oim.getPreview",        handler: function (p, c) { return VRAFMigration.handle("oim.getPreview",        p, c); } },
    { action: "oim.listReports",       handler: function (p, c) { return VRAFMigration.handle("oim.listReports",       p, c); } },
    { action: "oim.mergeVRAFCatalogs", handler: function (p, c) { return VRAFMigration.handle("oim.mergeVRAFCatalogs", p, c); } },
  ],
};
