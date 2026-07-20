/**
 * VRAF Organizational Unit Definition — Vicerrectoría Académica y de Formación.
 *
 * Strategic planning, academic process management, KPI tracking, and
 * institutional evaluation for the UPES Academic Vice-Rectorate.
 */

var VRAF_UNIT_DEF = {

  key:         "vraf",
  label:       "VRAF — Vicerrectoría Académica",
  description: "Planificación estratégica institucional, gestión de procesos académicos, " +
               "seguimiento de KPIs y evaluación del Plan de Desarrollo Institucional.",
  version:     "1.0.0",
  enabled:     true,
  icon:        "BookOpen",
  color:       "#7C3AED",
  owner: {
    rol:   "HEAD",
    label: "Vicerrector Académico",
  },

  navigation: [
    {
      key: "dashboard", label: "Dashboard VRAF", icon: "LayoutDashboard",
      path: "/vraf", requiredRoles: [],
    },
    {
      key: "planificacion", label: "Planificación Estratégica", icon: "Target",
      path: "/vraf/planificacion", requiredRoles: [],
      children: [
        { key: "planes",       label: "Planes Institucionales", icon: "FileText",    path: "/vraf/planificacion/planes" },
        { key: "objetivos",    label: "Objetivos Estratégicos", icon: "Crosshair",   path: "/vraf/planificacion/objetivos" },
        { key: "proyectos",    label: "Proyectos",              icon: "FolderKanban", path: "/vraf/planificacion/proyectos" },
        { key: "actividades",  label: "Actividades",            icon: "CheckSquare",  path: "/vraf/planificacion/actividades" },
      ],
    },
    {
      key: "indicadores", label: "Indicadores / KPIs", icon: "TrendingUp",
      path: "/vraf/indicadores", requiredRoles: [],
      children: [
        { key: "kpis",       label: "KPIs Institucionales", icon: "BarChart3",  path: "/vraf/indicadores/kpis" },
        { key: "semaforo",   label: "Semáforo de Gestión",  icon: "Activity",   path: "/vraf/indicadores/semaforo" },
        { key: "historico",  label: "Histórico de Valores", icon: "LineChart",  path: "/vraf/indicadores/historico" },
      ],
    },
    {
      key: "procesos", label: "Procesos Académicos", icon: "GitBranch",
      path: "/vraf/procesos", requiredRoles: [],
      children: [
        { key: "solicitudes", label: "Solicitudes",   icon: "Inbox",       path: "/vraf/procesos/solicitudes" },
        { key: "flujos",      label: "Flujos BPMN",   icon: "Network",     path: "/vraf/procesos/flujos" },
        { key: "evidencias",  label: "Evidencias",    icon: "Paperclip",   path: "/vraf/procesos/evidencias" },
      ],
    },
    {
      key: "evaluacion", label: "Evaluación Institucional", icon: "ClipboardCheck",
      path: "/vraf/evaluacion", requiredRoles: [],
      children: [
        { key: "autoevaluacion", label: "Autoevaluación",  icon: "SelfAssessment", path: "/vraf/evaluacion/autoevaluacion" },
        { key: "acreditacion",  label: "Acreditación",     icon: "Award",           path: "/vraf/evaluacion/acreditacion" },
      ],
    },
    {
      key: "documentos", label: "Documentos Estratégicos", icon: "FolderOpen",
      path: "/vraf/documentos", requiredRoles: [],
    },
    {
      key: "reportes", label: "Reportes", icon: "PieChart",
      path: "/vraf/reportes", requiredRoles: [],
    },
    {
      key: "configuracion", label: "Configuración", icon: "Settings",
      path: "/vraf/config", requiredRoles: ["ADMIN", "HEAD"],
    },
  ],

  modules: [
    "planes", "objetivos", "proyectos", "actividades", "indicadores", "kpis",
    "semaforo", "solicitudes", "flujos", "evidencias", "evaluacion",
    "acreditacion", "documentos", "reportes", "auditoria", "notificaciones",
    "recursos", "calendarios", "configuracion", "dashboard",
  ],

  workflows: [
    {
      key:          "plan_estrategico_flow",
      label:        "Elaboración de Plan Estratégico",
      entity:       "planes",
      initialEtapa: "formulacion",
      steps: [
        { etapa: "formulacion",   paso: 1, label: "Formulación",      nextEtapa: "revision",     requiredDocs: [] },
        { etapa: "revision",      paso: 2, label: "Revisión Interna", nextEtapa: "aprobacion",   requiredDocs: [] },
        { etapa: "aprobacion",    paso: 3, label: "Aprobación",       nextEtapa: "publicacion",  requiredDocs: [] },
        { etapa: "publicacion",   paso: 4, label: "Publicación",      nextEtapa: "seguimiento",  requiredDocs: [] },
        { etapa: "seguimiento",   paso: 5, label: "Seguimiento",      nextEtapa: "completado",   requiredDocs: [] },
        { etapa: "completado",    paso: 6, label: "Completado",       nextEtapa: null,            requiredDocs: [] },
      ],
    },
  ],

  automations: [
    {
      key:    "alerta_kpi_rojo",
      label:  "Alerta KPI en rojo",
      trigger: "kpi.semaforo_rojo",
      action:  "notificacion.enviar",
      active:  true,
      config:  { canal: "both", roles: ["HEAD", "ADMIN"] },
    },
  ],

  reports: [
    {
      key:   "reporte_kpis",
      label: "Dashboard KPIs Institucionales",
      entity: "wsKPIs", requiredRoles: [],
      format: "chart",
    },
    {
      key:   "reporte_avance_plan",
      label: "Avance Plan Estratégico",
      entity: "planes", requiredRoles: [],
      format: "table_chart",
    },
  ],

  catalogs: [
    { key: "perspectiva", label: "Perspectiva BSC",  values: ["financiera", "clientes", "procesos", "aprendizaje"] },
    { key: "frecuencia",  label: "Frecuencia KPI",   values: ["mensual", "trimestral", "semestral", "anual"] },
    { key: "estado_plan", label: "Estado del Plan",  values: ["borrador", "revision", "aprobado", "vigente", "cerrado"] },
  ],

  permissions: {
    ADMIN:   ["*"],
    HEAD:    ["read", "write", "approve", "report"],
    ANALYST: ["read", "write"],
    OPS:     ["read"],
    AUDIT:   ["read", "report"],
  },

  roles: [
    { key: "HEAD",    label: "Vicerrectora Administrativa Financiera" },
    { key: "ANALYST", label: "Analista de Planificación" },
    { key: "OPS",     label: "Coordinador Administrativo" },
    { key: "AUDIT",   label: "Auditor Institucional" },
  ],

  entities: [
    "planes", "objetivos", "proyectos", "actividades", "evidencias",
    "indicadores", "solicitudes",
  ],

  settings: {
    cicloEvaluacion:     "anual",
    perspectivaBSC:      true,
    acreditacionEnabled: false,
    notifEnabled:        true,
    reporteAutoEnabled:  true,
    periodoArchivado:    730,
  },

  // ── Domain Handlers (delegate to VRAFController) ──────────────────────────
  handlers: {
    getDashboardResumen: function (p) { return VRAFController.getDashboardResumen(p); },
    listPlanes:          function (p) { return VRAFController.listPlanes(p); },
    getPlan:             function (p) { return VRAFController.getPlan(p); },
    createPlan:          function (p) { return VRAFController.createPlan(p); },
    updatePlan:          function (p) { return VRAFController.updatePlan(p); },
    deletePlan:          function (p) { return VRAFController.deletePlan(p); },
    listObjetivos:       function (p) { return VRAFController.listObjetivos(p); },
    getObjetivo:         function (p) { return VRAFController.getObjetivo(p); },
    createObjetivo:      function (p) { return VRAFController.createObjetivo(p); },
    updateObjetivo:      function (p) { return VRAFController.updateObjetivo(p); },
    listProyectos:       function (p) { return VRAFController.listProyectos(p); },
    getProyecto:         function (p) { return VRAFController.getProyecto(p); },
    createProyecto:      function (p) { return VRAFController.createProyecto(p); },
    updateProyecto:      function (p) { return VRAFController.updateProyecto(p); },
    listProcesos:        function (p) { return VRAFController.listProcesos(p); },
    listActividades:     function (p) { return VRAFController.listActividades(p); },
    listIndicadores:     function (p) { return VRAFController.listIndicadores(p); },
    getIndicador:        function (p) { return VRAFController.getIndicador(p); },
    createIndicador:     function (p) { return VRAFController.createIndicador(p); },
    updateIndicador:     function (p) { return VRAFController.updateIndicador(p); },
    listSolicitudes:     function (p) { return VRAFController.listSolicitudes(p); },
    createSolicitud:     function (p) { return VRAFController.createSolicitud(p); },
    updateSolicitud:     function (p) { return VRAFController.updateSolicitud(p); },
  },
};
