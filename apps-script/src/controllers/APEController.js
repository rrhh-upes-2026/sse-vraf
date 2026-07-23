/**
 * APE — Activity Planning Engine Controller.
 *
 * Generates and manages the institutional operational planning for PME activities.
 * Scope: planning ONLY. No tracking, evidence, compliance, or execution state.
 *
 * GENERATION RULES:
 *   Única        → 1 plan  (full year)
 *   Diaria       → 365 plans
 *   Semanal      → 52 plans
 *   Quincenal    → 24 plans
 *   Mensual      → 12 plans
 *   Bimestral    →  6 plans
 *   Trimestral   →  4 plans
 *   Cuatrimestral→  3 plans
 *   Semestral    →  2 plans
 *   Anual        →  1 plan  (same as Única for one year)
 *   Personalizada→ caller supplies explicit dates array
 *
 * REGENERATION MODES:
 *   nuevo      — create; fail if any plan already exists for activity+year
 *   regenerar  — archive existing + create fresh
 *   mantener   — keep existing, add only missing execution numbers
 *   duplicar   — create a parallel set (does NOT touch existing plans)
 */
var APEController = (function () {

  var APE_WS_ID = "ape";

  // ── Private helpers ──────────────────────────────────────────────────────────

  function _wsId(params) {
    return params.wsId || APE_WS_ID;
  }

  function _now() {
    return new Date().toISOString();
  }

  function _pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function _dateStr(d) {
    return d.getFullYear() + "-" + _pad2(d.getMonth() + 1) + "-" + _pad2(d.getDate());
  }

  function _isoWeek(d) {
    var date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    var jan4 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
  }

  function _quarter(month) { return Math.ceil(month / 3); }
  function _semester(month) { return month <= 6 ? 1 : 2; }

  function _lastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  // ── Occurrence generators ────────────────────────────────────────────────────

  function _buildOccurrences(periodicidad, year) {
    var y = parseInt(year) || new Date().getFullYear();
    var results = [];

    switch (periodicidad) {

      case "Única":
      case "Anual":
        results.push({
          startDate: y + "-01-01",
          endDate:   y + "-12-31",
          month: 1, quarter: 1, semester: 1, week: 1, number: 1,
        });
        break;

      case "Semestral":
        results.push({ startDate: y + "-01-01", endDate: y + "-06-30",
          month: 1, quarter: 1, semester: 1, week: 1, number: 1 });
        results.push({ startDate: y + "-07-01", endDate: y + "-12-31",
          month: 7, quarter: 3, semester: 2, week: 27, number: 2 });
        break;

      case "Cuatrimestral":
        var cuaRanges = [
          [1, 4, y + "-01-01", y + "-04-30"],
          [5, 8, y + "-05-01", y + "-08-31"],
          [9, 12, y + "-09-01", y + "-12-31"],
        ];
        for (var ci = 0; ci < cuaRanges.length; ci++) {
          var cr = cuaRanges[ci];
          results.push({
            startDate: cr[2], endDate: cr[3],
            month: cr[0], quarter: _quarter(cr[0]), semester: _semester(cr[0]),
            week: _isoWeek(new Date(cr[2])), number: ci + 1,
          });
        }
        break;

      case "Trimestral":
        for (var q = 0; q < 4; q++) {
          var qM = q * 3;
          var qStart = new Date(y, qM, 1);
          var qEnd   = new Date(y, qM + 3, 0);
          results.push({
            startDate: _dateStr(qStart), endDate: _dateStr(qEnd),
            month: qM + 1, quarter: q + 1, semester: _semester(qM + 1),
            week: _isoWeek(qStart), number: q + 1,
          });
        }
        break;

      case "Bimestral":
        for (var b = 0; b < 6; b++) {
          var bM = b * 2;
          var bStart = new Date(y, bM, 1);
          var bEnd   = new Date(y, bM + 2, 0);
          results.push({
            startDate: _dateStr(bStart), endDate: _dateStr(bEnd),
            month: bM + 1, quarter: _quarter(bM + 1), semester: _semester(bM + 1),
            week: _isoWeek(bStart), number: b + 1,
          });
        }
        break;

      case "Mensual":
        for (var m = 0; m < 12; m++) {
          var mStart = new Date(y, m, 1);
          var mEnd   = new Date(y, m + 1, 0);
          results.push({
            startDate: _dateStr(mStart), endDate: _dateStr(mEnd),
            month: m + 1, quarter: _quarter(m + 1), semester: _semester(m + 1),
            week: _isoWeek(mStart), number: m + 1,
          });
        }
        break;

      case "Quincenal":
        var qnNum = 1;
        for (var qnm = 0; qnm < 12; qnm++) {
          var q1Start = new Date(y, qnm, 1);
          var q1End   = new Date(y, qnm, 15);
          var q2Start = new Date(y, qnm, 16);
          var q2End   = new Date(y, qnm + 1, 0);
          results.push({ startDate: _dateStr(q1Start), endDate: _dateStr(q1End),
            month: qnm + 1, quarter: _quarter(qnm + 1), semester: _semester(qnm + 1),
            week: _isoWeek(q1Start), number: qnNum++ });
          results.push({ startDate: _dateStr(q2Start), endDate: _dateStr(q2End),
            month: qnm + 1, quarter: _quarter(qnm + 1), semester: _semester(qnm + 1),
            week: _isoWeek(q2Start), number: qnNum++ });
        }
        break;

      case "Semanal":
        var sw = new Date(y, 0, 1);
        // move to Monday
        while (sw.getDay() !== 1) sw.setDate(sw.getDate() + 1);
        var swNum = 1;
        while (sw.getFullYear() === y) {
          var swEnd = new Date(sw);
          swEnd.setDate(swEnd.getDate() + 6);
          results.push({
            startDate: _dateStr(sw), endDate: _dateStr(swEnd),
            month: sw.getMonth() + 1, quarter: _quarter(sw.getMonth() + 1),
            semester: _semester(sw.getMonth() + 1),
            week: swNum, number: swNum,
          });
          sw.setDate(sw.getDate() + 7);
          swNum++;
          if (swNum > 53) break;
        }
        break;

      case "Diaria":
        var dd = new Date(y, 0, 1);
        var ddNum = 1;
        while (dd.getFullYear() === y) {
          results.push({
            startDate: _dateStr(dd), endDate: _dateStr(dd),
            month: dd.getMonth() + 1, quarter: _quarter(dd.getMonth() + 1),
            semester: _semester(dd.getMonth() + 1),
            week: _isoWeek(dd), number: ddNum,
          });
          dd.setDate(dd.getDate() + 1);
          ddNum++;
          if (ddNum > 366) break;
        }
        break;

      default:
        // Personalizada — caller must provide explicit dates via params.customDates
        break;
    }

    return results;
  }

  // ── History helper ────────────────────────────────────────────────────────────

  function _record(planId, accion, usuario, detalle, wsId) {
    try {
      createEntity_("apeHistorial", {
        id:       IdGen.uuid(),
        wsId:     wsId || APE_WS_ID,
        planId:   planId,
        accion:   accion,
        usuario:  usuario || "",
        detalle:  JSON.stringify(detalle || {}),
        createdAt: _now(),
      });
    } catch (e) {
      AppLogger.warn("APEController._record failed", { error: String(e) });
    }
  }

  // ── List / Get ───────────────────────────────────────────────────────────────

  function listPlanes(params) {
    var filter = { wsId: _wsId(params) };
    if (params.activityId)         filter.activityId         = params.activityId;
    if (params.processId)          filter.processId          = params.processId;
    if (params.procedureId)        filter.procedureId        = params.procedureId;
    if (params.organizationalUnitId) filter.organizationalUnitId = params.organizationalUnitId;
    if (params.year)               filter.year               = params.year;
    if (params.status)             filter.status             = params.status;
    if (params.priority)           filter.priority           = params.priority;
    if (params.periodicity)        filter.periodicity        = params.periodicity;
    if (params.responsibleUser)    filter.responsibleUser    = params.responsibleUser;
    if (params.plannedMonth)       filter.plannedMonth       = params.plannedMonth;
    if (params.plannedQuarter)     filter.plannedQuarter     = params.plannedQuarter;
    if (params.plannedSemester)    filter.plannedSemester    = params.plannedSemester;
    if (params._page)              filter._page              = params._page;
    if (params._pageSize)          filter._pageSize           = params._pageSize;
    if (params._sortBy)            filter._sortBy             = params._sortBy  || "plannedStartDate";
    if (params._sortDir)           filter._sortDir            = params._sortDir || "asc";
    return listEntities_("apePlanes", filter);
  }

  function getPlan(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("apePlanes", params.id);
  }

  // ── Create single plan ────────────────────────────────────────────────────────

  function createPlan(params) {
    Validator.requireFields(params, ["activityId", "title", "plannedStartDate"]);
    var wsId = _wsId(params);
    var now  = _now();
    var data = Object.assign({}, params, {
      id:        IdGen.uuid(),
      wsId:      wsId,
      status:    params.status || "Programada",
      priority:  params.priority || "Media",
      dependencies: params.dependencies || "",
      notes:     params.notes || "",
      createdBy: params.userId || "",
      createdAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
      deletedAt: "",
    });
    delete data.userId;
    var entity = createEntity_("apePlanes", data);
    _record(entity.id, "generado", data.createdBy, { title: entity.title }, wsId);
    return entity;
  }

  // ── Update ────────────────────────────────────────────────────────────────────

  function updatePlan(params) {
    Validator.requireFields(params, ["id"]);
    var wsId = _wsId(params);
    var now  = _now();
    var patch = Object.assign({}, params, {
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    delete patch.userId;
    var entity = updateEntity_("apePlanes", params.id, patch);
    _record(entity.id, "actualizado", patch.updatedBy, {}, wsId);
    return entity;
  }

  // ── State transitions (no delete — only archive/cancel) ───────────────────────

  function cambiarEstado(params) {
    Validator.requireFields(params, ["id", "status"]);
    var allowed = ["Programada", "Próxima", "Pendiente", "Archivada", "Cancelada"];
    if (allowed.indexOf(params.status) === -1) {
      throw new Error("Estado inválido: " + params.status +
        ". Permitidos: " + allowed.join(", "));
    }
    var wsId = _wsId(params);
    var now  = _now();
    var entity = updateEntity_("apePlanes", params.id, {
      status:    params.status,
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    var accionMap = {
      "Programada": "programado", "Próxima": "proximo",
      "Pendiente": "pendiente", "Archivada": "archivado", "Cancelada": "cancelado",
    };
    _record(entity.id, accionMap[params.status] || "actualizado",
      params.userId || "", { status: params.status }, wsId);
    return entity;
  }

  // ── Auto-generate plans for an activity ──────────────────────────────────────

  function generatePlans(params) {
    Validator.requireFields(params, ["activityId", "year"]);
    var wsId  = _wsId(params);
    var mode  = params.mode || "nuevo"; // nuevo | regenerar | mantener | duplicar

    // Check for existing plans
    var existing = listEntities_("apePlanes", {
      wsId: wsId, activityId: params.activityId, year: params.year, _pageSize: 9999,
    });
    var existingItems = existing.items || [];

    if (mode === "nuevo" && existingItems.length > 0) {
      throw new Error(
        "Ya existen " + existingItems.length +
        " planes para esta actividad en el año " + params.year +
        ". Use mode='regenerar', 'mantener' o 'duplicar'."
      );
    }

    // Archive existing if regenerating
    if (mode === "regenerar" && existingItems.length > 0) {
      var now = _now();
      for (var i = 0; i < existingItems.length; i++) {
        var ex = existingItems[i];
        updateEntity_("apePlanes", ex.id, {
          status: "Archivada", deletedAt: now,
          updatedBy: params.userId || "", updatedAt: now,
        });
        _record(ex.id, "regenerado", params.userId || "", { year: params.year }, wsId);
      }
    }

    // Build occurrence list
    var periodicidad = params.periodicity || "Mensual";
    var occurrences  = _buildOccurrences(periodicidad, params.year);

    // For 'mantener': filter to numbers not already present
    if (mode === "mantener" && existingItems.length > 0) {
      var existingNums = {};
      existingItems.forEach(function (e) {
        existingNums[String(e.plannedExecutionNumber)] = true;
      });
      occurrences = occurrences.filter(function (o) {
        return !existingNums[String(o.number)];
      });
    }

    // Personalizada: use caller-supplied dates
    if (periodicidad === "Personalizada" && params.customDates) {
      try {
        occurrences = JSON.parse(params.customDates);
      } catch (e) {
        throw new Error("customDates debe ser un JSON array válido.");
      }
    }

    var created  = [];
    var baseTitle = params.title || ("Plan " + params.year);

    for (var j = 0; j < occurrences.length; j++) {
      var occ  = occurrences[j];
      var now2 = _now();
      var plan = {
        id:                    IdGen.uuid(),
        wsId:                  wsId,
        activityId:            params.activityId,
        processId:             params.processId          || "",
        procedureId:           params.procedureId        || "",
        organizationalUnitId:  params.organizationalUnitId || "",
        title:                 baseTitle + " #" + occ.number,
        description:           params.description        || "",
        year:                  String(params.year),
        plannedStartDate:      occ.startDate,
        plannedEndDate:        occ.endDate,
        plannedMonth:          String(occ.month),
        plannedQuarter:        String(occ.quarter),
        plannedSemester:       String(occ.semester),
        plannedWeek:           String(occ.week),
        plannedExecutionNumber: String(occ.number),
        periodicity:           periodicidad,
        responsibleUser:       params.responsibleUser    || "",
        responsiblePosition:   params.responsiblePosition || "",
        priority:              params.priority            || "Media",
        status:                "Programada",
        plannedHours:          params.plannedHours        || "",
        dependencies:          "",
        notes:                 "",
        createdBy:             params.userId || "",
        createdAt:             now2,
        updatedBy:             params.userId || "",
        updatedAt:             now2,
        deletedAt:             "",
      };
      var entity = createEntity_("apePlanes", plan);
      _record(entity.id, "generado", params.userId || "",
        { executionNumber: occ.number, period: occ.startDate }, wsId);
      created.push(entity);
    }

    return { created: created.length, plans: created };
  }

  // ── Preview (dry-run, no DB writes) ──────────────────────────────────────────

  function previewGeneration(params) {
    Validator.requireFields(params, ["year", "periodicity"]);
    var occurrences = _buildOccurrences(params.periodicity, params.year);
    return { count: occurrences.length, occurrences: occurrences };
  }

  // ── Historial ─────────────────────────────────────────────────────────────────

  function getHistorial(params) {
    var filter = { wsId: _wsId(params) };
    if (params.planId)      filter.planId      = params.planId;
    if (params.activityId)  filter.activityId  = params.activityId;
    filter._sortBy  = "createdAt";
    filter._sortDir = "desc";
    return listEntities_("apeHistorial", filter);
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────

  function getDashboard(params) {
    var wsId    = _wsId(params);
    var yearNow = params.year || String(new Date().getFullYear());
    var result  = listEntities_("apePlanes", { wsId: wsId, year: yearNow, _pageSize: 9999 });
    var planes  = result.items || [];

    var byStatus = {}, byPriority = {}, byMonth = {}, byUnit = {}, byUser = {};
    var upcoming = [];
    var todayStr = (new Date()).toISOString().slice(0, 10);

    planes.forEach(function (p) {
      byStatus[p.status]   = (byStatus[p.status]   || 0) + 1;
      byPriority[p.priority] = (byPriority[p.priority] || 0) + 1;
      var monthKey = p.plannedMonth ? ("Mes " + p.plannedMonth) : "Sin mes";
      byMonth[monthKey]    = (byMonth[monthKey]    || 0) + 1;
      if (p.organizationalUnitId) {
        byUnit[p.organizationalUnitId] = (byUnit[p.organizationalUnitId] || 0) + 1;
      }
      if (p.responsibleUser) {
        byUser[p.responsibleUser] = (byUser[p.responsibleUser] || 0) + 1;
      }
      if (p.status !== "Archivada" && p.status !== "Cancelada" &&
          p.plannedStartDate >= todayStr) {
        upcoming.push(p);
      }
    });

    upcoming.sort(function (a, b) {
      return a.plannedStartDate < b.plannedStartDate ? -1 : 1;
    });

    return {
      year:       yearNow,
      total:      planes.length,
      byStatus:   byStatus,
      byPriority: byPriority,
      byMonth:    byMonth,
      byUnit:     byUnit,
      byUser:     byUser,
      upcoming:   upcoming.slice(0, 10),
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  return {
    listPlanes:         listPlanes,
    getPlan:            getPlan,
    createPlan:         createPlan,
    updatePlan:         updatePlan,
    cambiarEstado:      cambiarEstado,
    generatePlans:      generatePlans,
    previewGeneration:  previewGeneration,
    getHistorial:       getHistorial,
    getDashboard:       getDashboard,
  };
})();
