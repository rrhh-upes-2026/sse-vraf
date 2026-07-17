/**
 * WorkspaceController — specialized lifecycle and operational actions for
 * workspace-admin entities that go beyond generic CRUD.
 *
 * Delegates all persistence to the SheetRepository primitives
 * (createEntity_, getEntity_, updateEntity_, listEntities_) and never calls
 * SpreadsheetApp directly. Every mutating method records an AuditService entry
 * and emits the appropriate EventDispatcher event.
 *
 * Lifecycle model:  draft → published → archived → (restore → draft)
 *                                     ↓
 *                                  deprecated
 */

var WorkspaceController = {

  // ---------------------------------------------------------------------------
  // Lifecycle transitions
  // ---------------------------------------------------------------------------

  /**
   * Publish a versioned entity.
   * Increments version, sets lifecycle = 'published', writes a VersionRecord
   * to historyJson, and emits a publish event.
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   * @returns {Object} updated record
   */
  publish: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var now = new Date().toISOString();
    var history = WorkspaceController._parseJson_(record.historyJson, []);
    var newVersion = (parseInt(record.version, 10) || 0) + 1;

    history.push({
      version:   newVersion,
      changedBy: userId || "",
      changedAt: now,
      summary:   "Publicado v" + newVersion,
      lifecycle: "published",
    });

    var patch = {
      lifecycle:        "published",
      version:          newVersion,
      publishedVersion: newVersion,
      historyJson:      JSON.stringify(history),
      updatedAt:        now,
    };

    var updated = updateEntity_(entityName, id, patch);

    AuditService.record({
      accion:      entityName + ".publish",
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
      detalle:     { version: newVersion },
    });

    var eventKey = WorkspaceController._publishEventKey_(entityName);
    if (eventKey && EVENT_TYPES[eventKey]) {
      EventDispatcher.emit(EVENT_TYPES[eventKey], {
        entityName: entityName,
        id:         id,
        version:    newVersion,
        userId:     userId,
      });
    }

    AppLogger.info("WorkspaceController.publish", {
      entityName: entityName,
      id:         id,
      version:    newVersion,
    });
    return updated;
  },

  /**
   * Archive an entity (lifecycle → 'archived').
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   * @returns {Object} updated record
   */
  archive: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var now     = new Date().toISOString();
    var history = WorkspaceController._parseJson_(record.historyJson, []);
    var version = parseInt(record.version, 10) || 1;

    history.push({
      version:   version,
      changedBy: userId || "",
      changedAt: now,
      summary:   "Archivado",
      lifecycle: "archived",
    });

    var updated = updateEntity_(entityName, id, {
      lifecycle:   "archived",
      historyJson: JSON.stringify(history),
      updatedAt:   now,
    });

    AuditService.record({
      accion:      entityName + ".archive",
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
    });

    // Entity-specific archive events
    if (entityName === "wsBlueprints" && EVENT_TYPES.BLUEPRINT_ARCHIVADO) {
      EventDispatcher.emit(EVENT_TYPES.BLUEPRINT_ARCHIVADO, {
        entityName: entityName,
        id:         id,
        userId:     userId,
      });
    } else if (entityName === "wsDocuments" && EVENT_TYPES.DOCUMENTO_ARCHIVADO) {
      EventDispatcher.emit(EVENT_TYPES.DOCUMENTO_ARCHIVADO, {
        entityName: entityName,
        id:         id,
        userId:     userId,
      });
    }

    AppLogger.info("WorkspaceController.archive", { entityName: entityName, id: id });
    return updated;
  },

  /**
   * Restore an archived entity to 'draft'.
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   * @returns {Object} updated record
   */
  restore: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var now     = new Date().toISOString();
    var history = WorkspaceController._parseJson_(record.historyJson, []);
    var version = parseInt(record.version, 10) || 1;

    history.push({
      version:   version,
      changedBy: userId || "",
      changedAt: now,
      summary:   "Restaurado a borrador",
      lifecycle: "draft",
    });

    var updated = updateEntity_(entityName, id, {
      lifecycle:   "draft",
      historyJson: JSON.stringify(history),
      updatedAt:   now,
    });

    AuditService.record({
      accion:      entityName + ".restore",
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
    });

    AppLogger.info("WorkspaceController.restore", { entityName: entityName, id: id });
    return updated;
  },

  /**
   * Soft-delete an entity by stamping deletedAt.
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   */
  softDelete: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var now = new Date().toISOString();
    updateEntity_(entityName, id, { deletedAt: now, updatedAt: now });

    AuditService.record({
      accion:      entityName + ".delete",
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
    });

    AppLogger.info("WorkspaceController.softDelete", { entityName: entityName, id: id });
  },

  // ---------------------------------------------------------------------------
  // Duplication
  // ---------------------------------------------------------------------------

  /**
   * Duplicate an entity — deep-copies the record, assigns a fresh id,
   * resets lifecycle to 'draft', version to 1, clears all runtime state,
   * and prefixes the name with "Copia de".
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   * @returns {Object} newly created record
   */
  duplicate: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var original = getEntity_(entityName, id);
    if (!original) throw new Error(entityName + " " + id + " not found");

    var now   = new Date().toISOString();
    var newId = IdGen.forEntity(entityName);

    // Deep-copy via JSON round-trip (avoids shared references)
    var copy = JSON.parse(JSON.stringify(original));

    // Reset identity & lifecycle
    copy.id        = newId;
    copy.nombre    = "Copia de " + (copy.nombre || "sin nombre");
    copy.lifecycle = "draft";
    copy.version   = 1;
    copy.createdBy = userId || "";
    copy.createdAt = now;
    copy.updatedAt = now;

    // Seed a fresh history
    copy.historyJson = JSON.stringify([{
      version:   1,
      changedBy: userId || "",
      changedAt: now,
      summary:   "Duplicado desde " + id,
      lifecycle: "draft",
    }]);

    // Clear runtime-only fields (may not exist on all entities — harmless)
    delete copy.deletedAt;
    copy.publishedVersion   = "";
    copy.runtimeBlueprintId = "";
    copy.lastExecutedAt     = "";
    copy.executionCount     = 0;
    copy.recentExecutionsJson = "";
    copy.valorActual        = "";
    copy.historicoJson      = "";

    var created = createEntity_(entityName, copy);

    AuditService.record({
      accion:      entityName + ".duplicate",
      entidadTipo: entityName,
      entidadId:   newId,
      usuarioId:   userId || "",
      resultado:   "ok",
      detalle:     { sourceId: id },
    });

    AppLogger.info("WorkspaceController.duplicate", {
      entityName: entityName,
      sourceId:   id,
      newId:      newId,
    });
    return created;
  },

  // ---------------------------------------------------------------------------
  // Active flag
  // ---------------------------------------------------------------------------

  /**
   * Toggle the active/activo flag on entities that support it
   * (wsAutomations, wsNotifRules, wsUsers).
   *
   * @param {string}  entityName
   * @param {string}  id
   * @param {boolean} active
   * @param {string}  userId
   * @returns {Object} updated record
   */
  toggleActive: function (entityName, id, active, userId) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var now = new Date().toISOString();

    // Both field names are written — which one the entity actually stores
    // is determined by its column definition; extras are ignored by objectToRow_.
    var updated = updateEntity_(entityName, id, {
      activo:    active,
      active:    active,
      updatedAt: now,
    });

    AuditService.record({
      accion:      entityName + (active ? ".activate" : ".deactivate"),
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
      detalle:     { active: active },
    });

    if (entityName === "wsUsers" && !active && EVENT_TYPES.USUARIO_DESACTIVADO) {
      EventDispatcher.emit(EVENT_TYPES.USUARIO_DESACTIVADO, {
        id:     id,
        userId: userId,
      });
    }

    AppLogger.info("WorkspaceController.toggleActive", {
      entityName: entityName,
      id:         id,
      active:     active,
    });
    return updated;
  },

  // ---------------------------------------------------------------------------
  // Automation execution tracking
  // ---------------------------------------------------------------------------

  /**
   * Record one automation execution run.
   * Prepends to recentExecutionsJson (capped at 10), increments executionCount,
   * updates lastExecutedAt and lastStatus, and emits AUTOMATION_EJECUTADA.
   *
   * @param {string} automationId
   * @param {string} status            — 'success' | 'error' | 'skipped'
   * @param {string} errorMessage      — empty string if no error
   * @param {number} actionsExecuted
   * @param {string} userId
   * @returns {Object} updated automation record
   */
  recordExecution: function (automationId, status, errorMessage, actionsExecuted, userId) {
    if (!automationId) throw new Error("automationId is required");

    var automation = getEntity_("wsAutomations", automationId);
    if (!automation) throw new Error("wsAutomations " + automationId + " not found");

    var now = new Date().toISOString();

    var executionRecord = {
      id:              IdGen.uuid(),
      automationId:    automationId,
      triggeredAt:     now,
      status:          status || "unknown",
      actionsExecuted: actionsExecuted || 0,
      errorMessage:    errorMessage || "",
    };

    var recent = WorkspaceController._parseJson_(automation.recentExecutionsJson, []);

    // Prepend, keep last 10
    recent.unshift(executionRecord);
    if (recent.length > 10) recent = recent.slice(0, 10);

    var currentCount = parseInt(automation.executionCount, 10) || 0;
    var updated = updateEntity_("wsAutomations", automationId, {
      executionCount:       currentCount + 1,
      lastExecutedAt:       now,
      lastStatus:           status || "unknown",
      recentExecutionsJson: JSON.stringify(recent),
      updatedAt:            now,
    });

    if (EVENT_TYPES.AUTOMATION_EJECUTADA) {
      EventDispatcher.emit(EVENT_TYPES.AUTOMATION_EJECUTADA, {
        automationId: automationId,
        executionId:  executionRecord.id,
        status:       status,
        userId:       userId,
      });
    }

    AppLogger.info("WorkspaceController.recordExecution", {
      automationId:   automationId,
      status:         status,
      executionCount: currentCount + 1,
    });
    return updated;
  },

  // ---------------------------------------------------------------------------
  // KPI value recording
  // ---------------------------------------------------------------------------

  /**
   * Append a historical value to a KPI and recalculate valorActual + tendencia.
   * Keeps the last 24 entries in historicoJson.
   * Emits INDICADOR_ACTUALIZADO and KPI_ALERTA when semaforo is 'rojo'.
   *
   * @param {string} kpiId
   * @param {number} valor
   * @param {string} semaforo   — 'verde' | 'amarillo' | 'rojo'
   * @param {string} fecha      — ISO date string; defaults to now
   * @returns {Object} updated KPI record
   */
  recordKPIValue: function (kpiId, valor, semaforo, fecha) {
    if (!kpiId) throw new Error("kpiId is required");

    var kpi = getEntity_("wsKPIs", kpiId);
    if (!kpi) throw new Error("wsKPIs " + kpiId + " not found");

    var now        = new Date().toISOString();
    var fechaEntry = fecha || now;
    var historico  = WorkspaceController._parseJson_(kpi.historicoJson, []);

    // Capture previous value before appending
    var prevValor = historico.length > 0
      ? parseFloat(historico[historico.length - 1].valor)
      : null;

    historico.push({ fecha: fechaEntry, valor: valor, semaforo: semaforo || "verde" });

    // Keep last 24 entries
    if (historico.length > 24) historico = historico.slice(historico.length - 24);

    // Derive tendency
    var tendencia = "estable";
    var numValor  = parseFloat(valor);
    if (prevValor !== null && !isNaN(prevValor) && !isNaN(numValor)) {
      if (numValor > prevValor)      tendencia = "subiendo";
      else if (numValor < prevValor) tendencia = "bajando";
    }

    var updated = updateEntity_("wsKPIs", kpiId, {
      historicoJson: JSON.stringify(historico),
      valorActual:   valor,
      tendencia:     tendencia,
      updatedAt:     now,
    });

    if (EVENT_TYPES.INDICADOR_ACTUALIZADO) {
      EventDispatcher.emit(EVENT_TYPES.INDICADOR_ACTUALIZADO, {
        kpiId:     kpiId,
        valor:     valor,
        semaforo:  semaforo,
        tendencia: tendencia,
      });
    }

    if (semaforo === "rojo" && EVENT_TYPES.KPI_ALERTA) {
      EventDispatcher.emit(EVENT_TYPES.KPI_ALERTA, {
        kpiId:    kpiId,
        valor:    valor,
        semaforo: semaforo,
      });
    }

    AppLogger.info("WorkspaceController.recordKPIValue", {
      kpiId:     kpiId,
      valor:     valor,
      semaforo:  semaforo,
      tendencia: tendencia,
    });
    return updated;
  },

  // ---------------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------------

  /**
   * Return the parsed version-history array from historyJson, or [].
   *
   * @param {string} entityName
   * @param {string} id
   * @returns {Array}
   */
  getHistory: function (entityName, id) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var history = WorkspaceController._parseJson_(record.historyJson, []);
    AppLogger.debug("WorkspaceController.getHistory", {
      entityName: entityName,
      id:         id,
      entries:    history.length,
    });
    return history;
  },

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Safely parse a JSON string. Returns fallback on any error.
   * @param {string} raw
   * @param {*} fallback
   * @returns {*}
   * @private
   */
  _parseJson_: function (raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      AppLogger.warn("WorkspaceController._parseJson_: parse error", {
        error: String(e.message || e),
      });
      return fallback;
    }
  },

  /**
   * Map an entity name to its EVENT_TYPES key for publish events.
   * @param {string} entityName
   * @returns {string|null}
   * @private
   */
  _publishEventKey_: function (entityName) {
    var map = {
      wsBlueprints: "BLUEPRINT_PUBLICADO",
      wsForms:      "FORMULARIO_PUBLICADO",
    };
    return map[entityName] || null;
  },
};
