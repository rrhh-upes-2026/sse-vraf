// ─── Script Properties ───────────────────────────────────────────────────────
// Set these in the GAS editor: Extensions → Apps Script → Project Settings → Script Properties
//   ROOT_FOLDER_ID  = 1fCuGSn7oODIlSYe68jxVyLphRQaL0SpV
//   BEARER_TOKEN    = <random string, min 32 chars>  (leave empty to disable auth)

const VERSION = '1.0.0';

const TTL = {
  REGISTRY:    30 * 60,   // 30 min — folder discovery
  INDICADORES:  5 * 60,   //  5 min — sheet data
  EVIDENCIAS:  10 * 60,   // 10 min — drive file list
  REPORTES:    10 * 60,   // 10 min — drive report file list
};


const MIME = {
  SHEET:  'application/vnd.google-apps.spreadsheet',
  FOLDER: 'application/vnd.google-apps.folder',
  DOC:    'application/vnd.google-apps.document',
  PDF:    'application/pdf',
  IMG:    ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

/** Returns the value of a Script Property, or throws if missing. */
function requireProp(key) {
  const val = PropertiesService.getScriptProperties().getProperty(key);
  if (!val) throw new Error('Script Property "' + key + '" is not configured.');
  return val;
}

/** Returns the value of a Script Property, or a default if missing. */
function getProp(key, defaultValue) {
  return PropertiesService.getScriptProperties().getProperty(key) || defaultValue;
}
