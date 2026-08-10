// ─── Drive report folder listing — 2-level hierarchy ─────────────────────────
// Structure: reportesFolder → Month folders → Files

// Month name → number map (handles "3.3.1 ENERO", "3.3.2 FEBRERO", etc.)
var MES_NOMBRES_MAP = {
  'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
  'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
  'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12,
};

/**
 * Extract month number from a folder name.
 * Handles both "01. Enero 2026" and "3.3.1 ENERO" patterns.
 * Prefers month name match; falls back to last segment of dotted prefix.
 */
function parseMesNumReporte(nombre) {
  var lower = nombre.toLowerCase();
  for (var mes in MES_NOMBRES_MAP) {
    if (lower.indexOf(mes) !== -1) return MES_NOMBRES_MAP[mes];
  }
  // Fallback: last number in dotted prefix "3.3.1" → 1
  var prefixMatch = nombre.match(/^[\d.]+/);
  if (prefixMatch) {
    var parts = prefixMatch[0].replace(/\.$/, '').split('.');
    var last = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(last) && last >= 1 && last <= 12) return last;
  }
  return 99;
}

/**
 * Returns the reports hierarchy for a given wsId.
 * Uses cache; pass `refresh=true` to force re-read.
 */
function getReportes(wsId, refresh) {
  var registry = getRegistry(false);
  var unit = null;
  for (var i = 0; i < registry.units.length; i++) {
    if (registry.units[i].id === wsId) { unit = registry.units[i]; break; }
  }

  if (!unit) return { error: true, code: 404, message: 'Unidad "' + wsId + '" no encontrada en el registro.' };
  if (!unit.reportesFolderId) return {
    wsId: wsId, nombre: unit.nombre, carpetaId: null, carpetaUrl: null,
    meses: [], total: 0, fetchedAt: toISO(new Date()),
    mensaje: 'Esta unidad no tiene carpeta de reportes configurada.'
  };

  var cacheKey = 'reportes_' + wsId;
  if (refresh) cacheDelete(cacheKey);

  return getCachedOrFetch(cacheKey, TTL.REPORTES, function() {
    return readReportesHierarchy(unit.reportesFolderId, wsId, unit.nombre);
  });
}

/**
 * Traverse 2 levels: Month → Files.
 * Returns the full nested structure.
 */
function readReportesHierarchy(rootFolderId, wsId, unitNombre) {
  var rootFolder = DriveApp.getFolderById(rootFolderId);
  var meses      = [];

  var mesIter = rootFolder.getFolders();
  while (mesIter.hasNext()) {
    var mesFolder = mesIter.next();
    var mesNombre = mesFolder.getName();

    var archivos = [];
    var fileIter = mesFolder.getFiles();
    while (fileIter.hasNext()) {
      archivos.push(buildArchivoDescriptor(fileIter.next()));
    }
    archivos.sort(function(a, b) { return b.modificadoEn.localeCompare(a.modificadoEn); });

    meses.push({
      id:       mesFolder.getId(),
      nombre:   mesNombre,
      mes:      parseMesNumReporte(mesNombre),
      anio:     parseMesAnio(mesNombre),
      driveId:  mesFolder.getId(),
      driveUrl: 'https://drive.google.com/drive/folders/' + mesFolder.getId(),
      archivos: archivos,
      total:    archivos.length,
    });
  }

  meses.sort(function(a, b) { return a.mes - b.mes; });

  return {
    wsId:       wsId,
    nombre:     unitNombre,
    carpetaId:  rootFolderId,
    carpetaUrl: 'https://drive.google.com/drive/folders/' + rootFolderId,
    meses:      meses,
    total:      meses.length,
    fetchedAt:  toISO(new Date()),
  };
}

