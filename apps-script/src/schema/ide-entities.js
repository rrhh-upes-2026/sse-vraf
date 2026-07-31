// ============================================================
// IDE — Indicator Definition Engine  |  Sprint 016
// ============================================================

var IDE_SHEETS = {
  indicators: "IDE_Indicators",
  versions:   "IDE_IndicatorVersions",
};

function mergeIDEEntities_() {
  var ss = getSpreadsheet_();

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
  ENTITY_SHEETS[IDE_SHEETS.indicators] = { sheetName: IDE_SHEETS.indicators, columns: indHeaders };
  if (!ss.getSheetByName(IDE_SHEETS.indicators)) {
    var sh = ss.insertSheet(IDE_SHEETS.indicators);
    sh.appendRow(indHeaders);
    sh.setFrozenRows(1);
  }

  var verHeaders = [
    "id", "indicatorId", "version", "status",
    "snapshot", "publishedAt", "archivedAt",
    "createdAt", "createdBy",
  ];
  ENTITY_SHEETS[IDE_SHEETS.versions] = { sheetName: IDE_SHEETS.versions, columns: verHeaders };
  if (!ss.getSheetByName(IDE_SHEETS.versions)) {
    var sv = ss.insertSheet(IDE_SHEETS.versions);
    sv.appendRow(verHeaders);
    sv.setFrozenRows(1);
  }
}
