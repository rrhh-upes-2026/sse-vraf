/**
 * DocsService — creación y manipulación de Google Docs.
 */
var DocsService = {
  createFromTemplate: function (templateId, replacements, folderId) {
    var copy = DriveApp.getFileById(templateId).makeCopy();
    if (folderId) copy.moveTo(DriveApp.getFolderById(folderId));

    var doc  = DocumentApp.openById(copy.getId());
    var body = doc.getBody();

    if (replacements) {
      Object.keys(replacements).forEach(function (key) {
        body.replaceText("\\{\\{" + key + "\\}\\}", String(replacements[key] !== undefined ? replacements[key] : ""));
      });
    }

    doc.saveAndClose();
    return { id: copy.getId(), url: copy.getUrl(), name: copy.getName() };
  },

  createBlank: function (title, folderId) {
    var doc = DocumentApp.create(title);
    if (folderId) {
      var file = DriveApp.getFileById(doc.getId());
      file.moveTo(DriveApp.getFolderById(folderId));
    }
    return { id: doc.getId(), url: doc.getUrl() };
  },

  getText: function (docId) {
    return DocumentApp.openById(docId).getBody().getText();
  },

  appendText: function (docId, text) {
    var doc = DocumentApp.openById(docId);
    doc.getBody().appendParagraph(text);
    doc.saveAndClose();
  },
};
