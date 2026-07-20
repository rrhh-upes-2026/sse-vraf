/**
 * ContratacionController — PRO-TH-001 Hiring Process backend.
 *
 * Handles all contratacion.* router actions. Uses the dataJson pattern:
 * flat columns store filterable scalar fields; full object serialized in dataJson.
 *
 * Entity map:
 *   contratProcesos        → ContratProcesos sheet
 *   contratRequisiciones   → ContratRequisiciones sheet
 *   contratInformesTec     → ContratInformesTec sheet
 *   contratInformesFinales → ContratInformesFinales sheet
 *   contratCartasOferta    → ContratCartasOferta sheet
 *   contratExpedientes     → ContratExpedientes sheet
 *   contratFichasEmp       → ContratFichasEmp sheet
 *   contratFichasDoc       → ContratFichasDoc sheet
 *   contratContratos       → ContratContratos sheet
 *   contratCandidatos      → ContratCandidatos sheet
 */

var ContratacionController = (function () {

  // ── Entity name by document type ────────────────────────────────────────────

  var TIPO_ENTITY = {
    requisicion:    "contratRequisiciones",
    informeTecnico: "contratInformesTec",
    informeFinal:   "contratInformesFinales",
    cartaOferta:    "contratCartasOferta",
    expediente:     "contratExpedientes",
    fichaEmpleado:  "contratFichasEmp",
    fichaDocente:   "contratFichasDoc",
    contrato:       "contratContratos",
  };

  // ── Process stage machine ────────────────────────────────────────────────────

  var FLUJO = [
    "identificacion_necesidad", "requisicion", "estrategia_reclutamiento",
    "publicacion_vacante", "recepcion_cv", "entrevista_preliminar", "pruebas",
    "entrevista_rrhh", "conformacion_terna", "entrevista_final", "informe_seleccion",
    "validacion_rector", "carta_oferta", "creacion_expediente", "elaboracion_contrato",
    "firma_contrato", "comunicacion", "vinculacion_induccion", "completado",
  ];

  var PASO_MAP = {
    identificacion_necesidad: 1, requisicion: 8, estrategia_reclutamiento: 9,
    publicacion_vacante: 10, recepcion_cv: 12, entrevista_preliminar: 13,
    pruebas: 14, entrevista_rrhh: 15, conformacion_terna: 16, entrevista_final: 17,
    informe_seleccion: 18, validacion_rector: 19, carta_oferta: 21,
    creacion_expediente: 23, elaboracion_contrato: 24, firma_contrato: 25,
    comunicacion: 26, vinculacion_induccion: 27, completado: 27,
  };

  function siguienteEtapa_(etapa) {
    var idx = FLUJO.indexOf(etapa);
    return (idx >= 0 && idx < FLUJO.length - 1) ? FLUJO[idx + 1] : "completado";
  }

  // ── Serialization helpers ────────────────────────────────────────────────────

  function parseRow_(row) {
    if (!row) return null;
    var data = {};
    try { data = JSON.parse(row.dataJson || "{}"); } catch (e) {}
    return Object.assign({}, data, { id: row.id });
  }

  function flatForTipo_(tipo, data) {
    switch (tipo) {
      case "requisicion":
        return {
          nombrePuesto:    data.nombrePuesto    || "",
          tipoRequisicion: data.tipoRequisicion || "",
          tipoContratacion: data.tipoContratacion || "permanente",
          estado:          data.estado          || "borrador",
        };
      case "informeTecnico":
        return {
          cargo:                data.cargo                || "",
          candidatoRecomendado: data.candidatoRecomendado || "",
          estado:               data.estado               || "borrador",
        };
      case "informeFinal":
        return {
          puestoCubrir:         data.puestoCubrir         || "",
          candidatoSeleccionado: data.candidatoSeleccionado || "",
          estado:               data.estado               || "borrador",
        };
      case "cartaOferta":
        return {
          candidatoId:    data.candidatoId    || "",
          estado:         data.estado         || "emitida",
          salarioMensual: data.salarioMensual || 0,
          cargoOfrecido:  data.cargoOfrecido  || "",
        };
      case "expediente":
        return {
          nombreCompleto:  data.nombreCompleto  || "",
          cargo:           data.cargo           || "",
          estadoExpediente: data.estadoExpediente || "incompleto",
        };
      case "fichaEmpleado":
        return {
          nombres:             data.nombres             || "",
          primerApellido:      data.primerApellido      || "",
          cargo:               data.cargo               || "",
          area:                data.area                || "",
          tipoContrato:        data.tipoContrato        || "permanente",
          salario:             data.salario             || 0,
          correoInstitucional: data.correoInstitucional || "",
        };
      case "fichaDocente":
        return {
          nombre:      data.nombre      || "",
          correoUPES:  data.correoUPES  || "",
          facultad:    data.facultad    || "",
          carrera:     data.carrera     || "",
        };
      case "contrato":
        return {
          nombreEmpleado: data.nombreEmpleado || "",
          cargo:          data.cargo          || "",
          salario:        data.salario        || 0,
          estado:         data.estado         || "borrador",
        };
      default:
        return {};
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  return {

    listProcesos: function (params) {
      var filter = {};
      if (params.wsId) filter.wsId = params.wsId;
      if (params.etapaActual) filter.etapaActual = params.etapaActual;
      if (params.prioridad) filter.prioridad = params.prioridad;
      var result = listEntities_("contratProcesos", filter);
      return (result.items || []).map(parseRow_);
    },

    getProceso: function (params) {
      if (!params.id) throw new Error("id is required");
      return parseRow_(getEntity_("contratProcesos", params.id));
    },

    crearProceso: function (params) {
      Validator.requireFields(params, ["wsId", "nombrePuesto"]);
      var now_ = new Date().toISOString();
      var id = IdGen.uuid();
      AppLogger.info("ContratacionController.crearProceso", { wsId: params.wsId, nombrePuesto: params.nombrePuesto });
      var proceso = Object.assign({
        tipoPuesto:       "plaza_existente",
        nombrePuesto:     "",
        unidadFacultad:   "",
        jefeSolicitante:  "",
        cargoSolicitante: "",
        tipoContratacion: "permanente",
        etapaActual:      "identificacion_necesidad",
        pasoActual:       1,
        prioridad:        "normal",
        candidatos:       [],
        terna:            [],
        opcionesOferta:   [],
        historial:        [],
        createdAt:        now_,
        updatedAt:        now_,
      }, params, {
        id: id,
        historial: [{
          id: IdGen.uuid(),
          fecha: now_,
          paso: 1,
          etapa: "identificacion_necesidad",
          accion: "Proceso de contratación iniciado",
          responsable: params.jefeSolicitante || "Sistema",
          resultado: "ejecutado",
        }],
      });

      createEntity_("contratProcesos", {
        id:                    id,
        wsId:                  proceso.wsId || "",
        codigo:                proceso.codigo || id,
        nombrePuesto:          proceso.nombrePuesto,
        unidadFacultad:        proceso.unidadFacultad,
        jefeSolicitante:       proceso.jefeSolicitante,
        tipoContratacion:      proceso.tipoContratacion,
        etapaActual:           proceso.etapaActual,
        pasoActual:            proceso.pasoActual,
        prioridad:             proceso.prioridad,
        requisicionId:         "",
        informeTecnicoId:      "",
        informeFinalId:        "",
        cartaOfertaId:         "",
        expedienteId:          "",
        contratoId:            "",
        fichaEmpleadoId:       "",
        candidatoSeleccionadoId: "",
        dataJson:              JSON.stringify(proceso),
        createdAt:             now_,
        updatedAt:             now_,
      });

      return proceso;
    },

    avanzarEtapa: function (params) {
      Validator.requireFields(params, ["id", "resultado"]);
      AppLogger.info("ContratacionController.avanzarEtapa", { id: params.id, resultado: params.resultado });

      var now_ = new Date().toISOString();
      var row = getEntity_("contratProcesos", params.id);
      if (!row) throw new Error("Proceso " + params.id + " no encontrado");

      var proceso = parseRow_(row);
      var nuevaEtapa = params.resultado === "rechazado"
        ? "rechazado"
        : siguienteEtapa_(proceso.etapaActual);
      var nuevoPaso = PASO_MAP[nuevaEtapa] || 1;

      var historial = Array.isArray(proceso.historial) ? proceso.historial : [];
      historial.push({
        id:          IdGen.uuid(),
        fecha:       now_,
        paso:        nuevoPaso,
        etapa:       nuevaEtapa,
        accion:      params.resultado === "aprobado"
          ? "Aprobado → " + nuevaEtapa
          : "Rechazado en " + proceso.etapaActual,
        notas:       params.notas || "",
        responsable: params.responsable || "",
        resultado:   params.resultado,
      });

      var actualizado = Object.assign({}, proceso, {
        etapaActual: nuevaEtapa,
        pasoActual:  nuevoPaso,
        historial:   historial,
        updatedAt:   now_,
      });

      updateEntity_("contratProcesos", params.id, {
        etapaActual: nuevaEtapa,
        pasoActual:  nuevoPaso,
        dataJson:    JSON.stringify(actualizado),
        updatedAt:   now_,
      });

      return actualizado;
    },

    guardarDocumento: function (params) {
      Validator.requireFields(params, ["tipo", "procesoId"]);
      var tipo = params.tipo;
      var entity = TIPO_ENTITY[tipo];
      if (!entity) throw new Error("Tipo de documento no reconocido: " + tipo);
      AppLogger.info("ContratacionController.guardarDocumento", { tipo: tipo, procesoId: params.procesoId });

      var procesoId = params.procesoId;
      var now_ = new Date().toISOString();

      var data = Object.assign({}, params);
      delete data.tipo;

      var existing = listEntities_(entity, { procesoId: procesoId });
      var existingRow = existing.items && existing.items[0];

      var flat = flatForTipo_(tipo, data);
      flat.dataJson  = JSON.stringify(data);
      flat.procesoId = procesoId;

      if (existingRow) {
        flat.updatedAt = now_;
        updateEntity_(entity, existingRow.id, flat);
        return Object.assign({}, data, { id: existingRow.id, procesoId: procesoId });
      }

      var newId = IdGen.uuid();
      flat.id        = newId;
      flat.createdAt = now_;
      flat.updatedAt = now_;
      createEntity_(entity, flat);
      return Object.assign({}, data, { id: newId, procesoId: procesoId });
    },

    getDocumento: function (params) {
      var tipo = params.tipo;
      var entity = TIPO_ENTITY[tipo];
      if (!entity) throw new Error("Tipo no reconocido: " + tipo);
      var result = listEntities_(entity, { procesoId: params.procesoId });
      return parseRow_(result.items && result.items[0]);
    },

    agregarCandidato: function (params) {
      Validator.requireFields(params, ["procesoId", "nombre"]);
      var now_ = new Date().toISOString();
      var id = IdGen.uuid();
      AppLogger.info("ContratacionController.agregarCandidato", { procesoId: params.procesoId, nombre: params.nombre });
      var data = Object.assign({ createdAt: now_ }, params, { id: id });

      createEntity_("contratCandidatos", {
        id:                        id,
        procesoId:                 params.procesoId || "",
        nombre:                    params.nombre    || "",
        apellido:                  params.apellido  || "",
        email:                     params.email     || "",
        cumplePerfilCV:            params.cumplePerfilCV !== undefined ? String(params.cumplePerfilCV) : "",
        enTerna:                   params.enTerna   ? "true" : "false",
        seleccionado:              params.seleccionado ? "true" : "false",
        notaEntrevistaPreliminAr: params.notaEntrevistaPreliminAr || "",
        notaPruebaTecnica:         params.notaPruebaTecnica          || "",
        notaPruebaConductual:      params.notaPruebaConductual       || "",
        notaEntrevistaRRHH:        params.notaEntrevistaRRHH         || "",
        notaEntrevistaFinal:       params.notaEntrevistaFinal        || "",
        promedioGeneral:           params.promedioGeneral            || "",
        dataJson:                  JSON.stringify(data),
        createdAt:                 now_,
      });

      return data;
    },

    evaluarCandidato: function (params) {
      Validator.requireFields(params, ["id"]);
      AppLogger.info("ContratacionController.evaluarCandidato", { id: params.id });

      var row = getEntity_("contratCandidatos", params.id);
      if (!row) throw new Error("Candidato " + params.id + " no encontrado");

      var existing = {};
      try { existing = JSON.parse(row.dataJson || "{}"); } catch (e) {}
      var merged = Object.assign({}, existing, params);

      var notas = [
        merged.notaEntrevistaPreliminAr,
        merged.notaPruebaTecnica,
        merged.notaPruebaConductual,
        merged.notaEntrevistaRRHH,
        merged.notaEntrevistaFinal,
      ].filter(function (n) { return typeof n === "number"; });

      if (notas.length > 0) {
        merged.promedioGeneral = Math.round(
          notas.reduce(function (a, b) { return a + b; }, 0) / notas.length * 10
        ) / 10;
      }

      updateEntity_("contratCandidatos", params.id, {
        cumplePerfilCV:            merged.cumplePerfilCV !== undefined ? String(merged.cumplePerfilCV) : "",
        enTerna:                   merged.enTerna   ? "true" : "false",
        seleccionado:              merged.seleccionado ? "true" : "false",
        notaEntrevistaPreliminAr: merged.notaEntrevistaPreliminAr || "",
        notaPruebaTecnica:         merged.notaPruebaTecnica          || "",
        notaPruebaConductual:      merged.notaPruebaConductual       || "",
        notaEntrevistaRRHH:        merged.notaEntrevistaRRHH         || "",
        notaEntrevistaFinal:       merged.notaEntrevistaFinal        || "",
        promedioGeneral:           merged.promedioGeneral            || "",
        dataJson:                  JSON.stringify(merged),
      });

      return merged;
    },
  };

})();

/**
 * Route contratacion.* actions.
 */
function routeContratacionAction_(verb, params, context) {
  params = params || {};
  var userEmail = context && context.userEmail || "";
  var wsId      = params.wsId || "";

  // Enforce manage permission for mutating verbs when authenticated
  if (wsId && userEmail) {
    var _mutatVerbs = { crearProceso: true, avanzarEtapa: true, guardarDocumento: true,
                        agregarCandidato: true, evaluarCandidato: true };
    if (_mutatVerbs[verb]) {
      WorkspacePermissions.requirePermission(wsId, userEmail, "ws.processes.manage");
    }
  }

  switch (verb) {
    case "listProcesos":     return ContratacionController.listProcesos(params);
    case "getProceso":       return ContratacionController.getProceso(params);
    case "crearProceso":     return ContratacionController.crearProceso(params);
    case "avanzarEtapa":     return ContratacionController.avanzarEtapa(params);
    case "guardarDocumento":  return ContratacionController.guardarDocumento(params);
    case "getDocumento":     return ContratacionController.getDocumento(params);
    case "agregarCandidato": return ContratacionController.agregarCandidato(params);
    case "evaluarCandidato": return ContratacionController.evaluarCandidato(params);
    default:
      throw new Error("Unknown contratacion verb: " + verb);
  }
}
