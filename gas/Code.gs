// ─── SSE-VRAF Centro de Monitoreo — Google Apps Script Web App ───────────────
// Deploy: Extensions → Apps Script → Deploy → New deployment
//   Type:       Web App
//   Execute as: Me (roberto.reales@upes.edu.sv)
//   Access:     Anyone (even anonymous)
//
// Script Properties required:
//   ROOT_FOLDER_ID  — ID of the root Drive folder containing unit subfolders
//   WRITE_KEY       — Secret key for write operations (doPost). Set any value.
//                     Add the same value as GAS_WRITE_KEY in Vercel env vars.
//   BEARER_TOKEN    — (optional) Token for read auth. Leave empty to allow open reads.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entry point for all HTTP GET requests (reads).
 * Route: ?action=<action>&<params>
 */
function doGet(e) {
  try {
    if (!isAuthorized(e)) {
      return errorResponse('Acceso no autorizado. Proporciona un token válido.', 401);
    }

    const action  = (e.parameter && e.parameter.action) || 'health';
    const wsId    = e.parameter && e.parameter.wsId;
    const refresh = e.parameter && e.parameter.refresh === 'true';

    switch (action) {
      case 'health':         return handleHealth();
      case 'registry':       return handleRegistry(refresh);
      case 'indicadores':    return handleIndicadores(wsId, refresh);
      case 'evidencias':     return handleEvidencias(wsId, refresh);
      case 'reportes':       return handleReportes(wsId, refresh);
      case 'debug':          return handleDebug(wsId);
      default:
        return errorResponse('Acción desconocida: "' + action + '". Usa: health, registry, indicadores, evidencias, reportes.', 400);
    }

  } catch (err) {
    console.error('doGet unhandled error:', err.message, err.stack);
    return errorResponse('Error interno del servidor: ' + err.message, 500);
  }
}

/**
 * Entry point for all HTTP POST requests (writes).
 * Body (JSON): { action, writeKey, ...params }
 */
function doPost(e) {
  try {
    var body = {};
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return errorResponse('Body JSON inválido.', 400);
    }

    if (!isAuthorizedWrite(body)) {
      return errorResponse('No autorizado para escritura. Verifica el WRITE_KEY.', 401);
    }

    var action = body.action;

    switch (action) {
      case 'updateIndicador': return handleUpdateIndicador(body);
      default:
        return errorResponse('Acción desconocida: "' + action + '". Usa: updateIndicador.', 400);
    }

  } catch (err) {
    console.error('doPost unhandled error:', err.message, err.stack);
    return errorResponse('Error interno del servidor: ' + err.message, 500);
  }
}

// ─── Route handlers (reads) ───────────────────────────────────────────────────

function handleHealth() {
  return jsonResponse({
    status:    'ok',
    version:   VERSION,
    timestamp: toISO(new Date()),
    project:   'SSE-VRAF Centro de Monitoreo',
  });
}

function handleRegistry(refresh) {
  const data = getRegistry(refresh);
  if (data && data.error) return errorResponse(data.message, data.code);
  return jsonResponse(data);
}

function handleIndicadores(wsId, refresh) {
  if (!wsId) return errorResponse('Parámetro requerido: wsId', 400);
  const data = getIndicadores(wsId, refresh);
  if (data && data.error) return errorResponse(data.message, data.code);
  return jsonResponse(data);
}

function handleEvidencias(wsId, refresh) {
  if (!wsId) return errorResponse('Parámetro requerido: wsId', 400);
  const data = getEvidencias(wsId, refresh);
  if (data && data.error) return errorResponse(data.message, data.code);
  return jsonResponse(data);
}

function handleReportes(wsId, refresh) {
  if (!wsId) return errorResponse('Parámetro requerido: wsId', 400);
  const data = getReportes(wsId, refresh);
  if (data && data.error) return errorResponse(data.message, data.code);
  return jsonResponse(data);
}

function handleDebug(wsId) {
  if (!wsId) return errorResponse('Parámetro requerido: wsId', 400);
  var registry = getRegistry(false);
  var unit = null;
  for (var i = 0; i < registry.units.length; i++) {
    if (registry.units[i].id === wsId) { unit = registry.units[i]; break; }
  }
  if (!unit) return errorResponse('Unidad no encontrada: ' + wsId, 404);

  var info = {
    wsId:              wsId,
    unitEncontrada:    true,
    nombre:            unit.nombre,
    folderId:          unit.folderId,
    sheetId:           unit.sheetId,
    evidenciaFolderId: unit.evidenciaFolderId,
    reportesFolderId:  unit.reportesFolderId,
    estructura:        null,
  };

  if (unit.evidenciaFolderId) {
    try {
      var root = DriveApp.getFolderById(unit.evidenciaFolderId);
      var areas = collectFolders(root);
      info.estructura = {
        rootNombre: root.getName(),
        archivosDirectos: collectFiles(root).length,
        areas: areas.map(function(af) {
          var inds = collectFolders(af);
          var directFiles = collectFiles(af).length;
          return {
            nombre: af.getName(),
            archivosDirectos: directFiles,
            indicadores: inds.map(function(inf) {
              var meses = collectFolders(inf);
              var indFiles = collectFiles(inf).length;
              return {
                nombre: inf.getName(),
                archivosDirectos: indFiles,
                meses: meses.map(function(mf) {
                  return { nombre: mf.getName(), archivos: collectFiles(mf).length };
                }),
              };
            }),
          };
        }),
      };
    } catch (e) {
      info.errorEstructura = e.message;
    }
  }

  return jsonResponse(info);
}


// ─── Route handlers (writes) ──────────────────────────────────────────────────

function handleUpdateIndicador(body) {
  var wsId        = body.wsId;
  var indicadorId = body.indicadorId;
  var campo       = body.campo;
  var valor       = String(body.valor || '');

  if (!wsId || !indicadorId || !campo) {
    return errorResponse('Parámetros requeridos: wsId, indicadorId, campo', 400);
  }
  if (campo !== 'descripcion' && campo !== 'formula') {
    return errorResponse('Campo no soportado. Valores válidos: descripcion, formula', 400);
  }

  var result = updateIndicadorField(wsId, indicadorId, campo, valor);
  if (result && result.error) return errorResponse(result.message, result.code);
  return jsonResponse(result);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Read auth: open if BEARER_TOKEN is empty, else validates token.
 */
function isAuthorized(e) {
  const expected = getProp('BEARER_TOKEN', '');
  if (!expected) return true;

  const token = (e.parameter && e.parameter.token) ||
                ((e.headers && e.headers['Authorization']) || '').replace(/^Bearer\s+/i, '');
  return token === expected;
}

/**
 * Write auth: requires WRITE_KEY to be set and to match body.writeKey.
 * If WRITE_KEY script property is empty, all writes are rejected.
 */
function isAuthorizedWrite(body) {
  var expected = getProp('WRITE_KEY', '');
  if (!expected) return false; // writes disabled when no key configured
  return body.writeKey === expected;
}
