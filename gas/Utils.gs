// ─── General-purpose helpers ──────────────────────────────────────────────────

/**
 * "Recursos Humanos" → "recursos-humanos"
 * Strips accents, lowercases, collapses whitespace to hyphens.
 */
function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalise a string for fuzzy comparison:
 * strip accents, lowercase, collapse spaces.
 */
function normalizeForSearch(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true if `haystack` contains any of the `keywords`
 * after normalisation.
 */
function containsKeyword(haystack, keywords) {
  const h = normalizeForSearch(haystack);
  return keywords.some(function(k) { return h.indexOf(k) !== -1; });
}

/**
 * Returns a human-readable label for a MIME type.
 */
function getMimeLabel(mime) {
  if (!mime) return 'Archivo';
  if (mime === MIME.SHEET)  return 'Google Sheets';
  if (mime === MIME.DOC)    return 'Google Docs';
  if (mime === MIME.PDF)    return 'PDF';
  if (MIME.IMG.indexOf(mime) !== -1) return 'Imagen';
  const parts = mime.split('/');
  return parts[parts.length - 1].toUpperCase();
}

/**
 * Formats a JavaScript Date to ISO-8601 string (El Salvador = UTC-6, no DST).
 */
function toISO(date) {
  return Utilities.formatDate(date || new Date(), 'America/El_Salvador', "yyyy-MM-dd'T'HH:mm:ss'-06:00'");
}

/**
 * Returns a JSON ContentService response.
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Returns a JSON error response.
 */
function errorResponse(message, code) {
  return jsonResponse({ error: true, code: code || 400, message: message });
}
