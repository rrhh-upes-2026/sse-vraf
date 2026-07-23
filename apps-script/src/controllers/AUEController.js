/**
 * AUE — Automation & Event Engine
 *
 * Event Bus institucional:
 *   - Registra eventos de cualquier motor.
 *   - Evalúa reglas WHEN/IF/THEN de forma determinista (sin eval()).
 *   - Encola ejecuciones (FIFO) y las despacha a acciones declarativas.
 *   - Registra historial completo de ejecuciones con logs.
 */
var AUEController = (function () {

  // ─── Private helpers ──────────────────────────────────────────────────────

  function _repo_(key) {
    return SheetRepository.forEntity(key);
  }

  function _events_()     { return _repo_("aueEvents");     }
  function _rules_()      { return _repo_("aueRules");      }
  function _executions_() { return _repo_("aueExecutions"); }
  function _queue_()      { return _repo_("aueQueue");      }

  function _now_()   { return new Date().toISOString(); }
  function _today_() { return _now_().slice(0, 10); }

  function _eventId_() {
    return "EVT-AUE-" + Number(new Date()).toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  function _ruleId_() {
    return "RUL-AUE-" + Number(new Date()).toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  function _execId_() {
    return "EXC-AUE-" + Number(new Date()).toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  function _queueId_() {
    return "QUE-AUE-" + Number(new Date()).toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }

  function _parseJson_(val) {
    if (!val || typeof val === "object") return val || {};
    try { return JSON.parse(val); } catch (e) { return {}; }
  }

  function _parseArr_(val) {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    try { return JSON.parse(val); } catch (e) { return []; }
  }

  function _hydrateEvent_(row) {
    return {
      id:             row.id,
      eventType:      row.eventType,
      sourceEngine:   row.sourceEngine,
      sourceEntityId: row.sourceEntityId,
      timestamp:      row.timestamp,
      payload:        _parseJson_(row.payload),
      status:         row.status,
      priority:       row.priority,
      processedAt:    row.processedAt || undefined,
    };
  }

  function _hydrateRule_(row) {
    return {
      id:              row.id,
      name:            row.name,
      description:     row.description || undefined,
      enabled:         row.enabled === true || row.enabled === "true",
      eventType:       row.eventType,
      conditions:      _parseArr_(row.conditions),
      actions:         _parseArr_(row.actions),
      priority:        Number(row.priority) || 0,
      version:         Number(row.version)  || 1,
      executionCount:  Number(row.executionCount) || 0,
      lastExecutedAt:  row.lastExecutedAt || undefined,
      createdBy:       row.createdBy,
      createdAt:       row.createdAt,
      updatedAt:       row.updatedAt,
    };
  }

  function _hydrateExecution_(row) {
    return {
      id:          row.id,
      eventId:     row.eventId,
      ruleId:      row.ruleId,
      ruleName:    row.ruleName,
      status:      row.status,
      startedAt:   row.startedAt,
      finishedAt:  row.finishedAt || undefined,
      duration:    row.duration ? Number(row.duration) : undefined,
      result:      _parseJson_(row.result),
      logs:        _parseArr_(row.logs),
    };
  }

  function _hydrateQueue_(row) {
    return {
      id:          row.id,
      executionId: row.executionId,
      scheduledAt: row.scheduledAt,
      attempt:     Number(row.attempt) || 0,
      status:      row.status,
      nextRetry:   row.nextRetry || undefined,
      maxRetries:  Number(row.maxRetries) || 3,
    };
  }

  // ─── Rule engine — condition evaluator ────────────────────────────────────

  function _getFieldValue_(payload, field) {
    var parts = field.split(".");
    var val = payload;
    for (var i = 0; i < parts.length; i++) {
      if (val == null) return undefined;
      val = val[parts[i]];
    }
    return val;
  }

  function _evalCondition_(condition, payload) {
    var fieldVal = _getFieldValue_(payload, condition.field);
    var cmpVal   = condition.value;
    switch (condition.operator) {
      case "eq":       return fieldVal == cmpVal;
      case "neq":      return fieldVal != cmpVal;
      case "gt":       return Number(fieldVal) > Number(cmpVal);
      case "gte":      return Number(fieldVal) >= Number(cmpVal);
      case "lt":       return Number(fieldVal) < Number(cmpVal);
      case "lte":      return Number(fieldVal) <= Number(cmpVal);
      case "contains": return String(fieldVal || "").indexOf(String(cmpVal)) !== -1;
      case "in":       return Array.isArray(cmpVal) && cmpVal.indexOf(fieldVal) !== -1;
      case "not_in":   return Array.isArray(cmpVal) && cmpVal.indexOf(fieldVal) === -1;
      default:         return false;
    }
  }

  function _matchesRule_(rule, event) {
    if (rule.eventType !== event.eventType) return false;
    var conditions = rule.conditions || [];
    for (var i = 0; i < conditions.length; i++) {
      if (!_evalCondition_(conditions[i], event.payload)) return false;
    }
    return true;
  }

  // ─── Action dispatcher ────────────────────────────────────────────────────
  // All actions are purely declarative — no eval(), no dynamic code.

  function _execAction_(action, event, logs) {
    var type   = action.type;
    var params = action.params || {};

    try {
      if (type === "registrar_evento") {
        _events_().create({
          id:             _eventId_(),
          eventType:      params.eventType || "rule.triggered",
          sourceEngine:   "system",
          sourceEntityId: event.id,
          timestamp:      _now_(),
          payload:        JSON.stringify({ triggeredBy: event.id, rule: params }),
          status:         "pendiente",
          priority:       params.priority || "normal",
        });
        logs.push("[OK] registrar_evento → " + (params.eventType || "rule.triggered"));
        return { ok: true };
      }

      if (type === "crear_tarea_ioe") {
        if (typeof IOEController !== "undefined") {
          var taskResult = IOEController.createTask({
            actionPlanId: params.actionPlanId || "",
            title:        params.title || ("Tarea automática: " + event.eventType),
            assignedTo:   params.assignedTo || event.payload.owner || "Sin asignar",
            priority:     params.priority || "media",
            plannedStart: _today_(),
            plannedEnd:   params.plannedEnd || _today_(),
          });
          logs.push("[OK] crear_tarea_ioe → " + taskResult.id);
          return { ok: true, taskId: taskResult.id };
        }
        logs.push("[SKIP] IOEController no disponible");
        return { ok: false, reason: "IOEController not available" };
      }

      if (type === "crear_plan_ioe") {
        if (typeof IOEController !== "undefined") {
          var planResult = IOEController.createActionPlan({
            title:                  params.title || ("Plan automático: " + event.eventType),
            description:            params.description || "Generado automáticamente por AUE",
            originEngine:           event.sourceEngine,
            originEntityId:         event.sourceEntityId,
            organizationalUnitId:   params.orgUnitId || "unknown",
            organizationalUnitLabel: params.orgUnitLabel || "Unidad",
            priority:               params.priority || "media",
            objective:              params.objective || "Atender evento institucional",
            expectedImpact:         params.expectedImpact || "Resolución del evento detectado",
            owner:                  params.owner || "Sin asignar",
            startDate:              _today_(),
            targetDate:             params.targetDate || _today_(),
          });
          logs.push("[OK] crear_plan_ioe → " + planResult.id);
          return { ok: true, planId: planResult.id };
        }
        logs.push("[SKIP] IOEController no disponible");
        return { ok: false, reason: "IOEController not available" };
      }

      if (type === "cambiar_prioridad") {
        logs.push("[OK] cambiar_prioridad → " + params.priority + " (contrato registrado)");
        return { ok: true, priority: params.priority };
      }

      if (type === "actualizar_estado") {
        logs.push("[OK] actualizar_estado → " + params.status + " (contrato registrado)");
        return { ok: true, status: params.status };
      }

      if (type === "generar_alerta") {
        logs.push("[OK] generar_alerta → " + params.message + " (registrada en auditoría)");
        AuditService.record({
          accion:      "aue.generar_alerta",
          entidadTipo: "AUEEvent",
          entidadId:   event.id,
          usuarioId:   "system",
          resultado:   "ok",
          detalle:     { alerta: params.message, severity: params.severity || "medio" },
        });
        return { ok: true };
      }

      if (type === "registrar_auditoria") {
        AuditService.record({
          accion:      "aue.auditoria",
          entidadTipo: event.sourceEngine,
          entidadId:   event.sourceEntityId,
          usuarioId:   "system",
          resultado:   "ok",
          detalle:     { eventType: event.eventType, eventId: event.id, note: params.note },
        });
        logs.push("[OK] registrar_auditoria → " + event.id);
        return { ok: true };
      }

      // Future integration targets — registered as contracts, not executed
      if (type === "webhook_externo" || type === "correo_externo" || type === "api_externa") {
        logs.push("[PENDIENTE] " + type + " → contrato registrado para integración futura");
        return { ok: true, deferred: true };
      }

      logs.push("[WARN] Tipo de acción desconocido: " + type);
      return { ok: false, reason: "unknown action type: " + type };

    } catch (err) {
      var msg = "[ERROR] " + type + ": " + String((err && err.message) || err);
      logs.push(msg);
      return { ok: false, reason: msg };
    }
  }

  // ─── Core event processing ────────────────────────────────────────────────

  function _processEvent_(eventId) {
    var allEvents = _events_().findAll();
    var eventRow = null;
    for (var i = 0; i < allEvents.length; i++) {
      if (allEvents[i].id === eventId) { eventRow = allEvents[i]; break; }
    }
    if (!eventRow) throw new Error("Evento no encontrado: " + eventId);

    var event = _hydrateEvent_(eventRow);
    if (event.status === "procesado" || event.status === "ignorado") return { skipped: true };

    // Update status to procesando
    _events_().update({ id: eventId, status: "procesando" });

    // Find matching enabled rules, sorted by priority desc
    var allRules = _rules_().findAll()
      .map(_hydrateRule_)
      .filter(function (r) { return r.enabled && _matchesRule_(r, event); })
      .sort(function (a, b) { return b.priority - a.priority; });

    var execResults = [];

    allRules.forEach(function (rule) {
      var execId   = _execId_();
      var startMs  = Number(new Date());
      var logs     = ["[START] Regla: " + rule.name + " v" + rule.version];
      var overallOk = true;

      rule.actions.forEach(function (action) {
        var res = _execAction_(action, event, logs);
        if (!res.ok && !res.deferred) overallOk = false;
      });

      var finishMs = Number(new Date());
      var duration = finishMs - startMs;
      var status   = overallOk ? "exitoso" : "fallido";

      // Persist execution record
      _executions_().create({
        id:         execId,
        eventId:    eventId,
        ruleId:     rule.id,
        ruleName:   rule.name,
        status:     status,
        startedAt:  new Date(startMs).toISOString(),
        finishedAt: new Date(finishMs).toISOString(),
        duration:   duration,
        result:     JSON.stringify({ ok: overallOk }),
        logs:       JSON.stringify(logs),
      });

      // Update rule counters
      _rules_().update({
        id:             rule.id,
        executionCount: (rule.executionCount || 0) + 1,
        lastExecutedAt: _now_(),
        updatedAt:      _now_(),
      });

      // Queue failed executions for retry
      if (!overallOk) {
        _queue_().create({
          id:          _queueId_(),
          executionId: execId,
          scheduledAt: _now_(),
          attempt:     1,
          status:      "fallido",
          nextRetry:   _now_(),
          maxRetries:  3,
        });
      }

      execResults.push({ execId: execId, ruleId: rule.id, status: status });
    });

    var finalStatus = allRules.length === 0 ? "ignorado" : "procesado";
    _events_().update({ id: eventId, status: finalStatus, processedAt: _now_() });

    return { processed: true, executions: execResults, rulesMatched: allRules.length };
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  function _buildDashboard_() {
    var events     = _events_().findAll().map(_hydrateEvent_);
    var rules      = _rules_().findAll().map(_hydrateRule_);
    var executions = _executions_().findAll().map(_hydrateExecution_);
    var queue      = _queue_().findAll().map(_hydrateQueue_);

    var todayStr = _today_();

    var totalEvents     = events.length;
    var pendingEvents   = events.filter(function (e) { return e.status === "pendiente"; }).length;
    var processedEvents = events.filter(function (e) { return e.status === "procesado"; }).length;
    var failedEvents    = events.filter(function (e) { return e.status === "fallido"; }).length;
    var eventsToday     = events.filter(function (e) { return e.timestamp.slice(0, 10) === todayStr; }).length;

    var completedExec = executions.filter(function (e) { return e.duration != null; });
    var avgProcessingTime = completedExec.length > 0
      ? Math.round(completedExec.reduce(function (s, e) { return s + (e.duration || 0); }, 0) / completedExec.length)
      : 0;

    var activeRules = rules.filter(function (r) { return r.enabled; }).length;
    var queueSize   = queue.filter(function (q) { return q.status === "pendiente" || q.status === "procesando"; }).length;
    var retryCount  = queue.filter(function (q) { return q.attempt > 1; }).length;

    // Top rules by execution count
    var ruleExecMap = {};
    executions.forEach(function (e) {
      if (!ruleExecMap[e.ruleId]) ruleExecMap[e.ruleId] = { ruleId: e.ruleId, ruleName: e.ruleName, count: 0 };
      ruleExecMap[e.ruleId].count++;
    });
    var topRules = Object.values(ruleExecMap)
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 5);

    // Events by day (last 14 days)
    var dayMap = {};
    events.forEach(function (e) {
      var d = e.timestamp.slice(0, 10);
      dayMap[d] = (dayMap[d] || 0) + 1;
    });
    var eventsByDay = Object.keys(dayMap).sort().slice(-14).map(function (d) {
      return { date: d, count: dayMap[d] };
    });

    return {
      totalEvents:       totalEvents,
      pendingEvents:     pendingEvents,
      processedEvents:   processedEvents,
      failedEvents:      failedEvents,
      avgProcessingTime: avgProcessingTime,
      activeRules:       activeRules,
      queueSize:         queueSize,
      retryCount:        retryCount,
      eventsToday:       eventsToday,
      topRules:          topRules,
      recentEvents:      events.slice(-10).reverse(),
      recentExecutions:  executions.slice(-10).reverse(),
      eventsByDay:       eventsByDay,
      generatedAt:       _now_(),
    };
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  function getDashboard() {
    return _buildDashboard_();
  }

  function getEvents(params) {
    params = params || {};
    var rows = _events_().findAll().map(_hydrateEvent_);
    if (params.sourceEngine) rows = rows.filter(function (e) { return e.sourceEngine === params.sourceEngine; });
    if (params.eventType)    rows = rows.filter(function (e) { return e.eventType    === params.eventType;    });
    if (params.status)       rows = rows.filter(function (e) { return e.status       === params.status;       });
    if (params.priority)     rows = rows.filter(function (e) { return e.priority     === params.priority;     });
    if (params.from)         rows = rows.filter(function (e) { return e.timestamp >= params.from; });
    if (params.to)           rows = rows.filter(function (e) { return e.timestamp <= params.to + "T23:59:59Z"; });
    rows = rows.sort(function (a, b) { return b.timestamp.localeCompare(a.timestamp); });
    if (params.limit) rows = rows.slice(0, Number(params.limit));
    return rows;
  }

  function createEvent(params) {
    params = params || {};
    var id = _eventId_();
    var row = {
      id:             id,
      eventType:      params.eventType,
      sourceEngine:   params.sourceEngine,
      sourceEntityId: params.sourceEntityId || "",
      timestamp:      _now_(),
      payload:        JSON.stringify(params.payload || {}),
      status:         "pendiente",
      priority:       params.priority || "normal",
    };
    _events_().create(row);
    return _hydrateEvent_(row);
  }

  function processEvent(params) {
    return _processEvent_(params.eventId);
  }

  function getRules(params) {
    params = params || {};
    var rows = _rules_().findAll().map(_hydrateRule_);
    if (params.enabled !== undefined) {
      var wantEnabled = params.enabled === true || params.enabled === "true";
      rows = rows.filter(function (r) { return r.enabled === wantEnabled; });
    }
    if (params.eventType) rows = rows.filter(function (r) { return r.eventType === params.eventType; });
    rows = rows.sort(function (a, b) { return b.priority - a.priority; });
    if (params.limit) rows = rows.slice(0, Number(params.limit));
    return rows;
  }

  function getRule(params) {
    var rows = _rules_().findAll().map(_hydrateRule_);
    var found = rows.filter(function (r) { return r.id === params.id; });
    if (!found.length) throw new Error("Regla no encontrada: " + params.id);
    return found[0];
  }

  function createRule(params) {
    params = params || {};
    var id = _ruleId_();
    var now = _now_();
    var row = {
      id:             id,
      name:           params.name,
      description:    params.description || "",
      enabled:        params.enabled !== false,
      eventType:      params.eventType,
      conditions:     JSON.stringify(params.conditions || []),
      actions:        JSON.stringify(params.actions || []),
      priority:       params.priority || 0,
      version:        1,
      executionCount: 0,
      lastExecutedAt: "",
      createdBy:      params.createdBy || "system",
      createdAt:      now,
      updatedAt:      now,
    };
    _rules_().create(row);
    return _hydrateRule_(row);
  }

  function updateRule(params) {
    params = params || {};
    var existing = getRule({ id: params.id });
    var now = _now_();
    var changes = { id: params.id, updatedAt: now };
    if (params.name        !== undefined) changes.name        = params.name;
    if (params.description !== undefined) changes.description = params.description;
    if (params.enabled     !== undefined) changes.enabled     = params.enabled;
    if (params.eventType   !== undefined) changes.eventType   = params.eventType;
    if (params.conditions  !== undefined) changes.conditions  = JSON.stringify(params.conditions);
    if (params.actions     !== undefined) changes.actions     = JSON.stringify(params.actions);
    if (params.priority    !== undefined) changes.priority    = params.priority;
    // Version bump on structural changes
    if (params.conditions !== undefined || params.actions !== undefined || params.eventType !== undefined) {
      changes.version = (existing.version || 1) + 1;
    }
    _rules_().update(changes);
    return getRule({ id: params.id });
  }

  function duplicateRule(params) {
    var source = getRule({ id: params.id });
    return createRule({
      name:       (source.name || "") + " (copia)",
      description: source.description,
      eventType:  source.eventType,
      conditions: source.conditions,
      actions:    source.actions,
      priority:   source.priority,
      createdBy:  params.createdBy || "system",
    });
  }

  function getExecutions(params) {
    params = params || {};
    var rows = _executions_().findAll().map(_hydrateExecution_);
    if (params.eventId) rows = rows.filter(function (e) { return e.eventId === params.eventId; });
    if (params.ruleId)  rows = rows.filter(function (e) { return e.ruleId  === params.ruleId;  });
    if (params.status)  rows = rows.filter(function (e) { return e.status  === params.status;  });
    if (params.from)    rows = rows.filter(function (e) { return e.startedAt >= params.from; });
    if (params.to)      rows = rows.filter(function (e) { return e.startedAt <= params.to + "T23:59:59Z"; });
    rows = rows.sort(function (a, b) { return b.startedAt.localeCompare(a.startedAt); });
    if (params.limit) rows = rows.slice(0, Number(params.limit));
    return rows;
  }

  function getQueue(params) {
    params = params || {};
    var rows = _queue_().findAll().map(_hydrateQueue_);
    if (params.status) rows = rows.filter(function (q) { return q.status === params.status; });
    rows = rows.sort(function (a, b) { return b.scheduledAt.localeCompare(a.scheduledAt); });
    if (params.limit) rows = rows.slice(0, Number(params.limit));
    return rows;
  }

  function retryExecution(params) {
    var qRows = _queue_().findAll().map(_hydrateQueue_)
      .filter(function (q) { return q.executionId === params.executionId; });
    if (!qRows.length) throw new Error("Cola no encontrada para ejecución: " + params.executionId);
    var qEntry = qRows[0];
    if (qEntry.attempt >= qEntry.maxRetries) throw new Error("Máximo de reintentos alcanzado");

    var execRows = _executions_().findAll().map(_hydrateExecution_)
      .filter(function (e) { return e.id === params.executionId; });
    if (!execRows.length) throw new Error("Ejecución no encontrada: " + params.executionId);
    var exec = execRows[0];

    // Update queue entry
    _queue_().update({
      id:      qEntry.id,
      attempt: qEntry.attempt + 1,
      status:  "procesando",
      nextRetry: _now_(),
    });
    // Update execution status
    _executions_().update({ id: exec.id, status: "reintentando" });

    // Re-process the original event
    var result = _processEvent_(exec.eventId);
    _queue_().update({ id: qEntry.id, status: result.processed ? "completado" : "fallido" });
    return result;
  }

  // ─── Public interface ─────────────────────────────────────────────────────

  return {
    getDashboard:    getDashboard,
    getEvents:       getEvents,
    createEvent:     createEvent,
    processEvent:    processEvent,
    getRules:        getRules,
    getRule:         getRule,
    createRule:      createRule,
    updateRule:      updateRule,
    duplicateRule:   duplicateRule,
    getExecutions:   getExecutions,
    getQueue:        getQueue,
    retryExecution:  retryExecution,
  };

})();
