// ─── Drive folder discovery ───────────────────────────────────────────────────

const CACHE_KEY_REGISTRY = 'registry_v1';

// Keywords used to identify indicator sheets and evidence folders
const INDICADOR_KEYWORDS  = ['indicador', 'indicadores', 'kpi', 'tablero', 'cuadro'];
const EVIDENCIA_KEYWORDS  = ['evidencia', 'evidencias', 'soporte', 'anexo', 'respaldo'];

/**
 * Returns the full unit registry, using cache when available.
 * Pass `refresh=true` to bypass cache and force re-discovery.
 */
function getRegistry(refresh) {
  if (refresh) cacheDelete(CACHE_KEY_REGISTRY);
  return getCachedOrFetch(CACHE_KEY_REGISTRY, TTL.REGISTRY, discoverUnits);
}

/**
 * Walk the root Drive folder and return an array of unit descriptors.
 * This is the only function that calls DriveApp — everything else reads cache.
 */
function discoverUnits() {
  const rootId = requireProp('ROOT_FOLDER_ID');
  const root   = DriveApp.getFolderById(rootId);

  const units = [];
  const folderIter = root.getFolders();

  while (folderIter.hasNext()) {
    const folder = folderIter.next();
    const unit   = buildUnitDescriptor(folder);
    if (unit) units.push(unit);
  }

  // Sort alphabetically by display name
  units.sort(function(a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });

  return {
    units:       units,
    total:       units.length,
    discoveredAt: toISO(new Date()),
    rootFolderId: rootId,
  };
}

/**
 * Build a unit descriptor object from a Drive folder.
 * Returns null if the folder contains neither a sheet nor a subfolder
 * (i.e. it looks empty and shouldn't be listed).
 */
function buildUnitDescriptor(folder) {
  const nombre  = folder.getName();
  const slug    = slugify(nombre);
  const folderId = folder.getId();

  // Find the indicators sheet
  const sheetId = findIndicatorSheet(folder);

  // Find the evidence folder
  const evidenciaFolderId = findEvidenciaFolder(folder);

  // Skip empty top-level folders that have neither sheet nor subfolder
  if (!sheetId && !evidenciaFolderId) {
    const subFolders = folder.getFolders();
    if (!subFolders.hasNext()) return null;
  }

  return {
    id:               slug,
    nombre:           nombre,
    folderId:         folderId,
    sheetId:          sheetId,          // null if not found
    evidenciaFolderId: evidenciaFolderId, // null if not found
    hasIndicadores:   !!sheetId,
    hasEvidencias:    !!evidenciaFolderId,
  };
}

/**
 * Find the best Google Sheets file to use as indicator source.
 * Search order:
 *   1. Direct children of the unit folder
 *   2. Children of any subfolder whose name matches an indicator keyword (e.g. "indicadores")
 * Within each location, prefer keyword-named sheets; tie-break by most recently modified.
 */
function findIndicatorSheet(folder) {
  // 1. Look directly in the unit folder
  var sheetId = pickBestSheet(collectSheets(folder));
  if (sheetId) return sheetId;

  // 2. Look inside indicator-named subfolders
  var subIter = folder.getFolders();
  while (subIter.hasNext()) {
    var sub = subIter.next();
    if (containsKeyword(sub.getName(), INDICADOR_KEYWORDS)) {
      sheetId = pickBestSheet(collectSheets(sub));
      if (sheetId) return sheetId;
    }
  }

  return null;
}

/** Collect all Sheets files from a folder into a plain array. */
function collectSheets(folder) {
  var fileIter = folder.getFilesByType(MIME.SHEET);
  var sheets   = [];
  while (fileIter.hasNext()) {
    var f = fileIter.next();
    sheets.push({
      id:           f.getId(),
      name:         f.getName(),
      lastModified: f.getLastUpdated(),
      hasKeyword:   containsKeyword(f.getName(), INDICADOR_KEYWORDS),
    });
  }
  return sheets;
}

/** Pick the best sheet from an array: keyword match first, then newest. */
function pickBestSheet(sheets) {
  if (sheets.length === 0) return null;
  if (sheets.length === 1) return sheets[0].id;
  var keywordMatches = sheets.filter(function(s) { return s.hasKeyword; });
  if (keywordMatches.length === 1) return keywordMatches[0].id;
  sheets.sort(function(a, b) { return b.lastModified - a.lastModified; });
  return sheets[0].id;
}

/**
 * Find the evidence folder inside a unit folder.
 * Priority:
 *   1. Subfolder whose name contains an evidence keyword
 *   2. First available subfolder
 *   3. null if no subfolders
 */
function findEvidenciaFolder(folder) {
  const subIter  = folder.getFolders();
  const subFolders = [];

  while (subIter.hasNext()) {
    const f = subIter.next();
    subFolders.push({
      id:         f.getId(),
      name:       f.getName(),
      hasKeyword: containsKeyword(f.getName(), EVIDENCIA_KEYWORDS),
    });
  }

  if (subFolders.length === 0) return null;

  const keywordMatches = subFolders.filter(function(f) { return f.hasKeyword; });
  if (keywordMatches.length > 0) return keywordMatches[0].id;

  return subFolders[0].id;
}
