/**
 * DriveSetup — idempotent Drive folder initialization.
 *
 * initializeDriveFolders()      — original: workspace folders only.
 * initializeFullDriveHierarchy() — Sprint 13.5: full SSE Platform hierarchy
 *   including system folders (Config, Database, Templates, Documents, Reports,
 *   Evidence, Backups, Logs) plus all 6 workspace sub-folder trees.
 *
 * All functions are idempotent — DriveService.getOrCreateFolder() returns
 * the existing folder if one already exists with that name under the parent.
 *
 * DriveService.getOrCreateFolder(name, parentId) — correct call signature.
 */

/**
 * Public entry point: initialize Drive folders for all six platform workspaces.
 * Calls WorkspaceFolderManager.initWorkspace(wsId) for each workspace.
 *
 * @returns {{ success: boolean, workspacesInitialized: string[], results: Array }}
 */
function initializeDriveFolders() {
  var WORKSPACES = ["rrhh", "vraf", "conta", "compras", "mant", "salud"];
  var results    = [];

  for (var i = 0; i < WORKSPACES.length; i++) {
    var wsId = WORKSPACES[i];
    try {
      var result = WorkspaceFolderManager.initWorkspace(wsId);
      results.push({
        wsId:       wsId,
        status:     "ok",
        folderId:   result.folderId,
        subFolders: result.subFolders,
      });
      AppLogger.info("initializeDriveFolders: workspace initialized", { wsId: wsId });
    } catch (e) {
      AppLogger.error("initializeDriveFolders: failed for workspace", {
        wsId:  wsId,
        error: String((e && e.message) || e),
      });
      results.push({ wsId: wsId, status: "error", error: String((e && e.message) || e) });
    }
  }

  var okCount = 0;
  for (var r = 0; r < results.length; r++) {
    if (results[r].status === "ok") okCount++;
  }

  AppLogger.info("initializeDriveFolders: complete", {
    total: WORKSPACES.length,
    ok:    okCount,
  });

  return {
    success:               true,
    workspacesInitialized: WORKSPACES,
    results:               results,
  };
}

/**
 * Initialize Drive folders for a single workspace on demand.
 * Useful for onboarding a new workspace without re-running the full setup.
 *
 * @param {string} wsId
 * @returns {{ wsId: string, folderId: string, subFolders: Object }}
 */
function initializeWorkspaceFolders(wsId) {
  if (!wsId) throw new Error("initializeWorkspaceFolders: wsId is required");
  return WorkspaceFolderManager.initWorkspace(wsId);
}

/**
 * Full Platform Drive hierarchy initialization.
 *
 * Creates under the root folder (DRIVE_FOLDER_ROOT_ID):
 *   /Config       — script properties exports, environment config
 *   /Database     — spreadsheet exports and backups
 *   /Templates    — platform-wide document templates
 *   /Documents    — platform-level documents not tied to a workspace
 *   /Reports      — automated report outputs
 *   /Evidence     — platform-level evidence archive
 *   /Backups      — automated backup snapshots
 *   /Logs         — exported audit and error logs
 *   /Workspaces/
 *     /RRHH / Contabilidad / Compras / Mantenimiento / Salud y Seguridad / VRAF
 *       each with: Procesos, Documentos, Evidencias, Reportes,
 *                  Plantillas, Archivo, Historial
 *
 * @returns {{
 *   success:       boolean,
 *   rootName:      string,
 *   rootId:        string,
 *   systemFolders: Object,
 *   workspaces:    Array
 * }}
 */
function initializeFullDriveHierarchy() {
  var root = DriveService.getRootFolder();
  var rootId = root.getId();

  // ── System folders ────────────────────────────────────────────────────────
  var SYSTEM_FOLDERS = [
    'Config',
    'Database',
    'Templates',
    'Documents',
    'Reports',
    'Evidence',
    'Backups',
    'Logs',
  ];

  var systemFolders = {};
  for (var s = 0; s < SYSTEM_FOLDERS.length; s++) {
    var name = SYSTEM_FOLDERS[s];
    try {
      var sf = DriveService.getOrCreateFolder(name, rootId);
      systemFolders[name] = sf.getId();
      AppLogger.info('initializeFullDriveHierarchy: system folder', { name: name, id: sf.getId() });
    } catch (e) {
      AppLogger.warn('initializeFullDriveHierarchy: could not create system folder', {
        name:  name,
        error: String((e && e.message) || e),
      });
    }
  }

  // ── Workspaces parent ─────────────────────────────────────────────────────
  var workspacesParent;
  try {
    workspacesParent = DriveService.getOrCreateFolder('Workspaces', rootId);
  } catch (e) {
    AppLogger.error('initializeFullDriveHierarchy: could not create Workspaces folder', {
      error: String((e && e.message) || e),
    });
    throw e;
  }
  var workspacesParentId = workspacesParent.getId();

  // ── Workspace sub-folders ─────────────────────────────────────────────────
  var WS_FOLDERS = [
    { wsId: 'rrhh',    label: 'RRHH' },
    { wsId: 'conta',   label: 'Contabilidad' },
    { wsId: 'compras', label: 'Compras' },
    { wsId: 'mant',    label: 'Mantenimiento' },
    { wsId: 'salud',   label: 'Salud y Seguridad' },
    { wsId: 'vraf',    label: 'VRAF' },
  ];

  var WS_SUB_FOLDERS = [
    'Procesos',
    'Documentos',
    'Evidencias',
    'Reportes',
    'Plantillas',
    'Archivo',
    'Historial',
  ];

  var workspaceResults = [];

  for (var w = 0; w < WS_FOLDERS.length; w++) {
    var ws = WS_FOLDERS[w];
    try {
      var wsFolder = DriveService.getOrCreateFolder(ws.label, workspacesParentId);
      var wsFolderId = wsFolder.getId();
      var subFolderCount = 0;

      for (var f = 0; f < WS_SUB_FOLDERS.length; f++) {
        try {
          DriveService.getOrCreateFolder(WS_SUB_FOLDERS[f], wsFolderId);
          subFolderCount++;
        } catch (subErr) {
          AppLogger.warn('initializeFullDriveHierarchy: sub-folder error', {
            wsId:   ws.wsId,
            folder: WS_SUB_FOLDERS[f],
            error:  String((subErr && subErr.message) || subErr),
          });
        }
      }

      workspaceResults.push({
        wsId:          ws.wsId,
        label:         ws.label,
        folderId:      wsFolderId,
        subFolderCount: subFolderCount,
        status:        'ok',
      });

      AppLogger.info('initializeFullDriveHierarchy: workspace done', {
        wsId:  ws.wsId,
        subs:  subFolderCount,
      });
    } catch (e) {
      workspaceResults.push({
        wsId:   ws.wsId,
        label:  ws.label,
        status: 'error',
        error:  String((e && e.message) || e),
      });
      AppLogger.error('initializeFullDriveHierarchy: workspace error', {
        wsId:  ws.wsId,
        error: String((e && e.message) || e),
      });
    }
  }

  AppLogger.info('initializeFullDriveHierarchy: complete', {
    systemFolders: Object.keys(systemFolders).length,
    workspaces:    workspaceResults.length,
  });

  return {
    success:       true,
    rootName:      root.getName(),
    rootId:        rootId,
    systemFolders: systemFolders,
    workspaces:    workspaceResults,
  };
}
