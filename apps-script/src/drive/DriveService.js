/**
 * Google Drive abstraction layer. Nothing outside this file calls DriveApp
 * directly — all Drive operations go through DriveService. This is the
 * enforcement point for the "files always in Drive, metadata only in Sheets"
 * rule from MASTER HANDOFF §08.
 *
 * Standard folder structure under the configured root:
 *   /SSE-VRAF/                             ← DRIVE_FOLDER_ROOT_ID (or auto-created)
 *     Evidencias/
 *       {unidadId}/
 *         {yyyy}/
 *           {procesoId}/
 *     _archivo/                            ← archived files (recoverable)
 *
 * All methods throw on error — callers can trust the return value is valid.
 */
var DriveService = {
  /**
   * Get the configured root folder. If DRIVE_FOLDER_ROOT_ID is not set,
   * creates "SSE-VRAF" in My Drive root (dev fallback only).
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getRootFolder: function () {
    var rootId = Config.driveFolderRootId();
    if (rootId) return DriveApp.getFolderById(rootId);
    return DriveService.getOrCreateFolder("SSE-VRAF", null);
  },

  /**
   * Get an existing folder by name inside a parent, or create it.
   * @param {string} name
   * @param {string|null} parentId — null means My Drive root
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getOrCreateFolder: function (name, parentId) {
    var parent = parentId ? DriveApp.getFolderById(parentId) : DriveApp.getRootFolder();
    var iter = parent.getFoldersByName(name);
    if (iter.hasNext()) return iter.next();
    AppLogger.info("DriveService: creating folder", { name: name, parentId: parentId });
    return parent.createFolder(name);
  },

  /**
   * Navigate and create a nested folder path, starting from a root folder.
   * @param {string[]} pathParts — e.g. ["Evidencias", "vraf", "2026", "PROC-001"]
   * @param {string|null} rootFolderId — null means My Drive root
   * @returns {GoogleAppsScript.Drive.Folder} the deepest folder
   */
  getOrCreateFolderPath: function (pathParts, rootFolderId) {
    var current = rootFolderId
      ? DriveApp.getFolderById(rootFolderId)
      : DriveApp.getRootFolder();

    for (var i = 0; i < pathParts.length; i++) {
      var part = String(pathParts[i] || "").trim();
      if (!part) continue;
      var iter = current.getFoldersByName(part);
      current = iter.hasNext() ? iter.next() : current.createFolder(part);
    }
    return current;
  },

  /**
   * Upload a file from a base64-encoded string to Drive.
   * @param {string} base64Data
   * @param {string} fileName
   * @param {string} mimeType
   * @param {string} folderId
   * @returns {{ id, name, mimeType, size, webViewLink, createdTime, modifiedTime }}
   */
  uploadBase64File: function (base64Data, fileName, mimeType, folderId) {
    var bytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, fileName);
    var folder = DriveApp.getFolderById(folderId);
    var file = folder.createFile(blob);
    AppLogger.info("DriveService: file uploaded", { id: file.getId(), name: fileName });
    return DriveService.getFileMetadata(file.getId());
  },

  /**
   * Return a plain-object summary of a Drive file's metadata.
   * @param {string} fileId
   * @returns {{ id, name, mimeType, size, webViewLink, createdTime, modifiedTime, trashed }}
   */
  getFileMetadata: function (fileId) {
    var file = DriveApp.getFileById(fileId);
    return {
      id:           file.getId(),
      name:         file.getName(),
      mimeType:     file.getMimeType(),
      size:         file.getSize(),
      webViewLink:  file.getUrl(),
      createdTime:  file.getDateCreated().toISOString(),
      modifiedTime: file.getLastUpdated().toISOString(),
      trashed:      file.isTrashed(),
    };
  },

  /**
   * Grant viewer access to a Google account.
   * @param {string} fileId
   * @param {string} email
   */
  setViewerPermission: function (fileId, email) {
    DriveApp.getFileById(fileId).addViewer(email);
  },

  /**
   * Grant editor access to a Google account.
   * @param {string} fileId
   * @param {string} email
   */
  setEditorPermission: function (fileId, email) {
    DriveApp.getFileById(fileId).addEditor(email);
  },

  /**
   * Revoke a user's viewer and editor access to a file.
   * @param {string} fileId
   * @param {string} email
   */
  removePermission: function (fileId, email) {
    var file = DriveApp.getFileById(fileId);
    file.removeViewer(email);
    file.removeEditor(email);
  },

  /**
   * Move a file to the _archivo/ folder under the SSE-VRAF root.
   * The file stays in Drive and is recoverable.
   * @param {string} fileId
   * @returns {{ id, name, webViewLink }}
   */
  archiveFile: function (fileId) {
    var root = DriveService.getRootFolder();
    var archiveFolder = DriveService.getOrCreateFolder("_archivo", root.getId());
    var file = DriveApp.getFileById(fileId);
    file.moveTo(archiveFolder);
    AppLogger.info("DriveService: file archived", { id: fileId });
    return {
      id:          file.getId(),
      name:        file.getName(),
      webViewLink: file.getUrl(),
    };
  },

  /**
   * Send a file to the Drive trash (recoverable within 30 days).
   * @param {string} fileId
   */
  trashFile: function (fileId) {
    DriveApp.getFileById(fileId).setTrashed(true);
    AppLogger.info("DriveService: file trashed", { id: fileId });
  },

  /**
   * Build (and create if needed) the standard evidence folder path for a proceso.
   * @param {Object} opts
   * @param {string} opts.unidadId
   * @param {string} opts.procesoId
   * @param {number} [opts.year]   — defaults to current year
   * @returns {string} folderId of the deepest folder
   */
  getEvidenceFolderId: function (opts) {
    var year = String(opts.year || new Date().getFullYear());
    var root = DriveService.getRootFolder();
    var folder = DriveService.getOrCreateFolderPath(
      ["Evidencias", opts.unidadId || "general", year, opts.procesoId || "general"],
      root.getId(),
    );
    return folder.getId();
  },
};
