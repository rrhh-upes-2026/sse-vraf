/**
 * Resource abstraction layer — the rest of the application works with
 * "Resources" (institutional evidence assets), not with raw Drive files or
 * raw Evidencia rows. ResourceService is the single point that coordinates
 * between the Evidencias sheet (metadata) and DriveService (physical storage).
 *
 * Rule enforced here:
 *   §08 — Evidence files always live in Drive. Sheets stores only metadata
 *   (driveFileId, webViewLink, version, etc.). ResourceService is the only
 *   place that knows both sides.
 *
 * File upload (base64 over HTTPS) is wired to the router in the Evidencias
 * sprint. For Sprint 2 the service is complete; the route action is defined
 * but the frontend doesn't call it yet.
 */
var ResourceService = {
  /**
   * Create a new resource: optionally upload a file to Drive, then write the
   * Evidencia row to Sheets with the resulting driveFileId.
   *
   * @param {Object} evidenciaData — Evidencia fields (id will be generated if absent)
   * @param {Object} [file]         — optional file to upload
   * @param {string} file.base64Data
   * @param {string} file.fileName
   * @param {string} file.mimeType
   * @returns {Object} created Evidencia record
   */
  create: function (evidenciaData, file) {
    var record = Object.assign({}, evidenciaData);
    record.id     = record.id     || IdGen.uuid();
    record.estado = record.estado || "pendiente";
    record.version = record.version || "1.0";
    record.fechaCarga = record.fechaCarga || new Date().toISOString();

    if (file && file.base64Data) {
      var folderId = DriveService.getEvidenceFolderId({
        unidadId:  evidenciaData.unidadId  || "general",
        procesoId: evidenciaData.procesoId || "general",
      });
      var uploaded = DriveService.uploadBase64File(
        file.base64Data,
        file.fileName || record.nombre || "evidencia",
        file.mimeType || "application/octet-stream",
        folderId,
      );
      record.driveFileId     = uploaded.id;
      record.driveWebViewLink = uploaded.webViewLink;
    }

    return createEntity_("evidencias", record);
  },

  /**
   * Get an Evidencia record, optionally enriching it with live Drive metadata.
   * Drive enrichment is opt-in because it makes an extra API call.
   *
   * @param {string} evidenciaId
   * @param {boolean} [enrichWithDrive=false]
   * @returns {Object|null}
   */
  get: function (evidenciaId, enrichWithDrive) {
    var record = getEntity_("evidencias", evidenciaId);
    if (!record) return null;

    if (enrichWithDrive && record.driveFileId) {
      try {
        record._driveMetadata = DriveService.getFileMetadata(record.driveFileId);
      } catch (err) {
        AppLogger.warn("ResourceService.get: Drive file not accessible", {
          driveFileId: record.driveFileId,
          error: String((err && err.message) || err),
        });
      }
    }
    return record;
  },

  /**
   * Update an Evidencia record's metadata fields.
   * driveFileId is protected — use ResourceService.replaceFile() to swap the file.
   *
   * @param {string} evidenciaId
   * @param {Object} patch
   * @returns {Object} updated record
   */
  update: function (evidenciaId, patch) {
    var safePatch = Object.assign({}, patch);
    delete safePatch.id;
    delete safePatch.driveFileId;
    return updateEntity_("evidencias", evidenciaId, safePatch);
  },

  /**
   * Archive a resource: move the Drive file to _archivo/ and mark the record.
   *
   * @param {string} evidenciaId
   * @returns {Object} updated Evidencia record
   */
  archive: function (evidenciaId) {
    var record = getEntity_("evidencias", evidenciaId);
    if (!record) throw new Error("Evidencia " + evidenciaId + " not found");

    if (record.driveFileId) {
      DriveService.archiveFile(record.driveFileId);
    }

    return updateEntity_("evidencias", evidenciaId, { estado: "archivado" });
  },

  /**
   * Replace the physical file attached to an Evidencia record, incrementing
   * the version number and uploading the new file to Drive.
   *
   * @param {string} evidenciaId
   * @param {Object} file
   * @param {string} file.base64Data
   * @param {string} file.fileName
   * @param {string} file.mimeType
   * @returns {Object} updated Evidencia record
   */
  replaceFile: function (evidenciaId, file) {
    var record = getEntity_("evidencias", evidenciaId);
    if (!record) throw new Error("Evidencia " + evidenciaId + " not found");

    // Archive old file before replacing
    if (record.driveFileId) {
      try { DriveService.archiveFile(record.driveFileId); } catch (e) { /* best-effort */ }
    }

    var folderId = DriveService.getEvidenceFolderId({
      unidadId:  record.unidadId  || "general",
      procesoId: record.procesoId || "general",
    });
    var uploaded = DriveService.uploadBase64File(
      file.base64Data,
      file.fileName || record.nombre || "evidencia",
      file.mimeType || "application/octet-stream",
      folderId,
    );

    var versionParts = String(record.version || "1.0").split(".");
    var newVersion = (parseInt(versionParts[0], 10) || 1) + 1 + ".0";

    return updateEntity_("evidencias", evidenciaId, {
      driveFileId:      uploaded.id,
      driveWebViewLink: uploaded.webViewLink,
      version:          newVersion,
      fechaCarga:       new Date().toISOString(),
    });
  },
};
