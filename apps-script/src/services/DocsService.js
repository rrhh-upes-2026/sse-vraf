/**
 * DocsService — Google Docs template engine.
 *
 * Provides copy-from-template, variable merging, PDF export, and
 * scratch-document creation. All Drive operations delegate to DriveApp;
 * no SpreadsheetApp calls appear here.
 *
 * All public methods throw on unrecoverable errors so callers can wrap in
 * try/catch and surface meaningful messages through the router.
 */
var DocsService = {

  /**
   * Create a Google Doc by copying a template Doc and merging variables.
   *
   * @param {string} templateDocId   — Drive file id of the source template Doc
   * @param {Object} variables       — plain object: { key: value } for {{key}} replacement
   * @param {string} destFolderId    — destination Drive folder id
   * @param {string} fileName        — name for the new document (without extension)
   * @returns {{ id: string, name: string, webViewLink: string }}
   */
  createFromTemplate: function (templateDocId, variables, destFolderId, fileName) {
    if (!templateDocId) throw new Error("DocsService.createFromTemplate: templateDocId is required");
    if (!fileName)      throw new Error("DocsService.createFromTemplate: fileName is required");

    var destFolder = destFolderId
      ? DriveApp.getFolderById(destFolderId)
      : DriveApp.getRootFolder();

    var copy;
    try {
      copy = DriveApp.getFileById(templateDocId).makeCopy(fileName, destFolder);
    } catch (e) {
      AppLogger.error("DocsService.createFromTemplate: makeCopy failed", {
        templateDocId: templateDocId,
        error: String(e.message || e),
      });
      throw e;
    }

    var doc;
    try {
      doc = DocumentApp.openById(copy.getId());
    } catch (e) {
      AppLogger.error("DocsService.createFromTemplate: openById failed", {
        copyId: copy.getId(),
        error: String(e.message || e),
      });
      // Clean up orphaned copy
      try { copy.setTrashed(true); } catch (_) {}
      throw e;
    }

    if (variables && typeof variables === "object") {
      DocsService.mergeVariables(doc, variables);
    }

    doc.saveAndClose();

    AppLogger.info("DocsService.createFromTemplate: document created", {
      templateDocId: templateDocId,
      copyId:        copy.getId(),
      fileName:      fileName,
    });

    return {
      id:          copy.getId(),
      name:        copy.getName(),
      webViewLink: copy.getUrl(),
    };
  },

  /**
   * Replace {{variable}} placeholders throughout a document's body.
   * Handles paragraphs and table cells.
   *
   * @param {GoogleAppsScript.Document.Document} doc
   * @param {Object} variables — { key: value }
   */
  mergeVariables: function (doc, variables) {
    if (!doc || !variables) return;

    var body = doc.getBody();

    for (var key in variables) {
      if (!Object.prototype.hasOwnProperty.call(variables, key)) continue;

      var placeholder = "\\{\\{" + key + "\\}\\}";
      var value       = variables[key] !== null && variables[key] !== undefined
        ? String(variables[key])
        : "";

      // Replace in paragraphs
      var paragraphs = body.getParagraphs();
      for (var i = 0; i < paragraphs.length; i++) {
        paragraphs[i].replaceText(placeholder, value);
      }

      // Replace in table cells
      var tables = body.getTables();
      for (var t = 0; t < tables.length; t++) {
        var table = tables[t];
        for (var r = 0; r < table.getNumRows(); r++) {
          var row = table.getRow(r);
          for (var c = 0; c < row.getNumCells(); c++) {
            row.getCell(c).replaceText(placeholder, value);
          }
        }
      }
    }

    AppLogger.debug("DocsService.mergeVariables: variables merged", {
      keys: Object.keys(variables).length,
    });
  },

  /**
   * Export a Google Doc as PDF and save the blob to a Drive folder.
   *
   * @param {string} docId          — Drive file id of the Google Doc
   * @param {string} destFolderId   — destination Drive folder id
   * @param {string} fileName       — PDF file name (with or without .pdf; .pdf is appended if missing)
   * @returns {{ id: string, name: string, mimeType: string, size: number, webViewLink: string }}
   */
  exportAsPdf: function (docId, destFolderId, fileName) {
    if (!docId)   throw new Error("DocsService.exportAsPdf: docId is required");
    if (!fileName) throw new Error("DocsService.exportAsPdf: fileName is required");

    var pdfName = fileName.slice(-4).toLowerCase() === ".pdf" ? fileName : fileName + ".pdf";

    var destFolder = destFolderId
      ? DriveApp.getFolderById(destFolderId)
      : DriveApp.getRootFolder();

    var blob;
    try {
      blob = DriveApp.getFileById(docId).getAs("application/pdf");
    } catch (e) {
      AppLogger.error("DocsService.exportAsPdf: getAs(pdf) failed", {
        docId: docId,
        error: String(e.message || e),
      });
      throw e;
    }

    blob.setName(pdfName);

    var pdfFile;
    try {
      pdfFile = destFolder.createFile(blob);
    } catch (e) {
      AppLogger.error("DocsService.exportAsPdf: createFile failed", {
        docId:  docId,
        folder: destFolderId,
        error:  String(e.message || e),
      });
      throw e;
    }

    AppLogger.info("DocsService.exportAsPdf: PDF created", {
      docId:     docId,
      pdfFileId: pdfFile.getId(),
      pdfName:   pdfName,
    });

    return {
      id:          pdfFile.getId(),
      name:        pdfFile.getName(),
      mimeType:    "application/pdf",
      size:        pdfFile.getSize(),
      webViewLink: pdfFile.getUrl(),
    };
  },

  /**
   * Create a Google Doc from scratch with a given title and plain-text body.
   * Useful for generating simple reports without a template.
   *
   * @param {string} title         — document title
   * @param {string} bodyText      — plain text to insert as body content
   * @param {string} destFolderId  — destination Drive folder id (optional)
   * @returns {{ id: string, name: string, webViewLink: string }}
   */
  createDoc: function (title, bodyText, destFolderId) {
    if (!title) throw new Error("DocsService.createDoc: title is required");

    var doc;
    try {
      doc = DocumentApp.create(title);
    } catch (e) {
      AppLogger.error("DocsService.createDoc: DocumentApp.create failed", {
        title: title,
        error: String(e.message || e),
      });
      throw e;
    }

    if (bodyText) {
      doc.getBody().setText(bodyText);
    }

    doc.saveAndClose();

    var file = DriveApp.getFileById(doc.getId());

    // Move to destination folder if provided
    if (destFolderId) {
      try {
        var destFolder = DriveApp.getFolderById(destFolderId);
        file.moveTo(destFolder);
      } catch (e) {
        AppLogger.warn("DocsService.createDoc: moveTo failed, file remains in root", {
          docId:  doc.getId(),
          folder: destFolderId,
          error:  String(e.message || e),
        });
      }
    }

    AppLogger.info("DocsService.createDoc: document created", {
      title: title,
      id:    file.getId(),
    });

    return {
      id:          file.getId(),
      name:        file.getName(),
      webViewLink: file.getUrl(),
    };
  },
};
