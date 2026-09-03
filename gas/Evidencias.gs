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
 * Traverse evidence folder hierarchy — adaptive to any folder depth.
 *
 * Expected ideal structure: evidenciaFolder → Area → Indicator → Month → Files
 * Fallbacks handled automatically:
 *   - Files placed directly in an Indicator folder → shown under synthetic month "Archivos"
 *   - Files placed directly in an Area folder (no Indicator level) → synthetic Indicator
 *   - No Area subfolders but direct Indicator folders → synthetic Area "General"
 *   - Files directly in the evidence root → synthetic Area + Indicator
 */
function readEvidenciaHierarchy(rootFolderId, wsId, unitNombre) {
  var rootFolder = DriveApp.getFolderById(rootFolderId);
  var areas      = [];

  var areaSubfolders = collectFolders(rootFolder);

  // No area subfolders at all — try treating root directly as an area
  if (areaSubfolders.length === 0) {
    var rootFiles = collectFiles(rootFolder);
    if (rootFiles.length > 0) {
      areas.push(buildSyntheticArea(rootFolder, rootFiles));
    }
    return buildResponse(wsId, unitNombre, rootFolderId, areas);
  }

  for (var a = 0; a < areaSubfolders.length; a++) {
    var areaFolder = areaSubfolders[a];
    var area = {
      id:          areaFolder.getId(),
      nombre:      areaFolder.getName(),
      driveId:     areaFolder.getId(),
      driveUrl:    'https://drive.google.com/drive/folders/' + areaFolder.getId(),
      indicadores: [],
    };

    var indSubfolders = collectFolders(areaFolder);
    var areaDirectFiles = collectFiles(areaFolder);

    if (indSubfolders.length === 0) {
      // Area has no indicator subfolders — treat area-level files as one synthetic indicator
      if (areaDirectFiles.length > 0) {
        area.indicadores.push(buildSyntheticIndicador(areaFolder, areaDirectFiles));
      }
    } else {
      for (var i = 0; i < indSubfolders.length; i++) {
        var indFolder = indSubfolders[i];
        var indicador = {
          id:            indFolder.getId(),
          nombre:        indFolder.getName(),
          driveId:       indFolder.getId(),
          driveUrl:      'https://drive.google.com/drive/folders/' + indFolder.getId(),
          meses:         [],
          totalArchivos: 0,
        };

        var mesSubfolders   = collectFolders(indFolder);
        var indDirectFiles  = collectFiles(indFolder);

        // Files directly in the indicator folder — synthetic month entry
        if (indDirectFiles.length > 0) {
          var synMes = buildSyntheticMes(indFolder, indDirectFiles);
          indicador.meses.push(synMes);
          indicador.totalArchivos += synMes.total;
        }

        // Normal month subfolders
        for (var m = 0; m < mesSubfolders.length; m++) {
          var mesFolder = mesSubfolders[m];
          var archivos  = collectFiles(mesFolder);
          archivos.sort(function(a, b) { return b.modificadoEn.localeCompare(a.modificadoEn); });
          var mesEntry = {
            id:       mesFolder.getId(),
            nombre:   mesFolder.getName(),
            mes:      parseMesNum(mesFolder.getName()),
            anio:     parseMesAnio(mesFolder.getName()),
            driveId:  mesFolder.getId(),
            driveUrl: 'https://drive.google.com/drive/folders/' + mesFolder.getId(),
            archivos: archivos,
            total:    archivos.length,
          };
          indicador.meses.push(mesEntry);
          indicador.totalArchivos += mesEntry.total;
        }

        indicador.meses.sort(function(a, b) { return a.mes - b.mes; });
        area.indicadores.push(indicador);
      }

      // Also capture files sitting directly in the area (outside any indicator folder)
      if (areaDirectFiles.length > 0 && indSubfolders.length > 0) {
        area.indicadores.push(buildSyntheticIndicador(areaFolder, areaDirectFiles));
      }
    }

    area.indicadores.sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });
    areas.push(area);
  }

  areas.sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });
  return buildResponse(wsId, unitNombre, rootFolderId, areas);
}

// ─── Structure helpers ────────────────────────────────────────────────────────

function collectFolders(folder) {
  var iter    = folder.getFolders();
  var result  = [];
  while (iter.hasNext()) result.push(iter.next());
  return result;
}

function collectFiles(folder) {
  var iter    = folder.getFiles();
  var result  = [];
  while (iter.hasNext()) result.push(buildArchivoDescriptor(iter.next()));
  result.sort(function(a, b) { return b.modificadoEn.localeCompare(a.modificadoEn); });
  return result;
}

function buildSyntheticMes(parentFolder, archivos) {
  return {
    id:       parentFolder.getId() + '_files',
    nombre:   'Archivos',
    mes:      0,
    anio:     new Date().getFullYear(),
    driveId:  parentFolder.getId(),
    driveUrl: 'https://drive.google.com/drive/folders/' + parentFolder.getId(),
    archivos: archivos,
    total:    archivos.length,
  };
}

function buildSyntheticIndicador(folder, archivos) {
  var mes = buildSyntheticMes(folder, archivos);
  return {
    id:            folder.getId() + '_ind',
    nombre:        'Archivos sin clasificar',
    driveId:       folder.getId(),
    driveUrl:      'https://drive.google.com/drive/folders/' + folder.getId(),
    meses:         [mes],
    totalArchivos: archivos.length,
  };
}

function buildSyntheticArea(folder, archivos) {
  var ind = buildSyntheticIndicador(folder, archivos);
  return {
    id:          folder.getId() + '_area',
    nombre:      'General',
    driveId:     folder.getId(),
    driveUrl:    'https://drive.google.com/drive/folders/' + folder.getId(),
    indicadores: [ind],
  };
}

function buildResponse(wsId, nombre, rootFolderId, areas) {
  var total = 0;
  for (var a = 0; a < areas.length; a++) {
    for (var i = 0; i < areas[a].indicadores.length; i++) {
      total += areas[a].indicadores[i].totalArchivos;
    }
  }
  return {
    wsId:       wsId,
    nombre:     nombre,
    carpetaId:  rootFolderId,
    carpetaUrl: 'https://drive.google.com/drive/folders/' + rootFolderId,
    areas:      areas,
    total:      total,
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
