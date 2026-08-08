// ─── SSE-VRAF Centro de Monitoreo — Google Apps Script Web App ───────────────
// Deploy: Extensions → Apps Script → Deploy → New deployment
//   Type:       Web App
//   Execute as: Me (roberto.reales@upes.edu.sv)
//   Access:     Anyone (even anonymous)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entry point for all HTTP GET requests.
 * Route: ?action=<action>&<params>
 */
function doGet(e) {
  try {
    // Optional Bearer Token auth
    if (!isAuthorized(e)) {
      return errorResponse('Acceso no autorizado. Proporciona un token válido.', 401);
    }

    const action  = (e.parameter && e.parameter.action) || 'health';
    const wsId    = e.parameter && e.parameter.wsId;
    const refresh = e.parameter && e.parameter.refresh === 'true';

    switch (action) {
      case 'health':      return handleHealth();
      case 'registry':    return handleRegistry(refresh);
      case 'indicadores': return handleIndicadores(wsId, refresh);
      case 'evidencias':  return handleEvidencias(wsId, refresh);
      default:
        return errorResponse('Acción desconocida: "' + action + '". Usa: health, registry, indicadores, evidencias.', 400);
    }

  } catch (err) {
    console.error('doGet unhandled error:', err.message, err.stack);
    return errorResponse('Error interno del servidor: ' + err.message, 500);
  }
}

// ─── Route handlers ───────────────────────────────────────────────────────────

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

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Returns true if the request is authorized.
 * If BEARER_TOKEN script property is empty, auth is disabled (open access).
 */
function isAuthorized(e) {
  const expected = getProp('BEARER_TOKEN', '');
  if (!expected) return true; // auth disabled

  const token = (e.parameter && e.parameter.token) ||
                ((e.headers && e.headers['Authorization']) || '').replace(/^Bearer\s+/i, '');

  return token === expected;
}
