// ─── Drive evidence folder listing ───────────────────────────────────────────

/**
 * Returns a list of files in the evidence folder for a given wsId.
 * Uses cache; pass `refresh=true` to force re-read.
 */
function getEvidencias(wsId, refresh) {
  const registry = getRegistry(false);
  const unit = registry.units.find(function(u) { return u.id === wsId; });

  if (!unit) return { error: true, code: 404, message: 'Unidad "' + wsId + '" no encontrada en el registro.' };
  if (!unit.evidenciaFolderId) return { archivos: [], total: 0, wsId: wsId, carpetaId: null, mensaje: 'Esta unidad no tiene carpeta de evidencias.' };

  const cacheKey = 'evidencias_' + wsId;
  if (refresh) cacheDelete(cacheKey);

  return getCachedOrFetch(cacheKey, TTL.EVIDENCIAS, function() {
    return readEvidenciaFolder(unit.evidenciaFolderId, wsId, unit.nombre);
  });
}

/**
 * List all files in an evidence folder, sorted by modification date descending.
 * Does not recurse into sub-subfolders; only the direct children of the evidence folder.
 */
function readEvidenciaFolder(folderId, wsId, unitNombre) {
  const folder  = DriveApp.getFolderById(folderId);
  const fileIter = folder.getFiles();
  const archivos = [];

  while (fileIter.hasNext()) {
    const file = fileIter.next();
    archivos.push(buildArchivoDescriptor(file));
  }

  // Sort newest first
  archivos.sort(function(a, b) { return b.modificadoEn.localeCompare(a.modificadoEn); });

  return {
    wsId:       wsId,
    nombre:     unitNombre,
    carpetaId:  folderId,
    carpetaUrl: 'https://drive.google.com/drive/folders/' + folderId,
    archivos:   archivos,
    total:      archivos.length,
    fetchedAt:  toISO(new Date()),
  };
}

/**
 * Build a file descriptor from a DriveApp File object.
 */
function buildArchivoDescriptor(file) {
  const mime = file.getMimeType();
  return {
    id:          file.getId(),
    nombre:      file.getName(),
    mime:        mime,
    tipoLabel:   getMimeLabel(mime),
    url:         file.getUrl(),
    tamano:      file.getSize(),
    creadoEn:    toISO(file.getDateCreated()),
    modificadoEn: toISO(file.getLastUpdated()),
  };
}
