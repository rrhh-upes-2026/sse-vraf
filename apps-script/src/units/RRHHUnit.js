/**
 * RRHH Organizational Unit Definition — Human Resources.
 *
 * This file is the single source of truth for the RRHH unit's navigation
 * tree, workflow steps, automations, reports, domain handlers, catalogs,
 * and settings. No RRHH-specific logic lives inside the WorkflowEngine or
 * the router; both delegate to these handlers via OrgUnitRegistry.
 *
 * Handlers that require persistence delegate to ContratacionController, which
 * continues to own the Sheet-layer logic during the migration period.
 */

var RRHH_UNIT_DEF = {

  // ── Identity ────────────────────────────────────────────────────────────────
  key:         "rrhh",
  label:       "Recursos Humanos",
  description: "Gestión integral del ciclo de vida del empleado: reclutamiento, " +
               "selección, contratación, capacitación y evaluación de desempeño.",
  version:     "1.0.0",
  enabled:     true,
  icon:        "Users",
  color:       "#2E6BE6",
  owner: {
    rol:    "HEAD",
    label:  "Jefe de Recursos Humanos",
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  navigation: [
    {
      key: "dashboard", label: "Dashboard RRHH", icon: "LayoutDashboard",
      path: "/rrhh", requiredRoles: [],
    },
    {
      key: "contratacion", label: "Contratación", icon: "Briefcase",
      path: "/rrhh/contratacion", requiredRoles: [],
      children: [
        { key: "procesos",       label: "Procesos Activos",  icon: "List",      path: "/rrhh/contratacion/procesos" },
        { key: "nuevo",          label: "Nuevo Proceso",     icon: "Plus",      path: "/rrhh/contratacion/nuevo" },
        { key: "candidatos",     label: "Candidatos",        icon: "UserCheck", path: "/rrhh/contratacion/candidatos" },
        { key: "requisiciones",  label: "Requisiciones",     icon: "FileText",  path: "/rrhh/contratacion/requisiciones" },
      ],
    },
    {
      key: "seleccion", label: "Selección", icon: "Filter",
      path: "/rrhh/seleccion", requiredRoles: [],
      children: [
        { key: "entrevistas",  label: "Entrevistas",         icon: "MessageSquare", path: "/rrhh/seleccion/entrevistas" },
        { key: "evaluaciones", label: "Evaluaciones",        icon: "ClipboardList", path: "/rrhh/seleccion/evaluaciones" },
        { key: "terna",        label: "Conformación de Terna", icon: "Users",       path: "/rrhh/seleccion/terna" },
      ],
    },
    {
      key: "documentacion", label: "Documentación", icon: "FolderOpen",
      path: "/rrhh/documentacion", requiredRoles: [],
      children: [
        { key: "informes-tec",     label: "Informes Técnicos",  icon: "FileSearch", path: "/rrhh/documentacion/informes-tec" },
        { key: "informes-finales", label: "Informes Finales",   icon: "FileCheck",  path: "/rrhh/documentacion/informes-finales" },
        { key: "cartas-oferta",    label: "Cartas de Oferta",   icon: "Mail",       path: "/rrhh/documentacion/cartas-oferta" },
      ],
    },
    {
      key: "expedientes", label: "Expedientes", icon: "Archive",
      path: "/rrhh/expedientes", requiredRoles: [],
    },
    {
      key: "contratos", label: "Contratos", icon: "FileSignature",
      path: "/rrhh/contratos", requiredRoles: [],
    },
    {
      key: "fichas", label: "Fichas de Personal", icon: "IdCard",
      path: "/rrhh/fichas", requiredRoles: [],
      children: [
        { key: "empleados", label: "Fichas Empleados", icon: "UserCircle", path: "/rrhh/fichas/empleados" },
        { key: "docentes",  label: "Fichas Docentes",  icon: "GraduationCap", path: "/rrhh/fichas/docentes" },
      ],
    },
    {
      key: "capacitacion", label: "Capacitación", icon: "BookOpen",
      path: "/rrhh/capacitacion", requiredRoles: [], comingSoon: true,
    },
    {
      key: "desempeno", label: "Evaluación de Desempeño", icon: "TrendingUp",
      path: "/rrhh/desempeno", requiredRoles: [], comingSoon: true,
    },
    {
      key: "kpis", label: "KPIs RRHH", icon: "BarChart2",
      path: "/rrhh/kpis", requiredRoles: [],
    },
    {
      key: "reportes", label: "Reportes", icon: "PieChart",
      path: "/rrhh/reportes", requiredRoles: [],
    },
    {
      key: "configuracion", label: "Configuración", icon: "Settings",
      path: "/rrhh/config", requiredRoles: ["ADMIN", "HEAD"],
    },
  ],

  // ── Modules ─────────────────────────────────────────────────────────────────
  modules: [
    "reclutamiento", "seleccion", "contratacion", "expedientes", "contratos",
    "fichas_empleado", "fichas_docente", "informes_tecnicos", "informes_finales",
    "cartas_oferta", "terna", "candidatos", "evaluaciones", "capacitacion",
    "desempeno", "kpis", "reportes", "auditoria", "notificaciones", "configuracion",
  ],

  // ── Workflows ────────────────────────────────────────────────────────────────
  workflows: [
    {
      key:          "contratacion_flow",
      label:        "Proceso de Contratación PRO-TH-001",
      entity:       "contratProcesos",
      initialEtapa: "identificacion_necesidad",
      steps: [
        { etapa: "identificacion_necesidad", paso: 1,  label: "Identificación de Necesidad",   nextEtapa: "requisicion",               requiredDocs: [] },
        { etapa: "requisicion",              paso: 8,  label: "Requisición de Personal",        nextEtapa: "estrategia_reclutamiento",  requiredDocs: ["requisicion"],  handler: "validarRequisicion" },
        { etapa: "estrategia_reclutamiento", paso: 9,  label: "Estrategia de Reclutamiento",   nextEtapa: "publicacion_vacante",       requiredDocs: [] },
        { etapa: "publicacion_vacante",      paso: 10, label: "Publicación de Vacante",         nextEtapa: "recepcion_cv",              requiredDocs: [] },
        { etapa: "recepcion_cv",             paso: 12, label: "Recepción de CVs",               nextEtapa: "entrevista_preliminar",     requiredDocs: [] },
        { etapa: "entrevista_preliminar",    paso: 13, label: "Entrevista Preliminar",           nextEtapa: "pruebas",                   requiredDocs: [] },
        { etapa: "pruebas",                  paso: 14, label: "Pruebas Técnicas y Conductuales", nextEtapa: "entrevista_rrhh",          requiredDocs: [], handler: "calcularPromediosCandidato" },
        { etapa: "entrevista_rrhh",          paso: 15, label: "Entrevista RRHH",                nextEtapa: "conformacion_terna",        requiredDocs: [] },
        { etapa: "conformacion_terna",       paso: 16, label: "Conformación de Terna",          nextEtapa: "entrevista_final",          requiredDocs: [], handler: "conformarTerna" },
        { etapa: "entrevista_final",         paso: 17, label: "Entrevista Final",               nextEtapa: "informe_seleccion",         requiredDocs: [] },
        { etapa: "informe_seleccion",        paso: 18, label: "Informe de Selección",           nextEtapa: "validacion_rector",        requiredDocs: ["informeTecnico", "informeFinal"] },
        { etapa: "validacion_rector",        paso: 19, label: "Validación Rector",              nextEtapa: "carta_oferta",              requiredDocs: [] },
        { etapa: "carta_oferta",             paso: 21, label: "Carta de Oferta",                nextEtapa: "creacion_expediente",       requiredDocs: ["cartaOferta"] },
        { etapa: "creacion_expediente",      paso: 23, label: "Creación de Expediente",         nextEtapa: "elaboracion_contrato",      requiredDocs: [], handler: "crearExpediente" },
        { etapa: "elaboracion_contrato",     paso: 24, label: "Elaboración de Contrato",        nextEtapa: "firma_contrato",            requiredDocs: ["contrato"] },
        { etapa: "firma_contrato",           paso: 25, label: "Firma de Contrato",              nextEtapa: "comunicacion",              requiredDocs: [] },
        { etapa: "comunicacion",             paso: 26, label: "Comunicación Interna",           nextEtapa: "vinculacion_induccion",     requiredDocs: [], handler: "crearFichaEmpleado" },
        { etapa: "vinculacion_induccion",    paso: 27, label: "Vinculación e Inducción",        nextEtapa: "completado",                requiredDocs: [] },
        { etapa: "completado",               paso: 27, label: "Proceso Completado",             nextEtapa: null,                        requiredDocs: [] },
      ],
    },
    {
      key:          "capacitacion_flow",
      label:        "Proceso de Capacitación",
      entity:       "contratProcesos",
      initialEtapa: "identificacion_necesidad",
      steps: [
        { etapa: "identificacion_necesidad", paso: 1, label: "Identificación de Necesidad", nextEtapa: "planificacion", requiredDocs: [] },
        { etapa: "planificacion",             paso: 2, label: "Planificación",               nextEtapa: "ejecucion",     requiredDocs: [] },
        { etapa: "ejecucion",                 paso: 3, label: "Ejecución",                   nextEtapa: "evaluacion",    requiredDocs: [] },
        { etapa: "evaluacion",                paso: 4, label: "Evaluación",                  nextEtapa: "completado",    requiredDocs: [] },
        { etapa: "completado",                paso: 5, label: "Completado",                  nextEtapa: null,            requiredDocs: [] },
      ],
    },
  ],

  // ── Automations ──────────────────────────────────────────────────────────────
  automations: [
    {
      key:     "notif_nueva_etapa",
      label:   "Notificar avance de etapa",
      trigger: "proceso.etapa_avanzada",
      action:  "notificacion.enviar",
      active:  true,
      config:  { canal: "both", roles: ["HEAD", "ANALYST"] },
    },
    {
      key:     "notif_proceso_completado",
      label:   "Notificar proceso completado",
      trigger: "proceso.completado",
      action:  "notificacion.enviar",
      active:  true,
      config:  { canal: "email", roles: ["HEAD", "ADMIN"] },
    },
  ],

  // ── Reports ──────────────────────────────────────────────────────────────────
  reports: [
    {
      key:          "reporte_procesos_activos",
      label:        "Procesos Activos por Etapa",
      description:  "Distribución de todos los procesos de contratación por etapa actual.",
      entity:       "contratProcesos",
      requiredRoles: [],
      format:       "table_chart",
    },
    {
      key:          "reporte_candidatos",
      label:        "Resumen de Candidatos",
      description:  "Consolidado de candidatos con promedios de evaluación.",
      entity:       "contratCandidatos",
      requiredRoles: [],
      format:       "table",
    },
    {
      key:          "reporte_tiempos",
      label:        "Tiempos de Contratación",
      description:  "Tiempo promedio por etapa del proceso PRO-TH-001.",
      entity:       "contratProcesos",
      requiredRoles: ["HEAD", "ADMIN", "AUDIT"],
      format:       "chart",
    },
  ],

  // ── Catalogs ─────────────────────────────────────────────────────────────────
  catalogs: [
    {
      key:    "tipo_requisicion",
      label:  "Tipo de Requisición",
      values: ["nueva_plaza", "plaza_existente", "plaza_temporal", "plaza_docente"],
    },
    {
      key:    "tipo_contratacion",
      label:  "Tipo de Contratación",
      values: ["permanente", "temporal", "contrato", "hora_clase"],
    },
    {
      key:    "prioridad_proceso",
      label:  "Prioridad",
      values: ["alta", "normal", "baja"],
    },
    {
      key:    "estado_expediente",
      label:  "Estado de Expediente",
      values: ["incompleto", "en_revision", "completo", "archivado"],
    },
  ],

  // ── Role permissions for this unit ───────────────────────────────────────────
  permissions: {
    ADMIN:   ["*"],
    HEAD:    ["read", "write", "approve", "report"],
    ANALYST: ["read", "write"],
    OPS:     ["read"],
    AUDIT:   ["read", "report"],
  },

  // ── Unit roles ───────────────────────────────────────────────────────────────
  roles: [
    { key: "HEAD",    label: "Jefe de RRHH" },
    { key: "ANALYST", label: "Analista de RRHH" },
    { key: "OPS",     label: "Operativo de Reclutamiento" },
    { key: "AUDIT",   label: "Auditor" },
  ],

  // ── Data entities owned by this unit ─────────────────────────────────────────
  entities: [
    "contratProcesos", "contratRequisiciones", "contratInformesTec",
    "contratInformesFinales", "contratCartasOferta", "contratExpedientes",
    "contratFichasEmp", "contratFichasDoc", "contratContratos", "contratCandidatos",
  ],

  // ── Settings ──────────────────────────────────────────────────────────────────
  settings: {
    maxCandidatosPorProceso: 20,
    minCandidatosTerna:      2,
    maxCandidatosTerna:      3,
    otpEnabled:              true,
    notifEnabled:            true,
    reporteAutoEnabled:      false,
    periodoArchivado:        365,
  },

  // ── Domain Handlers ──────────────────────────────────────────────────────────
  // These are the ONLY place where RRHH business logic lives.
  // WorkflowEngine calls these via OrgUnitRegistry.invokeHandler().
  handlers: {

    // ── ContratacionController pass-through wrappers ──────────────────────────
    listProcesos: function (p) {
      return ContratacionController.listProcesos(p);
    },
    getProceso: function (p) {
      return ContratacionController.getProceso(p);
    },
    crearProceso: function (p) {
      return ContratacionController.crearProceso(p);
    },
    avanzarEtapa: function (p) {
      return ContratacionController.avanzarEtapa(p);
    },
    guardarDocumento: function (p) {
      return ContratacionController.guardarDocumento(p);
    },
    getDocumento: function (p) {
      return ContratacionController.getDocumento(p);
    },
    agregarCandidato: function (p) {
      return ContratacionController.agregarCandidato(p);
    },
    evaluarCandidato: function (p) {
      return ContratacionController.evaluarCandidato(p);
    },

    // ── Domain-specific handlers ─────────────────────────────────────────────

    // Called by WorkflowEngine at the "requisicion" step.
    // Verifies that the required requisition doc exists and is complete.
    validarRequisicion: function (p) {
      Validator.requireFields(p, ["procesoId"]);
      var doc = ContratacionController.getDocumento({ tipo: "requisicion", procesoId: p.procesoId });
      if (!doc || !doc.nombrePuesto) {
        throw new Error("Requisición incompleta: nombrePuesto es requerido antes de avanzar.");
      }
      return { valid: true, requisicionId: doc.id };
    },

    // Called by WorkflowEngine at the "pruebas" step.
    // Re-computes promedioGeneral for a candidate after scores are entered.
    calcularPromediosCandidato: function (p) {
      Validator.requireFields(p, ["id"]);
      return ContratacionController.evaluarCandidato(p);
    },

    // Called by WorkflowEngine at the "conformacion_terna" step.
    // Marks 2–3 candidates as enTerna = true.
    conformarTerna: function (p) {
      Validator.requireFields(p, ["procesoId", "candidatoIds"]);
      var ids = p.candidatoIds;
      if (!Array.isArray(ids) || ids.length < 2 || ids.length > 3) {
        throw new Error("La terna debe contener entre 2 y 3 candidatos.");
      }
      var updated = [];
      for (var i = 0; i < ids.length; i++) {
        updated.push(ContratacionController.evaluarCandidato({ id: ids[i], enTerna: true }));
      }
      return { terna: updated, count: updated.length };
    },

    // Called by WorkflowEngine at the "creacion_expediente" step.
    crearExpediente: function (p) {
      return ContratacionController.guardarDocumento(Object.assign({ tipo: "expediente" }, p));
    },

    // Called by WorkflowEngine at the "comunicacion" step.
    // Determines ficha type from tipoContratacion.
    crearFichaEmpleado: function (p) {
      var tipo = (p.tipoContratacion === "hora_clase") ? "fichaDocente" : "fichaEmpleado";
      return ContratacionController.guardarDocumento(Object.assign({ tipo: tipo }, p));
    },
  },
};
