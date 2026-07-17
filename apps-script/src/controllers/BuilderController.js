/**
 * BuilderController — Sprint 16 Production Persistence for the No-Code Builder Suite.
 *
 * Handles all CRUD operations for builder configs stored in WSBuilderConfigs.
 * Each config is stored as a flat row where configJson holds the complete
 * typed object (ProcessConfig, FormConfig, KPIConfig, etc.) as a JSON string.
 *
 * All public methods correspond 1:1 to builder.* actions in router.js.
 *
 * Serialization contract:
 *   SAVE:  full config object → JSON.stringify(config) stored in configJson
 *   READ:  JSON.parse(row.configJson) merged with flat row fields → full object
 *
 * Version history: every publish() writes an immutable snapshot to WSBuilderVersions.
 */

var BuilderController = (function () {

  var ENTITY = "wsBuilderConfigs";
  var VERSION_ENTITY = "wsBuilderVersions";

  // ---------------------------------------------------------------------------
  // Serialization helpers
  // ---------------------------------------------------------------------------

  /** Parse a WSBuilderConfigs row into a full builder config object. */
  function rowToConfig_(row) {
    if (!row) return null;
    var config = {};
    try {
      config = JSON.parse(row.configJson || "{}");
    } catch (e) {
      AppLogger.warn("BuilderController: failed to parse configJson", {
        id:    row.id,
        error: String((e && e.message) || e),
      });
    }
    // Merge flat fields on top so they always win (they are the source of truth
    // for filtering and are denormalized from configJson at write time)
    config.id          = row.id;
    config.wsId        = row.wsId;
    config.tipo        = row.tipo;
    config.nombre      = row.nombre;
    config.descripcion = row.descripcion || config.descripcion || "";
    config.version     = typeof row.version === "number" ? row.version : (parseInt(row.version, 10) || 1);
    config.status      = row.status;
    config.creadoPor   = row.creadoPor;
    config.createdAt   = row.createdAt;
    config.updatedAt   = row.updatedAt;
    config.publishedAt = row.publishedAt || "";
    return config;
  }

  /**
   * Build a flat WSBuilderConfigs row from a full config object.
   * Stores the entire config as configJson to preserve all nested fields.
   */
  function configToRow_(wsId, config, now) {
    return {
      id:          config.id,
      wsId:        wsId,
      tipo:        config.tipo,
      nombre:      config.nombre || "",
      descripcion: config.descripcion || "",
      version:     config.version || 1,
      status:      config.status || "draft",
      creadoPor:   config.creadoPor || "",
      configJson:  JSON.stringify(config),
      createdAt:   config.createdAt || now,
      updatedAt:   now,
      publishedAt: config.publishedAt || "",
      deletedAt:   "",
    };
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  return {

    /**
     * List all builder configs for a workspace + type.
     * Returns full config objects, sorted by updatedAt desc.
     *
     * @param {{ wsId: string, tipo: string }} params
     * @returns {Array}
     */
    list: function (params) {
      if (!params.wsId) throw new Error("builder.list: wsId is required");

      var query = { wsId: params.wsId };
      if (params.tipo) query.tipo = params.tipo;

      var result = listEntities_(ENTITY, query);
      var items  = result.items || [];

      var configs = [];
      for (var i = 0; i < items.length; i++) {
        var c = rowToConfig_(items[i]);
        if (c) configs.push(c);
      }

      // Sort by updatedAt desc
      configs.sort(function (a, b) {
        var at = a.updatedAt || "";
        var bt = b.updatedAt || "";
        return at < bt ? 1 : at > bt ? -1 : 0;
      });

      return configs;
    },

    /**
     * Get a single builder config by id.
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     * @returns {Object|null}
     */
    get: function (params) {
      Validator.requireId(params);
      var row = getEntity_(ENTITY, params.id);
      if (!row) return null;
      if (params.wsId && row.wsId !== params.wsId) return null;
      return rowToConfig_(row);
    },

    /**
     * Create or update a builder config (upsert).
     * If params.id exists and the row is found, updates it.
     * Otherwise creates a new row with a generated id.
     *
     * @param {{ wsId: string, [key: string]: * }} params — full config object
     * @returns {Object} saved config
     */
    save: function (params) {
      if (!params.wsId) throw new Error("builder.save: wsId is required");
      if (!params.tipo)  throw new Error("builder.save: tipo is required");

      var now    = new Date().toISOString();
      var wsId   = params.wsId;
      var id     = params.id;
      var config = Object.assign({}, params);

      // Determine create vs update
      var existing = id ? getEntity_(ENTITY, id) : null;

      if (existing && existing.wsId === wsId) {
        // UPDATE: preserve createdAt, bump updatedAt
        config.createdAt = existing.createdAt;
        config.updatedAt = now;
        config.id        = id;
        var row = configToRow_(wsId, config, now);
        updateEntity_(ENTITY, id, row);
        AppLogger.info("BuilderController.save: updated", { id: id, tipo: config.tipo });
        return rowToConfig_(Object.assign({}, existing, row));
      } else {
        // CREATE: generate new id
        config.id        = IdGen.forEntity("wsBuilderConfigs");
        config.createdAt = now;
        config.updatedAt = now;
        config.version   = config.version || 1;
        config.status    = config.status  || "draft";
        var newRow = configToRow_(wsId, config, now);
        createEntity_(ENTITY, newRow);
        AppLogger.info("BuilderController.save: created", { id: config.id, tipo: config.tipo });
        return rowToConfig_(newRow);
      }
    },

    /**
     * Publish a builder config: bump version, set status=published,
     * stamp publishedAt, write immutable version snapshot.
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     * @returns {Object} updated config
     */
    publish: function (params) {
      Validator.requireId(params);
      var existing = getEntity_(ENTITY, params.id);
      if (!existing) throw new Error("builder.publish: config " + params.id + " not found");
      if (params.wsId && existing.wsId !== params.wsId) throw new Error("builder.publish: wsId mismatch");

      var now       = new Date().toISOString();
      var newVersion = (parseInt(existing.version, 10) || 1) + 1;

      var patch = {
        version:     newVersion,
        status:      "published",
        publishedAt: now,
        updatedAt:   now,
        configJson:  "", // will be rebuilt below
      };

      // Rebuild configJson with updated fields
      var fullConfig = rowToConfig_(existing);
      fullConfig.version     = newVersion;
      fullConfig.status      = "published";
      fullConfig.publishedAt = now;
      fullConfig.updatedAt   = now;
      patch.configJson = JSON.stringify(fullConfig);

      updateEntity_(ENTITY, params.id, patch);

      // Write immutable version snapshot
      try {
        createEntity_(VERSION_ENTITY, {
          id:        IdGen.forEntity("wsBuilderVersions"),
          builderId: params.id,
          wsId:      existing.wsId,
          tipo:      existing.tipo,
          version:   newVersion,
          status:    "published",
          configJson: patch.configJson,
          creadoPor: params.userId || "system",
          createdAt: now,
        });
      } catch (e) {
        // Version snapshot failure must never block the publish
        AppLogger.warn("BuilderController.publish: version snapshot failed", {
          id:    params.id,
          error: String((e && e.message) || e),
        });
      }

      AppLogger.info("BuilderController.publish: published", { id: params.id, version: newVersion });
      return rowToConfig_(Object.assign({}, existing, patch));
    },

    /**
     * Archive a builder config (status → archived).
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     * @returns {Object} updated config
     */
    archive: function (params) {
      Validator.requireId(params);
      var existing = getEntity_(ENTITY, params.id);
      if (!existing) throw new Error("builder.archive: config " + params.id + " not found");

      var now    = new Date().toISOString();
      var config = rowToConfig_(existing);
      config.status    = "archived";
      config.updatedAt = now;

      updateEntity_(ENTITY, params.id, {
        status:     "archived",
        updatedAt:  now,
        configJson: JSON.stringify(config),
      });

      AppLogger.info("BuilderController.archive: archived", { id: params.id });
      return config;
    },

    /**
     * Soft-delete a builder config.
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     */
    delete: function (params) {
      Validator.requireId(params);
      removeEntity_(ENTITY, params.id);
      AppLogger.info("BuilderController.delete: deleted", { id: params.id });
    },

    /**
     * Duplicate a builder config with a new id, status=draft, version=1.
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     * @returns {Object} the new copy
     */
    duplicate: function (params) {
      Validator.requireId(params);
      var existing = getEntity_(ENTITY, params.id);
      if (!existing) throw new Error("builder.duplicate: config " + params.id + " not found");

      var now     = new Date().toISOString();
      var config  = rowToConfig_(existing);
      config.id          = IdGen.forEntity("wsBuilderConfigs");
      config.nombre      = (config.nombre || "") + " (copia)";
      config.status      = "draft";
      config.version     = 1;
      config.publishedAt = "";
      config.createdAt   = now;
      config.updatedAt   = now;

      var newRow = configToRow_(existing.wsId, config, now);
      createEntity_(ENTITY, newRow);

      AppLogger.info("BuilderController.duplicate: duplicated", {
        original: params.id,
        copy:     config.id,
      });
      return rowToConfig_(newRow);
    },

    /**
     * Restore a previously published version snapshot.
     *
     * @param {{ wsId: string, id: string, version: number }} params
     * @returns {Object} restored config (as new draft)
     */
    restoreVersion: function (params) {
      Validator.requireId(params);
      if (!params.version) throw new Error("builder.restoreVersion: version is required");

      // Find the version snapshot
      var versions = listEntities_(VERSION_ENTITY, { builderId: params.id });
      var snapshot = null;
      for (var i = 0; i < (versions.items || []).length; i++) {
        var v = versions.items[i];
        if (parseInt(v.version, 10) === parseInt(params.version, 10)) {
          snapshot = v;
          break;
        }
      }

      if (!snapshot) {
        throw new Error("builder.restoreVersion: version " + params.version + " not found for " + params.id);
      }

      var now    = new Date().toISOString();
      var config = JSON.parse(snapshot.configJson || "{}");
      config.status    = "draft";
      config.updatedAt = now;

      updateEntity_(ENTITY, params.id, {
        status:     "draft",
        updatedAt:  now,
        configJson: JSON.stringify(config),
      });

      AppLogger.info("BuilderController.restoreVersion: restored", {
        id:      params.id,
        version: params.version,
      });
      return config;
    },

    /**
     * List version history snapshots for a builder config.
     *
     * @param {{ id: string }} params
     * @returns {Array}
     */
    getVersionHistory: function (params) {
      Validator.requireId(params);
      var result = listEntities_(VERSION_ENTITY, {
        builderId: params.id,
        _sortBy:   "version",
        _sortDir:  "desc",
      });
      return (result.items || []).map(function (v) {
        return {
          version:   v.version,
          status:    v.status,
          creadoPor: v.creadoPor,
          createdAt: v.createdAt,
          builderId: v.builderId,
        };
      });
    },

    // ── Catalog-specific helpers ─────────────────────────────────────────────

    /**
     * Create or update a single catalog entry inside a CatalogConfig.
     * Modifies the configJson in-place.
     *
     * @param {{ wsId: string, catalogId: string, entry: Object }} params
     * @returns {Object} the saved entry
     */
    saveCatalogEntry: function (params) {
      if (!params.catalogId) throw new Error("builder.saveCatalogEntry: catalogId is required");
      if (!params.entry)     throw new Error("builder.saveCatalogEntry: entry is required");

      var existing = getEntity_(ENTITY, params.catalogId);
      if (!existing) throw new Error("builder.saveCatalogEntry: catalog " + params.catalogId + " not found");

      var config  = rowToConfig_(existing);
      var entradas = config.entradas || [];
      var entry   = params.entry;
      var idx     = -1;

      for (var i = 0; i < entradas.length; i++) {
        if (entradas[i].id === entry.id) { idx = i; break; }
      }

      if (idx >= 0) {
        entradas[idx] = entry;
      } else {
        entradas.push(entry);
      }

      config.entradas  = entradas;
      config.updatedAt = new Date().toISOString();

      updateEntity_(ENTITY, params.catalogId, {
        updatedAt:  config.updatedAt,
        configJson: JSON.stringify(config),
      });

      AppLogger.info("BuilderController.saveCatalogEntry: saved", {
        catalogId: params.catalogId,
        entryId:   entry.id,
      });
      return entry;
    },

    /**
     * Delete a catalog entry by id from a CatalogConfig.
     *
     * @param {{ wsId: string, catalogId: string, entryId: string }} params
     */
    deleteCatalogEntry: function (params) {
      if (!params.catalogId) throw new Error("builder.deleteCatalogEntry: catalogId is required");
      if (!params.entryId)   throw new Error("builder.deleteCatalogEntry: entryId is required");

      var existing = getEntity_(ENTITY, params.catalogId);
      if (!existing) return; // idempotent

      var config  = rowToConfig_(existing);
      var before  = (config.entradas || []).length;
      config.entradas  = (config.entradas || []).filter(function (e) { return e.id !== params.entryId; });
      config.updatedAt = new Date().toISOString();

      updateEntity_(ENTITY, params.catalogId, {
        updatedAt:  config.updatedAt,
        configJson: JSON.stringify(config),
      });

      AppLogger.info("BuilderController.deleteCatalogEntry: deleted", {
        catalogId: params.catalogId,
        entryId:   params.entryId,
        removed:   before - config.entradas.length,
      });
    },

    // ── Cross-builder reference helpers ──────────────────────────────────────

    /**
     * Get a lightweight list of all ProcessConfigs for cross-builder dropdowns.
     * Returns only {id, nombre, status, version}.
     *
     * @param {{ wsId: string }} params
     * @returns {Array}
     */
    getProcessList: function (params) {
      if (!params.wsId) throw new Error("builder.getProcessList: wsId is required");
      return BuilderController._lightList(params.wsId, "process");
    },

    /** Lightweight list of all FormConfigs. */
    getFormList: function (params) {
      if (!params.wsId) throw new Error("builder.getFormList: wsId is required");
      return BuilderController._lightList(params.wsId, "form");
    },

    /** Lightweight list of all KPIConfigs. */
    getKPIList: function (params) {
      if (!params.wsId) throw new Error("builder.getKPIList: wsId is required");
      return BuilderController._lightList(params.wsId, "kpi");
    },

    /** Lightweight list of all NotificationConfigs. */
    getNotificationList: function (params) {
      if (!params.wsId) throw new Error("builder.getNotificationList: wsId is required");
      return BuilderController._lightList(params.wsId, "notification");
    },

    /** Internal: return minimal items for cross-builder dropdowns. */
    _lightList: function (wsId, tipo) {
      var result = listEntities_(ENTITY, { wsId: wsId, tipo: tipo });
      return (result.items || []).map(function (row) {
        return { id: row.id, nombre: row.nombre, status: row.status, version: row.version };
      });
    },
  };

})();
