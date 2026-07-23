/**
 * IOE — Institutional Orchestration Engine
 *
 * Transforms diagnoses and recommendations from IIE, CPE, EIP, APE, AEE
 * into executable, trackable action plans with milestones, tasks, and decisions.
 * Read-only consumer of all source engines — never writes to them.
 */
var IOEController = (function () {
  "use strict";

  // ─── Private loaders ────────────────────────────────────────────────────────

  function _plans_(filter) {
    return listEntities_("ioeActionPlans", filter || {});
  }

  function _milestones_(filter) {
    return listEntities_("ioeMilestones", filter || {});
  }

  function _tasks_(filter) {
    return listEntities_("ioeTasks", filter || {});
  }

  function _decisions_(filter) {
    return listEntities_("ioeDecisions", filter || {});
  }

  // ─── Cross-engine readers (read-only, never writes) ─────────────────────────

  function _iieRecommendations_() {
    try { return listEntities_("iieRecommendations", {}); } catch (e) { return []; }
  }

  function _iieDiagnoses_() {
    try { return listEntities_("iieDiagnoses", {}); } catch (e) { return []; }
  }

  function _cpeBrechas_() {
    try { return listEntities_("cpeBrechas", {}); } catch (e) { return []; }
  }

  function _cpePlanesMejora_() {
    try { return listEntities_("cpePlanesMejora", {}); } catch (e) { return []; }
  }

  function _eipAlerts_() {
    try { return listEntities_("eipAlerts", {}); } catch (e) { return []; }
  }

  // ─── ID generators ──────────────────────────────────────────────────────────

  function _planId_(seq) {
    var yy = String(new Date().getFullYear()).slice(-2);
    return "PLAN-IOE-" + yy + "-" + String(seq).padStart(3, "0");
  }

  function _milestoneId_(planId, seq) {
    return "HIT-" + planId + "-" + String(seq).padStart(2, "0");
  }

  function _taskId_(planId, seq) {
    return "TASK-" + planId + "-" + String(seq).padStart(3, "0");
  }

  function _decisionId_(planId, seq) {
    return "DEC-" + planId + "-" + String(seq).padStart(2, "0");
  }

  // ─── Date helpers ───────────────────────────────────────────────────────────

  function _today_() { return new Date().toISOString().slice(0, 10); }

  function _isPast_(dateStr) {
    return dateStr && dateStr < _today_();
  }

  function _daysDiff_(a, b) {
    var da = new Date(a), db = new Date(b);
    return Math.round((db - da) / 86400000);
  }

  // ─── Progress calculator ─────────────────────────────────────────────────────

  function _calcProgress_(tasks) {
    if (!tasks || tasks.length === 0) return 0;
    var total = tasks.reduce(function (s, t) { return s + (Number(t.progress) || 0); }, 0);
    return Math.round(total / tasks.length);
  }

  // ─── Dependency / block detector ────────────────────────────────────────────

  function _detectBlocks_(tasks) {
    var statusMap = {};
    tasks.forEach(function (t) { statusMap[t.id] = t.status; });

    return tasks.map(function (t) {
      var deps = (t.dependencies && typeof t.dependencies === "string")
        ? JSON.parse(t.dependencies)
        : (Array.isArray(t.dependencies) ? t.dependencies : []);

      var blocked = deps.some(function (depId) {
        var depStatus = statusMap[depId];
        return depStatus && depStatus !== "completada" && depStatus !== "cancelada";
      });

      return Object.assign({}, t, {
        isBlocked: blocked,
        blockReason: blocked ? "Depende de tareas no completadas" : "",
        dependencies: deps,
      });
    });
  }

  // ─── Metrics calculator ──────────────────────────────────────────────────────

  function _calcMetrics_(plans, tasks) {
    var completed = plans.filter(function (p) { return p.status === "completado"; });
    var avgClosure = 0;
    if (completed.length > 0) {
      var total = completed.reduce(function (s, p) {
        return s + _daysDiff_(p.startDate, p.completionDate || _today_());
      }, 0);
      avgClosure = Math.round(total / completed.length);
    }

    var withDates = plans.filter(function (p) { return p.targetDate && p.startDate; });
    var deviations = withDates.map(function (p) {
      var end = p.completionDate || _today_();
      return Math.max(0, _daysDiff_(p.targetDate, end));
    });
    var avgDev = deviations.length > 0
      ? Math.round(deviations.reduce(function (s, d) { return s + d; }, 0) / deviations.length)
      : 0;

    var doneTasks  = tasks.filter(function (t) { return t.status === "completada"; }).length;
    var execIndex  = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

    var overdueTasks = tasks.filter(function (t) {
      return t.status !== "completada" && t.status !== "cancelada" && _isPast_(t.plannedEnd);
    }).length;
    var delayIndex = tasks.length > 0 ? Math.round((overdueTasks / tasks.length) * 100) : 0;

    return {
      avgClosureTime:  avgClosure,
      dateDeviationAvg: avgDev,
      executionIndex:  execIndex,
      delayIndex:      delayIndex,
    };
  }

  // ─── Owner load calculator ───────────────────────────────────────────────────

  function _calcOwnerLoad_(plans, tasks) {
    var owners = {};

    plans.forEach(function (p) {
      if (!p.owner) return;
      if (!owners[p.owner]) owners[p.owner] = { owner: p.owner, activePlans: 0, activeTasks: 0, completedTasks: 0, overdueTasks: 0 };
      if (p.status === "activo" || p.status === "en_riesgo") owners[p.owner].activePlans++;
    });

    tasks.forEach(function (t) {
      if (!t.assignedTo) return;
      if (!owners[t.assignedTo]) owners[t.assignedTo] = { owner: t.assignedTo, activePlans: 0, activeTasks: 0, completedTasks: 0, overdueTasks: 0 };
      if (t.status === "en_progreso" || t.status === "pendiente") owners[t.assignedTo].activeTasks++;
      if (t.status === "completada") owners[t.assignedTo].completedTasks++;
      if (t.status !== "completada" && t.status !== "cancelada" && _isPast_(t.plannedEnd)) owners[t.assignedTo].overdueTasks++;
    });

    return Object.values(owners).map(function (o) {
      var total = o.completedTasks + o.overdueTasks + o.activeTasks;
      return Object.assign({}, o, {
        complianceRate: total > 0 ? Math.round((o.completedTasks / total) * 100) : 100,
      });
    }).sort(function (a, b) { return b.activePlans - a.activePlans; });
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  function _buildDashboard_() {
    var plans     = _plans_({});
    var tasks     = _detectBlocks_(_tasks_({}));
    var milestones = _milestones_({});
    var today     = _today_();

    var active   = plans.filter(function (p) { return p.status === "activo" || p.status === "en_riesgo"; });
    var critical = plans.filter(function (p) { return p.status === "en_riesgo" || p.priority === "critica"; });
    var overduePlans = plans.filter(function (p) {
      return p.status !== "completado" && p.status !== "archivado" && p.status !== "cancelado" && _isPast_(p.targetDate);
    });

    var avgProgress = active.length > 0
      ? Math.round(active.reduce(function (s, p) { return s + (Number(p.progress) || 0); }, 0) / active.length)
      : 0;

    var lateTasks = tasks.filter(function (t) {
      return t.status !== "completada" && t.status !== "cancelada" && _isPast_(t.plannedEnd);
    });
    var blockedTasks = tasks.filter(function (t) { return t.isBlocked; });

    var urgentMilestones = milestones.filter(function (m) {
      return m.status !== "completado" && m.status !== "cancelado" && m.plannedDate;
    }).sort(function (a, b) { return a.plannedDate.localeCompare(b.plannedDate); }).slice(0, 5);

    var unitMap = {};
    plans.forEach(function (p) {
      var u = p.organizationalUnitLabel || p.organizationalUnitId || "Sin unidad";
      if (!unitMap[u]) unitMap[u] = { unit: u, planCount: 0, taskCount: 0 };
      unitMap[u].planCount++;
    });
    tasks.forEach(function (t) {
      var plan = plans.find(function (p) { return p.id === t.actionPlanId; });
      var u = plan ? (plan.organizationalUnitLabel || "Sin unidad") : "Sin unidad";
      if (!unitMap[u]) unitMap[u] = { unit: u, planCount: 0, taskCount: 0 };
      unitMap[u].taskCount++;
    });

    var recentPlans = plans
      .sort(function (a, b) { return (b.updatedAt || "").localeCompare(a.updatedAt || ""); })
      .slice(0, 5);

    return {
      activePlans:       active.length,
      criticalPlans:     critical.length,
      avgProgress:       avgProgress,
      overduePlans:      overduePlans.length,
      lateTasks:         lateTasks.length,
      blockedTasks:      blockedTasks.length,
      metrics:           _calcMetrics_(plans, tasks),
      ownerLoad:         _calcOwnerLoad_(plans, tasks),
      recentPlans:       recentPlans,
      urgentMilestones:  urgentMilestones,
      unitLoad:          Object.values(unitMap),
      generatedAt:       new Date().toISOString(),
    };
  }

  // ─── Calendar event builder ──────────────────────────────────────────────────

  function _buildCalendarEvents_(from, to, filters) {
    var plans     = _plans_({});
    var milestones = _milestones_({});
    var tasks     = _tasks_({});
    var events    = [];

    var typesFilter = filters.types || ["plan", "hito", "tarea"];
    var ownerFilter = filters.owner;
    var unitFilter  = filters.unit;

    plans.forEach(function (p) {
      if (typesFilter.indexOf("plan") < 0) return;
      if (ownerFilter && p.owner !== ownerFilter) return;
      if (unitFilter  && p.organizationalUnitId !== unitFilter) return;
      var start = p.startDate || p.createdAt.slice(0, 10);
      var end   = p.targetDate || start;
      if (end < from || start > to) return;
      events.push({ id: p.id, type: "plan", title: p.title, start: start, end: end,
        status: p.status, priority: p.priority, owner: p.owner,
        unit: p.organizationalUnitLabel, relatedPlanId: p.id });
    });

    milestones.forEach(function (m) {
      if (typesFilter.indexOf("hito") < 0) return;
      var d = m.plannedDate;
      if (!d || d < from || d > to) return;
      var plan = plans.find(function (p) { return p.id === m.actionPlanId; });
      if (ownerFilter && plan && plan.owner !== ownerFilter) return;
      if (unitFilter  && plan && plan.organizationalUnitId !== unitFilter) return;
      events.push({ id: m.id, type: "hito", title: m.title, start: d, end: d,
        status: m.status, priority: "media", owner: plan ? plan.owner : "",
        unit: plan ? plan.organizationalUnitLabel : "", relatedPlanId: m.actionPlanId });
    });

    tasks.forEach(function (t) {
      if (typesFilter.indexOf("tarea") < 0) return;
      if (ownerFilter && t.assignedTo !== ownerFilter) return;
      var start = t.plannedStart, end = t.plannedEnd;
      if (!start || !end || end < from || start > to) return;
      events.push({ id: t.id, type: "tarea", title: t.title, start: start, end: end,
        status: t.status, priority: t.priority, owner: t.assignedTo,
        relatedPlanId: t.actionPlanId });
    });

    return events;
  }

  // ─── Completion eligibility ──────────────────────────────────────────────────

  function _checkEligibility_(planId) {
    var tasks     = _tasks_({ actionPlanId: planId });
    var milestones = _milestones_({ actionPlanId: planId });

    var pendingTasks = tasks.filter(function (t) {
      return t.status !== "completada" && t.status !== "cancelada";
    });
    var pendingMilestones = milestones.filter(function (m) {
      return m.status !== "completado" && m.status !== "cancelado";
    });

    var reasons = [];
    if (pendingTasks.length > 0)
      reasons.push(pendingTasks.length + " tarea(s) pendiente(s) o en progreso");
    if (pendingMilestones.length > 0)
      reasons.push(pendingMilestones.length + " hito(s) sin completar");

    return {
      planId:            planId,
      eligible:          reasons.length === 0,
      pendingTasks:      pendingTasks.length,
      pendingMilestones: pendingMilestones.length,
      reasons:           reasons,
    };
  }

  // ─── Auto-generation from source engine ─────────────────────────────────────

  function _templatesForSource_(sourceType) {
    var tpl = {
      iie_diagnosis:       { title: "Plan de acción: Diagnóstico IIE", milestones: ["Análisis de causa raíz", "Definición de acciones", "Implementación", "Verificación"] },
      iie_recommendation:  { title: "Implementación de recomendación IIE", milestones: ["Evaluación de recomendación", "Planificación", "Ejecución", "Cierre y evidencia"] },
      cpe_gap:             { title: "Cierre de brecha CPE", milestones: ["Diagnóstico de brecha", "Plan de remediación", "Implementación", "Validación de cierre"] },
      cpe_plan_mejora:     { title: "Ejecución de plan de mejora CPE", milestones: ["Revisión del plan", "Asignación de recursos", "Ejecución", "Seguimiento y cierre"] },
      eip_alert:           { title: "Atención de alerta EIP", milestones: ["Evaluación de impacto", "Acciones inmediatas", "Seguimiento", "Cierre de alerta"] },
      manual:              { title: "Plan de acción institucional", milestones: ["Planificación", "Ejecución", "Verificación", "Cierre"] },
    };
    return tpl[sourceType] || tpl.manual;
  }

  function _createFromSource_(params) {
    var plans = _plans_({});
    var planSeq = plans.length + 1;
    var planId  = _planId_(planSeq);
    var tpl     = _templatesForSource_(params.sourceType);
    var now     = new Date().toISOString();
    var today   = _today_();

    var plan = {
      id:                    planId,
      title:                 tpl.title + (params.sourceLabel ? ": " + params.sourceLabel : ""),
      description:           "Generado automáticamente desde " + params.sourceType.replace(/_/g, " ") + ". Fuente: " + (params.sourceLabel || params.sourceId),
      originEngine:          params.sourceType.split("_")[0],
      originEntityId:        params.sourceId,
      originEntityLabel:     params.sourceLabel || "",
      organizationalUnitId:  params.organizationalUnitId,
      organizationalUnitLabel: params.organizationalUnitLabel || "",
      priority:              params.priority || "alta",
      status:                "borrador",
      objective:             "Atender y resolver: " + (params.sourceLabel || params.sourceId),
      expectedImpact:        "Mejora del desempeño institucional mediante resolución estructurada",
      riskLevel:             "medio",
      owner:                 params.owner,
      startDate:             today,
      targetDate:            params.targetDate,
      completionDate:        "",
      progress:              0,
      milestoneCount:        tpl.milestones.length,
      taskCount:             0,
      completedMilestones:   0,
      completedTasks:        0,
      overdueTasks:          0,
      blockedTasks:          0,
      createdBy:             params.owner,
      createdAt:             now,
      updatedAt:             now,
    };

    createEntity_("ioeActionPlans", plan);

    var milestones = _milestones_({ actionPlanId: planId });
    var daysPerMilestone = Math.floor(_daysDiff_(today, params.targetDate) / tpl.milestones.length);

    tpl.milestones.forEach(function (title, i) {
      var milestoneSeq = milestones.length + i + 1;
      var milestoneId  = _milestoneId_(planId, milestoneSeq);
      var plannedDate  = new Date(today);
      plannedDate.setDate(plannedDate.getDate() + daysPerMilestone * (i + 1));

      createEntity_("ioeMilestones", {
        id:             milestoneId,
        actionPlanId:   planId,
        title:          title,
        description:    "",
        plannedDate:    plannedDate.toISOString().slice(0, 10),
        completedDate:  "",
        status:         "pendiente",
        weight:         Math.round(100 / tpl.milestones.length),
        taskCount:      0,
        completedTasks: 0,
      });
    });

    return getEntity_("ioeActionPlans", planId);
  }

  // ─── Plan closure ────────────────────────────────────────────────────────────

  function _closePlan_(planId, verificationNote, closedBy) {
    var elig = _checkEligibility_(planId);
    if (!elig.eligible) {
      return { success: false, reasons: elig.reasons };
    }

    var now   = new Date().toISOString();
    var today = _today_();

    updateEntity_("ioeActionPlans", planId, {
      status:          "completado",
      completionDate:  today,
      progress:        100,
      updatedAt:       now,
    });

    var decisions = _decisions_({ actionPlanId: planId });
    var decSeq    = decisions.length + 1;
    createEntity_("ioeDecisions", {
      id:             _decisionId_(planId, decSeq),
      actionPlanId:   planId,
      date:           today,
      origin:         "IOE Sistema",
      responsable:    closedBy || "Sistema",
      decision:       "Cierre formal del plan de acción",
      justification:  verificationNote || "Todas las tareas e hitos completados",
      expectedResult: "Plan archivado satisfactoriamente",
      status:         "implementada",
      createdAt:      now,
      updatedAt:      now,
    });

    return { success: true, planId: planId, closedAt: now };
  }

  // ─── Update aggregate counters on plan ──────────────────────────────────────

  function _refreshPlanCounters_(planId) {
    var tasks     = _tasks_({ actionPlanId: planId });
    var milestones = _milestones_({ actionPlanId: planId });
    var today     = _today_();

    var completedTasks      = tasks.filter(function (t) { return t.status === "completada"; }).length;
    var completedMilestones = milestones.filter(function (m) { return m.status === "completado"; }).length;
    var overdueTasks        = tasks.filter(function (t) {
      return t.status !== "completada" && t.status !== "cancelada" && _isPast_(t.plannedEnd);
    }).length;
    var blocked             = _detectBlocks_(tasks);
    var blockedTasks        = blocked.filter(function (t) { return t.isBlocked; }).length;

    updateEntity_("ioeActionPlans", planId, {
      taskCount:          tasks.length,
      milestoneCount:     milestones.length,
      completedTasks:     completedTasks,
      completedMilestones: completedMilestones,
      overdueTasks:       overdueTasks,
      blockedTasks:       blockedTasks,
      progress:           _calcProgress_(tasks),
      updatedAt:          new Date().toISOString(),
    });
  }

  // ─── Public handlers ─────────────────────────────────────────────────────────

  function getDashboard(params) {
    return _buildDashboard_();
  }

  function getActionPlans(params) {
    var filter = {};
    if (params.status)               filter.status              = params.status;
    if (params.priority)             filter.priority            = params.priority;
    if (params.originEngine)         filter.originEngine        = params.originEngine;
    if (params.organizationalUnitId) filter.organizationalUnitId = params.organizationalUnitId;
    if (params.owner)                filter.owner               = params.owner;

    var plans = _plans_(filter);

    if (params.overdue) {
      var today = _today_();
      plans = plans.filter(function (p) {
        return p.status !== "completado" && p.status !== "archivado" && p.targetDate < today;
      });
    }

    plans = plans.sort(function (a, b) {
      var pOrd = { critica: 0, alta: 1, media: 2, baja: 3 };
      return (pOrd[a.priority] || 2) - (pOrd[b.priority] || 2);
    });

    if (params.limit) plans = plans.slice(0, params.limit);
    return plans;
  }

  function getActionPlan(params) {
    return getEntity_("ioeActionPlans", params.id);
  }

  function createActionPlan(params) {
    var plans = _plans_({});
    var seq   = plans.length + 1;
    var id    = _planId_(seq);
    var now   = new Date().toISOString();

    var plan = Object.assign({
      milestoneCount: 0, taskCount: 0,
      completedMilestones: 0, completedTasks: 0,
      overdueTasks: 0, blockedTasks: 0,
      progress: 0, status: "borrador",
      riskLevel: "medio", completionDate: "",
      createdAt: now, updatedAt: now,
    }, params, { id: id });

    createEntity_("ioeActionPlans", plan);
    return getEntity_("ioeActionPlans", id);
  }

  function updateActionPlan(params) {
    var id = params.id;
    updateEntity_("ioeActionPlans", id, Object.assign({}, params, { updatedAt: new Date().toISOString() }));
    return getEntity_("ioeActionPlans", id);
  }

  function getMilestones(params) {
    var filter = {};
    if (params.actionPlanId) filter.actionPlanId = params.actionPlanId;
    if (params.status)       filter.status        = params.status;
    var milestones = _milestones_(filter);
    if (params.limit) milestones = milestones.slice(0, params.limit);
    return milestones;
  }

  function createMilestone(params) {
    var milestones = _milestones_({ actionPlanId: params.actionPlanId });
    var seq = milestones.length + 1;
    var id  = _milestoneId_(params.actionPlanId, seq);
    var m   = Object.assign({ status: "pendiente", completedDate: "", taskCount: 0, completedTasks: 0 }, params, { id: id });
    createEntity_("ioeMilestones", m);
    _refreshPlanCounters_(params.actionPlanId);
    return getEntity_("ioeMilestones", id);
  }

  function updateMilestone(params) {
    var id = params.id;
    updateEntity_("ioeMilestones", id, Object.assign({}, params));
    var m = getEntity_("ioeMilestones", id);
    if (m) _refreshPlanCounters_(m.actionPlanId);
    return m;
  }

  function getTasks(params) {
    var filter = {};
    if (params.actionPlanId) filter.actionPlanId = params.actionPlanId;
    if (params.milestoneId)  filter.milestoneId  = params.milestoneId;
    if (params.assignedTo)   filter.assignedTo   = params.assignedTo;
    if (params.status)       filter.status        = params.status;
    if (params.priority)     filter.priority      = params.priority;

    var tasks = _detectBlocks_(_tasks_(filter));

    if (params.overdue) {
      var today = _today_();
      tasks = tasks.filter(function (t) {
        return t.status !== "completada" && t.status !== "cancelada" && t.plannedEnd < today;
      });
    }

    tasks = tasks.sort(function (a, b) {
      var pOrd = { critica: 0, alta: 1, media: 2, baja: 3 };
      return (pOrd[a.priority] || 2) - (pOrd[b.priority] || 2);
    });

    if (params.limit) tasks = tasks.slice(0, params.limit);
    return tasks;
  }

  function createTask(params) {
    var planTasks = _tasks_({ actionPlanId: params.actionPlanId });
    var seq = planTasks.length + 1;
    var id  = _taskId_(params.actionPlanId, seq);
    var deps = Array.isArray(params.dependencies) ? JSON.stringify(params.dependencies) : (params.dependencies || "[]");
    var t   = Object.assign({ status: "pendiente", progress: 0, completedAt: "", isBlocked: false, blockReason: "", milestoneId: "" }, params, { id: id, dependencies: deps });
    createEntity_("ioeTasks", t);
    _refreshPlanCounters_(params.actionPlanId);
    return getEntity_("ioeTasks", id);
  }

  function updateTask(params) {
    var id  = params.id;
    var upd = Object.assign({}, params);
    if (Array.isArray(upd.dependencies)) upd.dependencies = JSON.stringify(upd.dependencies);
    updateEntity_("ioeTasks", id, upd);
    var t = getEntity_("ioeTasks", id);
    if (t) _refreshPlanCounters_(t.actionPlanId);
    return t;
  }

  function getDecisions(params) {
    var filter = {};
    if (params.actionPlanId) filter.actionPlanId = params.actionPlanId;
    if (params.status)       filter.status        = params.status;
    var decisions = _decisions_(filter);
    decisions = decisions.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    if (params.limit) decisions = decisions.slice(0, params.limit);
    return decisions;
  }

  function createDecision(params) {
    var existing = _decisions_({ actionPlanId: params.actionPlanId });
    var seq = existing.length + 1;
    var id  = _decisionId_(params.actionPlanId, seq);
    var now = new Date().toISOString();
    var d   = Object.assign({ status: "pendiente", date: _today_(), createdAt: now, updatedAt: now }, params, { id: id });
    createEntity_("ioeDecisions", d);
    return getEntity_("ioeDecisions", id);
  }

  function updateDecision(params) {
    var id = params.id;
    updateEntity_("ioeDecisions", id, Object.assign({}, params, { updatedAt: new Date().toISOString() }));
    return getEntity_("ioeDecisions", id);
  }

  function getCalendarEvents(params) {
    return _buildCalendarEvents_(params.from, params.to, {
      types:  params.types,
      owner:  params.owner,
      unit:   params.unit,
    });
  }

  function createFromSource(params) {
    return _createFromSource_(params);
  }

  function checkCompletionEligibility(params) {
    return _checkEligibility_(params.planId);
  }

  function closePlan(params) {
    return _closePlan_(params.planId, params.verificationNote, params.closedBy);
  }

  function getMetrics(params) {
    var plans = _plans_({});
    var tasks = _tasks_({});
    return _calcMetrics_(plans, tasks);
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  return {
    getDashboard:              getDashboard,
    getActionPlans:            getActionPlans,
    getActionPlan:             getActionPlan,
    createActionPlan:          createActionPlan,
    updateActionPlan:          updateActionPlan,
    getMilestones:             getMilestones,
    createMilestone:           createMilestone,
    updateMilestone:           updateMilestone,
    getTasks:                  getTasks,
    createTask:                createTask,
    updateTask:                updateTask,
    getDecisions:              getDecisions,
    createDecision:            createDecision,
    updateDecision:            updateDecision,
    getCalendarEvents:         getCalendarEvents,
    createFromSource:          createFromSource,
    checkCompletionEligibility: checkCompletionEligibility,
    closePlan:                 closePlan,
    getMetrics:                getMetrics,
  };
})();
