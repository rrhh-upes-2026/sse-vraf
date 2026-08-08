// ─── Google Sheets → Indicador parser ────────────────────────────────────────

// Column synonym map — fuzzy match Spanish header names
const COL_MAP = {
  codigo:       ['codigo', 'código', 'id', 'clave', 'n°', 'no', 'num'],
  nombre:       ['nombre', 'indicador', 'descripcion', 'descripción', 'detalle'],
  meta:         ['meta', 'objetivo', 'target', 'meta anual', 'valor meta'],
  resultado:    ['resultado', 'valor actual', 'logro', 'real', 'avance', 'valor real'],
  unidad:       ['unidad', 'tipo', 'medida', 'unidad de medida'],
  responsable:  ['responsable', 'encargado', 'jefe', 'jefe de unidad'],
  periodicidad: ['periodicidad', 'frecuencia', 'periodo'],
  fecha:        ['fecha', 'corte', 'fecha de corte', 'fecha corte'],
  observacion:  ['observacion', 'observación', 'nota', 'comentario', 'observaciones'],
};

/**
 * Returns parsed indicator data for a given wsId (unit slug).
 * Uses cache; pass `refresh=true` to force re-read.
 */
function getIndicadores(wsId, refresh) {
  const registry = getRegistry(false);
  const unit = registry.units.find(function(u) { return u.id === wsId; });

  if (!unit) return { error: true, code: 404, message: 'Unidad "' + wsId + '" no encontrada en el registro.' };
  if (!unit.sheetId) return { error: true, code: 404, message: 'La unidad "' + wsId + '" no tiene hoja de indicadores configurada.' };

  const cacheKey = 'indicadores_' + wsId;
  if (refresh) cacheDelete(cacheKey);

  return getCachedOrFetch(cacheKey, TTL.INDICADORES, function() {
    return readIndicadoresSheet(unit.sheetId, wsId, unit.nombre);
  });
}

/**
 * Open the spreadsheet and parse the main indicators tab.
 * Also scans additional tabs named after dates for historical trend data.
 */
function readIndicadoresSheet(sheetId, wsId, unitNombre) {
  const ss          = SpreadsheetApp.openById(sheetId);
  const mainSheet   = findMainSheet(ss);

  if (!mainSheet) {
    return { error: true, code: 422, message: 'No se encontró hoja principal de indicadores en el archivo.' };
  }

  const colIndex    = buildColumnIndex(mainSheet.getRange(1, 1, 1, mainSheet.getLastColumn()).getValues()[0]);
  const historial   = buildHistorial(ss, mainSheet.getName());
  const rows        = mainSheet.getDataRange().getValues();

  const indicadores = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const indicador = parseRow(row, colIndex, historial, r + 1);
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

/**
 * Select the main indicators sheet from the spreadsheet.
 * Prefers a tab whose name contains an indicator keyword; falls back to first tab.
 */
function findMainSheet(ss) {
  const sheets = ss.getSheets();
  if (sheets.length === 0) return null;

  const keywordMatch = sheets.find(function(s) {
    return containsKeyword(s.getName(), INDICADOR_KEYWORDS);
  });
  return keywordMatch || sheets[0];
}

/**
 * Map header cell values to column indices.
 * Returns { fieldName: colIndex (0-based), ... }
 */
function buildColumnIndex(headerRow) {
  const index = {};
  headerRow.forEach(function(header, i) {
    if (!header) return;
    const h = normalizeForSearch(String(header));
    Object.keys(COL_MAP).forEach(function(field) {
      if (index[field] !== undefined) return; // already mapped
      if (COL_MAP[field].some(function(syn) { return h === syn || h.indexOf(syn) !== -1; })) {
        index[field] = i;
      }
    });
  });
  return index;
}

/**
 * Collect historical values from date-named tabs (e.g. "Ene 2025", "2024-12").
 * Returns { codigoIndicador: [{ fecha, resultado }, ...], ... }
 */
function buildHistorial(ss, mainSheetName) {
  const historial   = {};
  const datePattern = /\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|\d{4})/i;

  ss.getSheets().forEach(function(sheet) {
    const name = sheet.getName();
    if (name === mainSheetName) return;
    if (!datePattern.test(name)) return; // skip non-date tabs

    const rows    = sheet.getDataRange().getValues();
    const colIdx  = buildColumnIndex(rows[0] || []);
    for (let r = 1; r < rows.length; r++) {
      const row      = rows[r];
      const codigo   = getCellValue(row, colIdx, 'codigo');
      const resultado = parseNumber(getCellValue(row, colIdx, 'resultado'));
      const fecha    = getCellValue(row, colIdx, 'fecha') || name;
      if (!codigo) continue;
      if (!historial[codigo]) historial[codigo] = [];
      historial[codigo].push({ fecha: String(fecha), resultado: resultado });
    }
  });

  // Sort each indicator's history chronologically
  Object.keys(historial).forEach(function(k) {
    historial[k].sort(function(a, b) { return a.fecha.localeCompare(b.fecha); });
  });

  return historial;
}

/**
 * Parse a single spreadsheet row into an Indicador object.
 * Returns null for blank rows.
 */
function parseRow(row, colIndex, historial, rowNum) {
  const nombre = getCellValue(row, colIndex, 'nombre');
  if (!nombre) return null;

  const codigo    = getCellValue(row, colIndex, 'codigo') || ('IND-' + rowNum);
  const meta      = parseNumber(getCellValue(row, colIndex, 'meta'));
  const resultado = parseNumber(getCellValue(row, colIndex, 'resultado'));

  const porcentaje = (meta && meta !== 0) ? Math.round((resultado / meta) * 1000) / 10 : null;
  const semaforo   = calcSemaforo(porcentaje);
  const hist       = historial[String(codigo)] || [];
  const tendencia  = calcTendencia(hist, resultado);

  return {
    codigo:       String(codigo),
    nombre:       String(nombre),
    meta:         meta,
    resultado:    resultado,
    unidad:       getCellValue(row, colIndex, 'unidad') || '%',
    responsable:  getCellValue(row, colIndex, 'responsable') || '',
    periodicidad: getCellValue(row, colIndex, 'periodicidad') || 'Mensual',
    fecha:        formatCellDate(getCellValue(row, colIndex, 'fecha')),
    observacion:  getCellValue(row, colIndex, 'observacion') || '',
    porcentaje:   porcentaje,
    semaforo:     semaforo,
    tendencia:    tendencia,
    historial:    hist,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCellValue(row, colIndex, field) {
  const i = colIndex[field];
  if (i === undefined || i >= row.length) return '';
  const v = row[i];
  if (v === null || v === undefined || v === '') return '';
  return v;
}

function parseNumber(val) {
  if (val === '' || val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
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
  if (!historial || historial.length < 2) return 'estable';
  const prev = historial[historial.length - 2].resultado;
  if (resultadoActual === null || prev === null) return 'estable';
  if (resultadoActual > prev) return 'subiendo';
  if (resultadoActual < prev) return 'bajando';
  return 'estable';
}
