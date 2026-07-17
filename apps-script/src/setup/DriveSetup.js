/**
 * DriveSetup — idempotent Drive folder initialization.
 *
 * Run initializeDriveFolders() once from the GAS editor to create the full
 * workspace folder hierarchy under the root folder configured by
 * DRIVE_FOLDER_ROOT_ID. Safe to re-run — WorkspaceFolderManager.initWorkspace()
 * uses getOrCreateFolder() which does nothing if a folder already exists.
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
