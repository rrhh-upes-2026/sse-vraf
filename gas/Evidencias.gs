// ─── Drive evidence folder listing — 3-level hierarchy ───────────────────────
// Structure: evidenciaFolder → Area folders → Indicator folders → Month folders → Files

/**
 * Returns the evidence hierarchy for a given wsId.
 * Uses cache; pass `refresh=true` to force re-read.
 */
function getEvidencias(wsId, refresh) {
  var registry = getRegistry(false);
  var unit = null;
  for (var i = 0; i < registry.units.length; i++) {
    if (registry.units[i].id === wsId) { unit = registry.units[i]; break; }
  }

  if (!unit) return { error: true, code: 404, message: 'Unidad "' + wsId + '" no encontrada en el registro.' };
  if (!unit.evidenciaFolderId) return {
    wsId: wsId, nombre: unit.nombre, carpetaId: null, carpetaUrl: null,
    areas: [], total: 0, fetchedAt: toISO(new Date()),
    mensaje: 'Esta unidad no tiene carpeta de evidencias configurada.'
  };

  var cacheKey = 'evidencias_' + wsId;
  if (refresh) cacheDelete(cacheKey);

  return getCachedOrFetch(cacheKey, TTL.EVIDENCIAS, function() {
    return readEvidenciaHierarchy(unit.evidenciaFolderId, wsId, unit.nombre);
  });
}

/**
 * Traverse 3 levels: Area → Indicator → Month → Files.
 * Returns the full nested structure.
 */
function readEvidenciaHierarchy(rootFolderId, wsId, unitNombre) {
  var rootFolder = DriveApp.getFolderById(rootFolderId);
  var areas      = [];

  var areaIter = rootFolder.getFolders();
  while (areaIter.hasNext()) {
    var areaFolder = areaIter.next();
    var area = {
      id:        areaFolder.getId(),
      nombre:    areaFolder.getName(),
      driveId:   areaFolder.getId(),
      driveUrl:  'https://drive.google.com/drive/folders/' + areaFolder.getId(),
      indicadores: [],
    };

    var indIter = areaFolder.getFolders();
    while (indIter.hasNext()) {
      var indFolder = indIter.next();
      var indicador = {
        id:            indFolder.getId(),
        nombre:        indFolder.getName(),
        driveId:       indFolder.getId(),
        driveUrl:      'https://drive.google.com/drive/folders/' + indFolder.getId(),
        meses:         [],
        totalArchivos: 0,
      };

      var mesIter = indFolder.getFolders();
      while (mesIter.hasNext()) {
        var mesFolder = mesIter.next();
        var mesNombre = mesFolder.getName();

        var archivos  = [];
        var fileIter  = mesFolder.getFiles();
        while (fileIter.hasNext()) {
          archivos.push(buildArchivoDescriptor(fileIter.next()));
        }
        archivos.sort(function(a, b) { return b.modificadoEn.localeCompare(a.modificadoEn); });

        indicador.meses.push({
          id:       mesFolder.getId(),
          nombre:   mesNombre,
          mes:      parseMesNum(mesNombre),
          anio:     parseMesAnio(mesNombre),
          driveId:  mesFolder.getId(),
          driveUrl: 'https://drive.google.com/drive/folders/' + mesFolder.getId(),
          archivos: archivos,
          total:    archivos.length,
        });
        indicador.totalArchivos += archivos.length;
      }

      indicador.meses.sort(function(a, b) { return a.mes - b.mes; });
      area.indicadores.push(indicador);
    }

    area.indicadores.sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });
    areas.push(area);
  }

  areas.sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });

  return {
    wsId:       wsId,
    nombre:     unitNombre,
    carpetaId:  rootFolderId,
    carpetaUrl: 'https://drive.google.com/drive/folders/' + rootFolderId,
    areas:      areas,
    total:      areas.length,
    fetchedAt:  toISO(new Date()),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract leading number from folder name, e.g. "01. Enero 2026" → 1. */
function parseMesNum(nombre) {
  var m = String(nombre).match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 99;
}

/** Extract 4-digit year from folder name, e.g. "01. Enero 2026" → 2026. */
function parseMesAnio(nombre) {
  var m = String(nombre).match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Build a file descriptor from a DriveApp File object.
 */
function buildArchivoDescriptor(file) {
  var mime = file.getMimeType();
  return {
    id:           file.getId(),
    nombre:       file.getName(),
    mime:         mime,
    tipoLabel:    getMimeLabel(mime),
    url:          file.getUrl(),
    tamano:       file.getSize(),
    creadoEn:     toISO(file.getDateCreated()),
    modificadoEn: toISO(file.getLastUpdated()),
  };
}
