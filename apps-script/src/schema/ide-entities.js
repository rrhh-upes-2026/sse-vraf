// ============================================================
// IDE — Indicator Definition Engine  |  Sprint 016
// ============================================================

var IDE_SHEETS = {
  indicators: "IDE_Indicators",
  versions:   "IDE_IndicatorVersions",
};

function mergeIDEEntities_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── IDE_Indicators ─────────────────────────────────────────
  var indHeaders = [
    "id", "codigo", "nombre", "descripcion",
    "objetivoId", "dimensionId", "unitMeasureId", "frequencyId",
    "formulaId", "polarityId", "rangeConfigId",
    "responsibleId", "unidadId",
    "meta", "status", "version",
    "vigenciaDesde", "vigenciaHasta", "observaciones",
    "dependencias",
    "activo", "createdAt", "updatedAt", "createdBy", "updatedBy",
  ];
  if (!ss.getSheetByName(IDE_SHEETS.indicators)) {
    var sh = ss.insertSheet(IDE_SHEETS.indicators);
    sh.appendRow(indHeaders);
    sh.setFrozenRows(1);
  }

  // ── IDE_IndicatorVersions ──────────────────────────────────
  var verHeaders = [
    "id", "indicatorId", "version", "status",
    "snapshot", "publishedAt", "archivedAt",
    "createdAt", "createdBy",
  ];
  if (!ss.getSheetByName(IDE_SHEETS.versions)) {
    var sv = ss.insertSheet(IDE_SHEETS.versions);
    sv.appendRow(verHeaders);
    sv.setFrozenRows(1);
  }
}
