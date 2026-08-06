/**
 * DriveService — gestión de archivos y carpetas en Google Drive.
 */
var DriveService = {
  getOrCreateFolder: function (name, parentId) {
    var parent = parentId ? DriveApp.getFolderById(parentId) : DriveApp.getRootFolder();
    var iter   = parent.getFoldersByName(name);
    return iter.hasNext() ? iter.next() : parent.createFolder(name);
  },

  createFolder: function (name, parentId) {
    var parent = parentId ? DriveApp.getFolderById(parentId) : DriveApp.getRootFolder();
    return parent.createFolder(name);
  },

  getFile: function (fileId) {
    return DriveApp.getFileById(fileId);
  },

  copyFile: function (fileId, newName, folderId) {
    var file = DriveApp.getFileById(fileId);
    var copy = file.makeCopy(newName || file.getName());
    if (folderId) copy.moveTo(DriveApp.getFolderById(folderId));
    return { id: copy.getId(), url: copy.getUrl(), name: copy.getName() };
  },

  moveFile: function (fileId, folderId) {
    DriveApp.getFileById(fileId).moveTo(DriveApp.getFolderById(folderId));
  },

  deleteFile: function (fileId) {
    DriveApp.getFileById(fileId).setTrashed(true);
  },

  addEditor: function (fileId, email) {
    DriveApp.getFileById(fileId).addEditor(email);
  },

  addViewer: function (fileId, email) {
    DriveApp.getFileById(fileId).addViewer(email);
  },

  listFiles: function (folderId) {
    var folder = DriveApp.getFolderById(folderId);
    var files  = folder.getFiles();
    var result = [];
    while (files.hasNext()) {
      var f = files.next();
      result.push({ id: f.getId(), name: f.getName(), url: f.getUrl(), mimeType: f.getMimeType() });
    }
    return result;
  },
};
