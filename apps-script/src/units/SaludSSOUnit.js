/**
 * Salud SSO Organizational Unit Definition — Occupational Health & Safety.
 *
 * Incident management, health surveillance, safety inspections, risk
 * assessments, training compliance, and regulatory reporting.
 */

var SALUD_SSO_UNIT_DEF = {

  key:         "salud",
  label:       "Salud y Seguridad Ocupacional",
  description: "Gestión de incidentes laborales, vigilancia de la salud, " +
               "inspecciones de seguridad, evaluación de riesgos y cumplimiento " +
               "regulatorio SSO.",
  version:     "1.0.0",
  enabled:     true,
  icon:        "HeartPulse",
  color:       "#0891B2",
  owner: {
    rol:   "HEAD",
    label: "Responsable de SSO",
  },

  navigation: [
    {
      key: "dashboard", label: "Dashboard SSO", icon: "LayoutDashboard",
      path: "/salud", requiredRoles: [],
    },
    {
      key: "incidentes", label: "Incidentes y Accidentes", icon: "AlertTriangle",
      path: "/salud/incidentes", requiredRoles: [],
      children: [
        { key: "reportar",   label: "Reportar Incidente",  icon: "FilePlus",     path: "/salud/incidentes/reportar" },
        { key: "activos",    label: "Incidentes Activos",  icon: "AlertCircle",  path: "/salud/incidentes/activos" },
        { key: "historial",  label: "Historial",           icon: "History",      path: "/salud/incidentes/historial" },
        { key: "analisis",   label: "Análisis Causal",     icon: "Search",       path: "/salud/incidentes/analisis" },
      ],
    },
    {
      key: "inspecciones", label: "Inspecciones de Seguridad", icon: "ClipboardCheck",
      path: "/salud/inspecciones", requiredRoles: [],
      children: [
        { key: "nueva",       label: "Nueva Inspección",       icon: "Plus",         path: "/salud/inspecciones/nueva" },
        { key: "programadas", label: "Inspecciones Programadas", icon: "CalendarCheck", path: "/salud/inspecciones/programadas" },
        { key: "hallazgos",   label: "Hallazgos",              icon: "AlertCircle",  path: "/salud/inspecciones/hallazgos" },
      ],
    },
    {
      key: "riesgos", label: "Matriz de Riesgos", icon: "Activity",
      path: "/salud/riesgos", requiredRoles: [],
      children: [
        { key: "identificacion", label: "Identificación",       icon: "Search",      path: "/salud/riesgos/identificacion" },
        { key: "evaluacion",     label: "Evaluación",           icon: "BarChart",    path: "/salud/riesgos/evaluacion" },
        { key: "controles",      label: "Controles",            icon: "Shield",      path: "/salud/riesgos/controles" },
      ],
    },
    {
      key: "salud-empleados", label: "Salud de Empleados", icon: "Stethoscope",
      path: "/salud/empleados", requiredRoles: [],
      children: [
        { key: "examenes",   label: "Exámenes Médicos",   icon: "FileHeart",   path: "/salud/empleados/examenes" },
        { key: "seguimiento", label: "Seguimiento Médico", icon: "HeartPulse",  path: "/salud/empleados/seguimiento" },
      ],
    },
    {
      key: "capacitacion", label: "Capacitación SSO", icon: "GraduationCap",
      path: "/salud/capacitacion", requiredRoles: [],
      children: [
        { key: "plan",      label: "Plan de Capacitación", icon: "CalendarDays", path: "/salud/capacitacion/plan" },
        { key: "registros", label: "Registros de Asistencia", icon: "List",     path: "/salud/capacitacion/registros" },
      ],
    },
    {
      key: "regulatorio", label: "Cumplimiento Regulatorio", icon: "Scale",
      path: "/salud/regulatorio", requiredRoles: ["HEAD", "ADMIN", "AUDIT"],
    },
    {
      key: "reportes", label: "Reportes SSO", icon: "BarChart2",
      path: "/salud/reportes", requiredRoles: [],
    },
    {
      key: "configuracion", label: "Configuración", icon: "Settings",
      path: "/salud/config", requiredRoles: ["ADMIN", "HEAD"],
    },
  ],

  modules: [
    "incidentes", "accidentes", "analisis_causal", "inspecciones",
    "hallazgos", "matriz_riesgos", "controles_riesgo", "examenes_medicos",
    "seguimiento_salud", "capacitacion_sso", "registros_asistencia",
    "cumplimiento_regulatorio", "reportes", "auditoria", "notificaciones",
    "documentos", "epp_control", "estadisticas", "configuracion", "dashboard",
  ],

  workflows: [
    {
      key:          "reporte_incidente_flow",
      label:        "Proceso de Reporte e Investigación de Incidente",
      entity:       "incidentes",
      initialEtapa: "reporte",
      steps: [
        { etapa: "reporte",          paso: 1, label: "Reporte del Incidente",     nextEtapa: "notificacion",    requiredDocs: ["formulario_incidente"] },
        { etapa: "notificacion",     paso: 2, label: "Notificación a Autoridades", nextEtapa: "investigacion",  requiredDocs: [] },
        { etapa: "investigacion",    paso: 3, label: "Investigación",             nextEtapa: "analisis_causal", requiredDocs: [] },
        { etapa: "analisis_causal",  paso: 4, label: "Análisis Causal",          nextEtapa: "plan_accion",     requiredDocs: ["diagrama_ishikawa"] },
        { etapa: "plan_accion",      paso: 5, label: "Plan de Acción Correctiva", nextEtapa: "seguimiento",    requiredDocs: ["plan_accion"] },
        { etapa: "seguimiento",      paso: 6, label: "Seguimiento de Acciones",  nextEtapa: "cierre",          requiredDocs: [] },
        { etapa: "cierre",           paso: 7, label: "Cierre del Incidente",     nextEtapa: "completado",      requiredDocs: ["informe_final"] },
        { etapa: "completado",       paso: 8, label: "Completado",               nextEtapa: null,               requiredDocs: [] },
      ],
    },
  ],

  automations: [
    {
      key:     "alerta_incidente_grave",
      label:   "Alerta inmediata por incidente grave",
      trigger: "incidente.severidad_alta",
      action:  "notificacion.enviar",
      active:  true,
      config:  { canal: "both", roles: ["HEAD", "ADMIN"] },
    },
    {
      key:     "recordatorio_examen_medico",
      label:   "Recordatorio examen médico anual",
      trigger: "empleado.examen_proximo_vencer",
      action:  "notificacion.enviar",
      active:  true,
      config:  { canal: "email", roles: ["HEAD"] },
    },
  ],

  reports: [
    { key: "indice_siniestralidad",   label: "Índice de Siniestralidad",  entity: "incidentes",    requiredRoles: [], format: "chart" },
    { key: "cumplimiento_inspeccion", label: "Cumplimiento de Inspecciones", entity: "inspecciones", requiredRoles: [], format: "chart" },
    { key: "reporte_regulatorio",     label: "Reporte Regulatorio MTPS",  entity: "incidentes",    requiredRoles: ["HEAD", "ADMIN", "AUDIT"], format: "table" },
  ],

  catalogs: [
    { key: "tipo_incidente",  label: "Tipo de Incidente",  values: ["accidente_trabajo", "enfermedad_profesional", "casi_accidente", "emergencia"] },
    { key: "severidad",       label: "Severidad",          values: ["leve", "moderado", "grave", "fatal"] },
    { key: "area_trabajo",    label: "Área de Trabajo",    values: ["administrativo", "academico", "laboratorio", "campo", "deportivo", "transporte"] },
    { key: "tipo_riesgo",     label: "Tipo de Riesgo",     values: ["fisico", "quimico", "biologico", "ergonomico", "psicosocial", "mecanico"] },
  ],

  permissions: {
    ADMIN:   ["*"],
    HEAD:    ["read", "write", "approve", "report"],
    ANALYST: ["read", "write"],
    OPS:     ["read", "write_reporte"],
    AUDIT:   ["read", "report"],
  },

  roles: [
    { key: "HEAD",    label: "Responsable de SSO" },
    { key: "ANALYST", label: "Técnico SSO" },
    { key: "OPS",     label: "Reportador de Incidente" },
    { key: "AUDIT",   label: "Auditor SSO" },
  ],

  entities: [
    "ssoIncidentes", "ssoAccidentes", "ssoInspecciones", "ssoPeligros", "ssoRiesgos",
    "ssoAcciones", "ssoEPP", "ssoCapacitaciones", "ssoComite", "ssoAuditorias", "ssoCumplimiento",
  ],

  settings: {
    horasNotifIncidenteGrave:  0,
    diasInvestigacion:         5,
    diasSeguimientoAccion:     30,
    examenMedicoPeriodicidad:  "anual",
    notifEnabled:              true,
    reporteAutoEnabled:        true,
    periodoArchivado:          3650,
  },

  handlers: {
    // Incidentes
    listIncidentes:       function(p, c) { return routeSSOAction_("listIncidentes",       p, c); },
    getIncidente:         function(p, c) { return routeSSOAction_("getIncidente",         p, c); },
    createIncidente:      function(p, c) { return routeSSOAction_("createIncidente",      p, c); },
    updateIncidente:      function(p, c) { return routeSSOAction_("updateIncidente",      p, c); },
    clasificarIncidente:  function(p, c) { return routeSSOAction_("clasificarIncidente",  p, c); },
    cerrarIncidente:      function(p, c) { return routeSSOAction_("cerrarIncidente",      p, c); },
    // Accidentes
    listAccidentes:       function(p, c) { return routeSSOAction_("listAccidentes",       p, c); },
    getAccidente:         function(p, c) { return routeSSOAction_("getAccidente",         p, c); },
    createAccidente:      function(p, c) { return routeSSOAction_("createAccidente",      p, c); },
    updateAccidente:      function(p, c) { return routeSSOAction_("updateAccidente",      p, c); },
    cerrarAccidente:      function(p, c) { return routeSSOAction_("cerrarAccidente",      p, c); },
    // Inspecciones
    listInspeccionesSso:  function(p, c) { return routeSSOAction_("listInspeccionesSso",  p, c); },
    getInspeccionSso:     function(p, c) { return routeSSOAction_("getInspeccionSso",     p, c); },
    createInspeccionSso:  function(p, c) { return routeSSOAction_("createInspeccionSso",  p, c); },
    updateInspeccionSso:  function(p, c) { return routeSSOAction_("updateInspeccionSso",  p, c); },
    cerrarInspeccionSso:  function(p, c) { return routeSSOAction_("cerrarInspeccionSso",  p, c); },
    // Peligros
    listPeligros:         function(p, c) { return routeSSOAction_("listPeligros",         p, c); },
    getPeligro:           function(p, c) { return routeSSOAction_("getPeligro",           p, c); },
    createPeligro:        function(p, c) { return routeSSOAction_("createPeligro",        p, c); },
    updatePeligro:        function(p, c) { return routeSSOAction_("updatePeligro",        p, c); },
    // Riesgos
    listRiesgos:          function(p, c) { return routeSSOAction_("listRiesgos",          p, c); },
    getRiesgo:            function(p, c) { return routeSSOAction_("getRiesgo",            p, c); },
    createRiesgo:         function(p, c) { return routeSSOAction_("createRiesgo",         p, c); },
    updateRiesgo:         function(p, c) { return routeSSOAction_("updateRiesgo",         p, c); },
    // Acciones CAPA
    listAccionesSso:      function(p, c) { return routeSSOAction_("listAccionesSso",      p, c); },
    getAccionSso:         function(p, c) { return routeSSOAction_("getAccionSso",         p, c); },
    createAccionSso:      function(p, c) { return routeSSOAction_("createAccionSso",      p, c); },
    updateAccionSso:      function(p, c) { return routeSSOAction_("updateAccionSso",      p, c); },
    verificarAccion:      function(p, c) { return routeSSOAction_("verificarAccion",      p, c); },
    cerrarAccionSso:      function(p, c) { return routeSSOAction_("cerrarAccionSso",      p, c); },
    // EPP
    listEPP:              function(p, c) { return routeSSOAction_("listEPP",              p, c); },
    getEPPItem:           function(p, c) { return routeSSOAction_("getEPPItem",           p, c); },
    createEPPItem:        function(p, c) { return routeSSOAction_("createEPPItem",        p, c); },
    updateEPPItem:        function(p, c) { return routeSSOAction_("updateEPPItem",        p, c); },
    // Capacitaciones
    listCapacitacionesSso:    function(p, c) { return routeSSOAction_("listCapacitacionesSso",    p, c); },
    getCapacitacionSso:       function(p, c) { return routeSSOAction_("getCapacitacionSso",       p, c); },
    createCapacitacionSso:    function(p, c) { return routeSSOAction_("createCapacitacionSso",    p, c); },
    updateCapacitacionSso:    function(p, c) { return routeSSOAction_("updateCapacitacionSso",    p, c); },
    finalizarCapacitacionSso: function(p, c) { return routeSSOAction_("finalizarCapacitacionSso", p, c); },
    // Comité
    listActasComite:      function(p, c) { return routeSSOAction_("listActasComite",      p, c); },
    getActaComite:        function(p, c) { return routeSSOAction_("getActaComite",        p, c); },
    createActaComite:     function(p, c) { return routeSSOAction_("createActaComite",     p, c); },
    updateActaComite:     function(p, c) { return routeSSOAction_("updateActaComite",     p, c); },
    // Auditorías
    listAuditoriasSSO:    function(p, c) { return routeSSOAction_("listAuditoriasSSO",    p, c); },
    getAuditoriaSSO:      function(p, c) { return routeSSOAction_("getAuditoriaSSO",      p, c); },
    createAuditoriaSSO:   function(p, c) { return routeSSOAction_("createAuditoriaSSO",   p, c); },
    updateAuditoriaSSO:   function(p, c) { return routeSSOAction_("updateAuditoriaSSO",   p, c); },
    cerrarAuditoriaSSO:   function(p, c) { return routeSSOAction_("cerrarAuditoriaSSO",   p, c); },
    // Cumplimiento Legal
    listCumplimiento:     function(p, c) { return routeSSOAction_("listCumplimiento",     p, c); },
    getCumplimiento:      function(p, c) { return routeSSOAction_("getCumplimiento",      p, c); },
    createCumplimiento:   function(p, c) { return routeSSOAction_("createCumplimiento",   p, c); },
    updateCumplimiento:   function(p, c) { return routeSSOAction_("updateCumplimiento",   p, c); },
    // Dashboard + Reportes
    getDashboardResumen:              function(p, c) { return routeSSOAction_("getDashboardResumen",              p, c); },
    reporteIncidentesPeriodo:         function(p, c) { return routeSSOAction_("reporteIncidentesPeriodo",         p, c); },
    reporteAccidentesArea:            function(p, c) { return routeSSOAction_("reporteAccidentesArea",            p, c); },
    reporteAccionesPendientes:        function(p, c) { return routeSSOAction_("reporteAccionesPendientes",        p, c); },
    reporteIndicadoresAccidentalidad: function(p, c) { return routeSSOAction_("reporteIndicadoresAccidentalidad", p, c); },
    reporteCumplimientoLegal:         function(p, c) { return routeSSOAction_("reporteCumplimientoLegal",         p, c); },
  },
};
