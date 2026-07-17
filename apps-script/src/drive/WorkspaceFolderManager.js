/**
 * WorkspaceFolderManager — auto-creates and resolves the canonical Drive folder
 * hierarchy for each workspace under the SSE-VRAF root.
 *
 * Standard structure (all relative to the root returned by DriveService.getRootFolder()):
 *
 *   SSE-VRAF/                   ← DRIVE_FOLDER_ROOT_ID
 *     {wsId}/
 *       Empleados/
 *         {userId}/
 *       Procesos/
 *         {blueprintId}/
 *       Documentos/
 *       Formularios/
 *       Plantillas/
 *       Reportes/
 *       _archivo/
 *
 * All Drive access is delegated to DriveService — this file never calls DriveApp
 * directly. Folder creation is idempotent: if a folder already exists with the
 * given name inside the parent it is returned without creating a duplicate.
 *
 * DriveService.getOrCreateFolder(name, parentId) signature:
 *   name      — string, the folder name
 *   parentId  — string Drive folder ID, or null for My Drive root
 */

var WorkspaceFolderManager = {

  // ---------------------------------------------------------------------------
  // Workspace root
  // ---------------------------------------------------------------------------

  /**
   * Get (or create) the workspace root folder: SSE-VRAF/{wsId}/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getWorkspaceFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getWorkspaceFolder: wsId is required");
    var root = DriveService.getRootFolder();
    return DriveService.getOrCreateFolder(String(wsId), root.getId());
  },

  // ---------------------------------------------------------------------------
  // Sub-folders
  // ---------------------------------------------------------------------------

  /**
   * SSE-VRAF/{wsId}/Empleados/{userId}/
   *
   * @param {string} wsId
   * @param {string} userId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getEmployeeFolder: function (wsId, userId) {
    if (!wsId || !userId) {
      throw new Error("WorkspaceFolderManager.getEmployeeFolder: wsId and userId are required");
    }
    var wsFolder        = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    var empleadosFolder = DriveService.getOrCreateFolder("Empleados", wsFolder.getId());
    return DriveService.getOrCreateFolder(String(userId), empleadosFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Procesos/{blueprintId}/
   *
   * @param {string} wsId
   * @param {string} blueprintId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getProcessFolder: function (wsId, blueprintId) {
    if (!wsId || !blueprintId) {
      throw new Error("WorkspaceFolderManager.getProcessFolder: wsId and blueprintId are required");
    }
    var wsFolder       = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    var procesosFolder = DriveService.getOrCreateFolder("Procesos", wsFolder.getId());
    return DriveService.getOrCreateFolder(String(blueprintId), procesosFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Documentos/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getDocumentsFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getDocumentsFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Documentos", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Formularios/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getFormsFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getFormsFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Formularios", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Procedimientos/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getProcedimientosFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getProcedimientosFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Procedimientos", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Evidencias/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getEvidenciasFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getEvidenciasFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Evidencias", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Plantillas/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getTemplatesFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getTemplatesFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Plantillas", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Reportes/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getReportsFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getReportsFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Reportes", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/_archivo/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getArchiveFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getArchiveFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("_archivo", wsFolder.getId());
  },

  // ---------------------------------------------------------------------------
  // Full workspace initialisation
  // ---------------------------------------------------------------------------

  /**
   * Create the full standard folder hierarchy for a workspace in one shot.
   * Safe to call multiple times — existing folders are reused (idempotent).
   *
   * @param {string} wsId
   * @returns {{ wsId: string, folderId: string, subFolders: Object.<string,string> }}
   */
  initWorkspace: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.initWorkspace: wsId is required");

    AppLogger.info("WorkspaceFolderManager.initWorkspace: start", { wsId: wsId });

    var wsFolder   = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    var wsFolderId = wsFolder.getId();

    var SUB_FOLDERS = [
      "Empleados",
      "Procesos",
      "Procedimientos",
      "Formularios",
      "Evidencias",
      "Documentos",
      "Plantillas",
      "Reportes",
      "_archivo",
    ];

    var subFolders = {};
    for (var i = 0; i < SUB_FOLDERS.length; i++) {
      var name   = SUB_FOLDERS[i];
      var folder = DriveService.getOrCreateFolder(name, wsFolderId);
      subFolders[name] = folder.getId();
    }

    AppLogger.info("WorkspaceFolderManager.initWorkspace: complete", {
      wsId:       wsId,
      folderId:   wsFolderId,
      subFolders: subFolders,
    });

    return {
      wsId:       wsId,
      folderId:   wsFolderId,
      subFolders: subFolders,
    };
  },

  // ---------------------------------------------------------------------------
  // Document upload
  // ---------------------------------------------------------------------------

  /**
   * Upload a base64-encoded file to SSE-VRAF/{wsId}/Documentos/ and return
   * Drive file metadata. Delegates all Drive I/O to DriveService.
   *
   * @param {string} wsId
   * @param {string} base64Data
   * @param {string} fileName
   * @param {string} mimeType
   * @returns {{ id, name, mimeType, size, webViewLink, createdTime, modifiedTime }}
   */
  uploadDocument: function (wsId, base64Data, fileName, mimeType) {
    if (!wsId || !base64Data || !fileName) {
      throw new Error(
        "WorkspaceFolderManager.uploadDocument: wsId, base64Data and fileName are required"
      );
    }

    var docsFolder = WorkspaceFolderManager.getDocumentsFolder(wsId);
    var metadata   = DriveService.uploadBase64File(
      base64Data,
      fileName,
      mimeType || "application/octet-stream",
      docsFolder.getId()
    );

    AppLogger.info("WorkspaceFolderManager.uploadDocument: uploaded", {
      wsId:     wsId,
      fileName: fileName,
      fileId:   metadata.id,
    });

    return metadata;
  },
};
