// ─── Google Sheets → Indicador parser ────────────────────────────────────────

const MONTH_NAMES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
];

// Column synonym map — fuzzy-match Spanish header names
const COL_MAP = {
  codigo:       ['pi (', 'codigo', 'código', 'clave', 'n°'],
  nombre:       ['indicador integrado', 'indicador', 'nombre', 'descripcion', 'descripción', 'detalle'],
  meta:         ['valor meta', 'meta', 'target'],
  resultado:    ['resultado', 'valor actual', 'logro', 'real', 'avance', 'valor real'],
  unidad:       ['unidad de medida', 'unidad medida', 'medida', 'tipo'],
  responsable:  ['responsable', 'encargado', 'jefe'],
  periodicidad: ['frecuencia de analisis', 'frecuencia de análisis', 'frecuencia', 'periodicidad', 'periodo'],
  fecha:        ['fecha de corte', 'fecha corte', 'corte', 'fecha'],
  observacion:  ['observaciones', 'observacion', 'observación', 'nota', 'comentario'],
};

/**
 * Returns parsed indicator data for a given wsId (unit slug).
 * Uses cache; pass `refresh=true` to force re-read.
 */
function getIndicadores(wsId, refresh) {
  var registry = getRegistry(false);
  var unit = null;
  for (var i = 0; i < registry.units.length; i++) {
    if (registry.units[i].id === wsId) { unit = registry.units[i]; break; }
  }

  if (!unit) return { error: true, code: 404, message: 'Unidad "' + wsId + '" no encontrada en el registro.' };
  if (!unit.sheetId) return { error: true, code: 404, message: 'La unidad "' + wsId + '" no tiene hoja de indicadores.' };

  var cacheKey = 'indicadores_' + wsId;
  if (refresh) cacheDelete(cacheKey);

  return getCachedOrFetch(cacheKey, TTL.INDICADORES, function() {
    return readIndicadoresSheet(unit.sheetId, wsId, unit.nombre);
  });
}

/**
 * Open the spreadsheet and parse the main indicators tab.
 */
function readIndicadoresSheet(sheetId, wsId, unitNombre) {
  var ss        = SpreadsheetApp.openById(sheetId);
  var mainSheet = findMainSheet(ss);

  if (!mainSheet) {
    return { error: true, code: 422, message: 'No se encontró hoja principal de indicadores.' };
  }

  var allValues    = mainSheet.getDataRange().getValues();
  var headerRowIdx = findHeaderRowIndex(allValues);
  var headerRow    = allValues[headerRowIdx];

  var colIndex      = buildColumnIndex(headerRow);
  var monthlyColumns = detectMonthlyResultColumns(headerRow);

  var indicadores = [];
  for (var r = headerRowIdx + 1; r < allValues.length; r++) {
    var indicador = parseRow(allValues[r], colIndex, monthlyColumns, indicadores.length + 1);
    if (indicador) indicadores.push(indicador);
  }

  return {
    wsId:       wsId,
    nombre:     unitNombre,
    sheetId:    sheetId,
    sheetName:  mainSheet.getName(),
    indicadores: indicadores,
    total:      indicadores.length,
    fetchedAt:  toISO(new Date()),
  };
}

// ─── Header detection ─────────────────────────────────────────────────────────

/**
 * Scan the first 15 rows and return the index of the row whose cells best
 * match our column synonym vocabulary. Handles sheets with title rows before
 * the actual header.
 */
function findHeaderRowIndex(allRows) {
  var allSynonyms = [];
  var fields = Object.keys(COL_MAP);
  for (var f = 0; f < fields.length; f++) {
    var syns = COL_MAP[fields[f]];
    for (var s = 0; s < syns.length; s++) allSynonyms.push(syns[s]);
  }
  for (var m = 0; m < MONTH_NAMES.length; m++) {
    allSynonyms.push('resultado ' + MONTH_NAMES[m]);
  }

  var bestScore = -1;
  var bestIndex = 0;
  var limit = Math.min(allRows.length, 15);

  for (var r = 0; r < limit; r++) {
    var score = 0;
    var row   = allRows[r];
    for (var c = 0; c < row.length; c++) {
      if (!row[c]) continue;
      var h = normalizeForSearch(String(row[c]));
      for (var si = 0; si < allSynonyms.length; si++) {
        if (h.indexOf(allSynonyms[si]) !== -1) { score++; break; }
      }
    }
    if (score > bestScore) { bestScore = score; bestIndex = r; }
  }
  return bestIndex;
}

/**
 * Select the main indicators sheet from the spreadsheet.
 * Prefers keyword-named tabs; falls back to first tab.
 */
function findMainSheet(ss) {
  var sheets = ss.getSheets();
  if (sheets.length === 0) return null;
  for (var i = 0; i < sheets.length; i++) {
    if (containsKeyword(sheets[i].getName(), INDICADOR_KEYWORDS)) return sheets[i];
  }
  return sheets[0];
}

/**
 * Map header cells to column indices using the COL_MAP synonym table.
 * First match per field wins (left-to-right); more specific synonyms are
 * listed first in COL_MAP to take priority over generic ones.
 */
function buildColumnIndex(headerRow) {
  var index  = {};
  var fields = Object.keys(COL_MAP);

  for (var i = 0; i < headerRow.length; i++) {
    if (!headerRow[i]) continue;
    var h = normalizeForSearch(String(headerRow[i]));

    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (index[field] !== undefined) continue; // already mapped
      var syns = COL_MAP[field];
      for (var s = 0; s < syns.length; s++) {
        if (h.indexOf(syns[s]) !== -1) { index[field] = i; break; }
      }
    }
  }
  return index;
}

// ─── Monthly result columns ───────────────────────────────────────────────────

/**
 * Detect columns named "Resultado {Mes}" and return them in month order.
 * These represent the 12 monthly result columns used in indicator tables.
 */
function detectMonthlyResultColumns(headerRow) {
  var monthly = [];
  for (var i = 0; i < headerRow.length; i++) {
    if (!headerRow[i]) continue;
    var h = normalizeForSearch(String(headerRow[i]));
    if (h.indexOf('resultado') === -1) continue;
    for (var m = 0; m < MONTH_NAMES.length; m++) {
      if (h.indexOf(MONTH_NAMES[m]) !== -1) {
        monthly.push({ month: MONTH_NAMES[m], colIndex: i, monthNum: m + 1 });
        break;
      }
    }
  }
  monthly.sort(function(a, b) { return a.monthNum - b.monthNum; });
  return monthly;
}

/**
 * Find the most recent non-empty monthly result (scans December → January).
 */
function getCurrentResultado(row, monthlyColumns) {
  for (var i = monthlyColumns.length - 1; i >= 0; i--) {
    var val = row[monthlyColumns[i].colIndex];
    var n   = parseNumber(val);
    if (n !== null) return { resultado: n, mes: monthlyColumns[i].month, monthNum: monthlyColumns[i].monthNum };
  }
  return { resultado: null, mes: null, monthNum: null };
}

/**
 * Build a historial array from all non-empty monthly columns.
 */
function buildHistorialFromMonthly(row, monthlyColumns) {
  var hist = [];
  for (var i = 0; i < monthlyColumns.length; i++) {
    var val = row[monthlyColumns[i].colIndex];
    var n   = parseNumber(val);
    if (n !== null) hist.push({ fecha: monthlyColumns[i].month, resultado: n });
  }
  return hist;
}

// ─── Row parsing ──────────────────────────────────────────────────────────────

/**
 * Parse a single spreadsheet row into an Indicador object.
 * Returns null for blank or non-indicator rows.
 */
function parseRow(row, colIndex, monthlyColumns, seq) {
  var nombre = getCellValue(row, colIndex, 'nombre');
  if (!nombre || normalizeForSearch(String(nombre)) === 'nan') return null;
  nombre = String(nombre).trim();
  if (!nombre) return null;

  var codigo  = String(getCellValue(row, colIndex, 'codigo') || ('IND-' + seq)).trim();
  var meta    = parseMetaValue(getCellValue(row, colIndex, 'meta'));

  var resultado, fechaResultado, historial;
  if (monthlyColumns.length > 0) {
    var current  = getCurrentResultado(row, monthlyColumns);
    resultado    = current.resultado;
    fechaResultado = current.mes ? (current.mes + ' 2026') : '';
    historial    = buildHistorialFromMonthly(row, monthlyColumns);
  } else {
    resultado    = parseNumber(getCellValue(row, colIndex, 'resultado'));
    fechaResultado = formatCellDate(getCellValue(row, colIndex, 'fecha'));
    historial    = [];
  }

  var porcentaje = (meta && meta !== 0 && resultado !== null)
    ? Math.round((resultado / meta) * 1000) / 10
    : null;

  return {
    codigo:       codigo,
    nombre:       nombre,
    meta:         meta,
    resultado:    resultado,
    unidad:       String(getCellValue(row, colIndex, 'unidad') || '%').trim(),
    responsable:  String(getCellValue(row, colIndex, 'responsable') || '').trim(),
    periodicidad: String(getCellValue(row, colIndex, 'periodicidad') || 'Mensual').trim(),
    fecha:        fechaResultado || formatCellDate(getCellValue(row, colIndex, 'fecha')),
    observacion:  String(getCellValue(row, colIndex, 'observacion') || '').trim(),
    porcentaje:   porcentaje,
    semaforo:     calcSemaforo(porcentaje),
    tendencia:    calcTendencia(historial, resultado),
    historial:    historial,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCellValue(row, colIndex, field) {
  var i = colIndex[field];
  if (i === undefined || i >= row.length) return '';
  var v = row[i];
  if (v === null || v === undefined || v === '') return '';
  return v;
}

/**
 * Parse a number from a cell value.
 * Handles plain numbers, percentage strings ("87.5%"), and JS numbers.
 */
function parseNumber(val) {
  if (val === '' || val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  var str = String(val).replace(/[%\s]/g, '').replace(',', '.');
  var n   = parseFloat(str);
  return isNaN(n) ? null : n;
}

/**
 * Parse a meta/target value, stripping comparison operators and symbols.
 * "≥95%"  → 95
 * "≥0.95" → 0.95
 * "1"     → 1
 */
function parseMetaValue(val) {
  if (val === '' || val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  var str = String(val).replace(/[≥≤≈<>=\s%]/g, '').replace(',', '.');
  var n   = parseFloat(str);
  return isNaN(n) ? null : n;
}

function formatCellDate(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, 'America/El_Salvador', 'yyyy-MM-dd');
  return String(val);
}

function calcSemaforo(porcentaje) {
  if (porcentaje === null) return 'gris';
  if (porcentaje >= 80) return 'verde';
  if (porcentaje >= 60) return 'amarillo';
  return 'rojo';
}

function calcTendencia(historial, resultadoActual) {
  if (!historial || historial.length < 2 || resultadoActual === null) return 'estable';
  var prev = historial[historial.length - 2].resultado;
  if (prev === null) return 'estable';
  if (resultadoActual > prev) return 'subiendo';
  if (resultadoActual < prev) return 'bajando';
  return 'estable';
}
