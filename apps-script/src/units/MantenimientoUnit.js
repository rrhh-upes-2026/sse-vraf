/**
 * Mantenimiento Organizational Unit Definition — Facilities & Maintenance.
 *
 * Preventive and corrective maintenance management, asset tracking,
 * work orders, spare parts inventory, and infrastructure planning.
 */

var MANTENIMIENTO_UNIT_DEF = {

  key:         "mantenimiento",
  label:       "Mantenimiento e Infraestructura",
  description: "Gestión de mantenimiento preventivo y correctivo, ordenes de trabajo, " +
               "activos institucionales y planificación de infraestructura.",
  version:     "1.0.0",
  enabled:     true,
  icon:        "Wrench",
  color:       "#DC2626",
  owner: {
    rol:   "HEAD",
    label: "Jefe de Mantenimiento",
  },

  navigation: [
    {
      key: "dashboard", label: "Dashboard Mantenimiento", icon: "LayoutDashboard",
      path: "/mantenimiento", requiredRoles: [],
    },
    {
      key: "ordenes", label: "Órdenes de Trabajo", icon: "ClipboardList",
      path: "/mantenimiento/ordenes", requiredRoles: [],
      children: [
        { key: "nueva",       label: "Nueva Orden",        icon: "Plus",         path: "/mantenimiento/ordenes/nueva" },
        { key: "pendientes",  label: "Pendientes",         icon: "Clock",        path: "/mantenimiento/ordenes/pendientes" },
        { key: "en-proceso",  label: "En Proceso",         icon: "Play",         path: "/mantenimiento/ordenes/en-proceso" },
        { key: "completadas", label: "Completadas",        icon: "CheckCircle",  path: "/mantenimiento/ordenes/completadas" },
      ],
    },
    {
      key: "preventivo", label: "Mantenimiento Preventivo", icon: "Calendar",
      path: "/mantenimiento/preventivo", requiredRoles: [],
      children: [
        { key: "plan",       label: "Plan Anual",          icon: "CalendarDays", path: "/mantenimiento/preventivo/plan" },
        { key: "programado", label: "Mantenimientos Programados", icon: "CalendarCheck", path: "/mantenimiento/preventivo/programado" },
      ],
    },
    {
      key: "activos", label: "Activos / Inventario", icon: "Package",
      path: "/mantenimiento/activos", requiredRoles: [],
      children: [
        { key: "equipos",    label: "Equipos e Infraestructura", icon: "Cpu",       path: "/mantenimiento/activos/equipos" },
        { key: "repuestos",  label: "Repuestos y Materiales",    icon: "Layers",    path: "/mantenimiento/activos/repuestos" },
      ],
    },
    {
      key: "solicitudes", label: "Solicitudes de Servicio", icon: "Inbox",
      path: "/mantenimiento/solicitudes", requiredRoles: [],
    },
    {
      key: "proveedores", label: "Proveedores de Servicio", icon: "Building2",
      path: "/mantenimiento/proveedores", requiredRoles: [],
    },
    {
      key: "reportes", label: "Reportes", icon: "BarChart2",
      path: "/mantenimiento/reportes", requiredRoles: [],
    },
    {
      key: "configuracion", label: "Configuración", icon: "Settings",
      path: "/mantenimiento/config", requiredRoles: ["ADMIN", "HEAD"],
    },
  ],

  modules: [
    "ordenes_trabajo", "mantenimiento_preventivo", "mantenimiento_correctivo",
    "activos", "repuestos", "solicitudes_servicio", "proveedores_servicio",
    "plan_anual", "reportes", "auditoria", "notificaciones", "documentos",
    "calendario", "presupuesto_mant", "configuracion", "dashboard",
    "checklist", "historial_activos", "garantias", "alertas",
  ],

  workflows: [
    {
      key:          "orden_trabajo_flow",
      label:        "Proceso de Orden de Trabajo",
      entity:       "ordenesTrabajo",
      initialEtapa: "solicitud",
      steps: [
        { etapa: "solicitud",   paso: 1, label: "Solicitud de Servicio",  nextEtapa: "evaluacion",  requiredDocs: [] },
        { etapa: "evaluacion",  paso: 2, label: "Evaluación Técnica",     nextEtapa: "asignacion",  requiredDocs: [] },
        { etapa: "asignacion",  paso: 3, label: "Asignación de Técnico",  nextEtapa: "ejecucion",   requiredDocs: [] },
        { etapa: "ejecucion",   paso: 4, label: "Ejecución",              nextEtapa: "inspeccion",  requiredDocs: [] },
        { etapa: "inspeccion",  paso: 5, label: "Inspección y Cierre",    nextEtapa: "completado",  requiredDocs: [] },
        { etapa: "completado",  paso: 6, label: "Completado",             nextEtapa: null,           requiredDocs: [] },
      ],
    },
  ],

  automations: [
    {
      key:     "alerta_orden_vencida",
      label:   "Alerta orden de trabajo vencida",
      trigger: "orden.fecha_estimada_vencida",
      action:  "notificacion.enviar",
      active:  true,
      config:  { canal: "both", roles: ["HEAD", "ANALYST"] },
    },
  ],

  reports: [
    { key: "reporte_ordenes",   label: "Órdenes de Trabajo por Estado", entity: "ordenesTrabajo",        requiredRoles: [], format: "chart" },
    { key: "reporte_activos",   label: "Estado de Activos",             entity: "activos",               requiredRoles: [], format: "table" },
    { key: "reporte_preventivo", label: "Cumplimiento Plan Preventivo", entity: "mantenimientoPreventivo", requiredRoles: ["HEAD", "ADMIN"], format: "chart" },
  ],

  catalogs: [
    { key: "tipo_mantenimiento", label: "Tipo de Mantenimiento", values: ["preventivo", "correctivo", "predictivo", "emergencia"] },
    { key: "prioridad_orden",    label: "Prioridad",              values: ["critica", "alta", "normal", "baja"] },
    { key: "area_instalacion",   label: "Área / Instalación",     values: ["edificio_a", "edificio_b", "cancha", "parqueo", "laboratorio", "biblioteca"] },
  ],

  permissions: {
    ADMIN:   ["*"],
    HEAD:    ["read", "write", "approve", "report"],
    ANALYST: ["read", "write"],
    OPS:     ["read", "write_orden"],
    AUDIT:   ["read", "report"],
  },

  roles: [
    { key: "HEAD",    label: "Jefe de Mantenimiento" },
    { key: "ANALYST", label: "Técnico de Mantenimiento" },
    { key: "OPS",     label: "Solicitante de Servicio" },
    { key: "AUDIT",   label: "Auditor" },
  ],

  entities: [
    "mantoActivos", "mantoUbicaciones", "mantoPlanes", "mantoSolicitudes",
    "mantoOrdenesTrabajo", "mantoInspecciones", "mantoHistorial",
    "mantoCostos", "mantoInventarioTecnico",
  ],

  settings: {
    diasRespuestaEstandar:  3,
    diasRespuestaCritica:   1,
    alertaVencimientoHoras: 24,
    notifEnabled:           true,
    reporteAutoEnabled:     false,
    periodoArchivado:       1095,
  },

  handlers: {
    // Activos
    listActivos:          function(p, c) { return routeMantenimientoAction_("listActivos",          p, c); },
    getActivo:            function(p, c) { return routeMantenimientoAction_("getActivo",            p, c); },
    createActivo:         function(p, c) { return routeMantenimientoAction_("createActivo",         p, c); },
    updateActivo:         function(p, c) { return routeMantenimientoAction_("updateActivo",         p, c); },
    cambiarEstadoActivo:  function(p, c) { return routeMantenimientoAction_("cambiarEstadoActivo",  p, c); },
    darBajaActivo:        function(p, c) { return routeMantenimientoAction_("darBajaActivo",        p, c); },
    // Ubicaciones
    listUbicaciones:      function(p, c) { return routeMantenimientoAction_("listUbicaciones",      p, c); },
    getUbicacion:         function(p, c) { return routeMantenimientoAction_("getUbicacion",         p, c); },
    createUbicacion:      function(p, c) { return routeMantenimientoAction_("createUbicacion",      p, c); },
    updateUbicacion:      function(p, c) { return routeMantenimientoAction_("updateUbicacion",      p, c); },
    // Planes
    listPlanes:           function(p, c) { return routeMantenimientoAction_("listPlanes",           p, c); },
    getPlan:              function(p, c) { return routeMantenimientoAction_("getPlan",              p, c); },
    createPlan:           function(p, c) { return routeMantenimientoAction_("createPlan",           p, c); },
    updatePlan:           function(p, c) { return routeMantenimientoAction_("updatePlan",           p, c); },
    activarPlan:          function(p, c) { return routeMantenimientoAction_("activarPlan",          p, c); },
    // Solicitudes
    listSolicitudes:      function(p, c) { return routeMantenimientoAction_("listSolicitudes",      p, c); },
    getSolicitud:         function(p, c) { return routeMantenimientoAction_("getSolicitud",         p, c); },
    createSolicitud:      function(p, c) { return routeMantenimientoAction_("createSolicitud",      p, c); },
    updateSolicitud:      function(p, c) { return routeMantenimientoAction_("updateSolicitud",      p, c); },
    aprobarSolicitud:     function(p, c) { return routeMantenimientoAction_("aprobarSolicitud",     p, c); },
    // Órdenes de Trabajo
    listOrdenes:          function(p, c) { return routeMantenimientoAction_("listOrdenes",          p, c); },
    getOrden:             function(p, c) { return routeMantenimientoAction_("getOrden",             p, c); },
    createOrden:          function(p, c) { return routeMantenimientoAction_("createOrden",          p, c); },
    updateOrden:          function(p, c) { return routeMantenimientoAction_("updateOrden",          p, c); },
    asignarTecnico:       function(p, c) { return routeMantenimientoAction_("asignarTecnico",       p, c); },
    cerrarOrden:          function(p, c) { return routeMantenimientoAction_("cerrarOrden",          p, c); },
    cancelarOrden:        function(p, c) { return routeMantenimientoAction_("cancelarOrden",        p, c); },
    // Inspecciones
    listInspecciones:     function(p, c) { return routeMantenimientoAction_("listInspecciones",     p, c); },
    getInspeccion:        function(p, c) { return routeMantenimientoAction_("getInspeccion",        p, c); },
    createInspeccion:     function(p, c) { return routeMantenimientoAction_("createInspeccion",     p, c); },
    updateInspeccion:     function(p, c) { return routeMantenimientoAction_("updateInspeccion",     p, c); },
    cerrarInspeccion:     function(p, c) { return routeMantenimientoAction_("cerrarInspeccion",     p, c); },
    // Historial
    listHistorial:        function(p, c) { return routeMantenimientoAction_("listHistorial",        p, c); },
    getHistorialItem:     function(p, c) { return routeMantenimientoAction_("getHistorialItem",     p, c); },
    createHistorial:      function(p, c) { return routeMantenimientoAction_("createHistorial",      p, c); },
    // Costos
    listCostos:           function(p, c) { return routeMantenimientoAction_("listCostos",           p, c); },
    getCosto:             function(p, c) { return routeMantenimientoAction_("getCosto",             p, c); },
    createCosto:          function(p, c) { return routeMantenimientoAction_("createCosto",          p, c); },
    updateCosto:          function(p, c) { return routeMantenimientoAction_("updateCosto",          p, c); },
    // Inventario Técnico
    listInventario:           function(p, c) { return routeMantenimientoAction_("listInventario",           p, c); },
    getInventarioItem:        function(p, c) { return routeMantenimientoAction_("getInventarioItem",        p, c); },
    createInventarioItem:     function(p, c) { return routeMantenimientoAction_("createInventarioItem",     p, c); },
    updateInventarioItem:     function(p, c) { return routeMantenimientoAction_("updateInventarioItem",     p, c); },
    // Dashboard y Reportes
    getDashboardResumen:           function(p, c) { return routeMantenimientoAction_("getDashboardResumen",           p, c); },
    reporteEstadoActivos:          function(p, c) { return routeMantenimientoAction_("reporteEstadoActivos",          p, c); },
    reporteOrdenesPeriodo:         function(p, c) { return routeMantenimientoAction_("reporteOrdenesPeriodo",         p, c); },
    reporteCostosActivo:           function(p, c) { return routeMantenimientoAction_("reporteCostosActivo",           p, c); },
    reporteCumplimientoPreventivo: function(p, c) { return routeMantenimientoAction_("reporteCumplimientoPreventivo", p, c); },
    reporteOrdenesTecnico:         function(p, c) { return routeMantenimientoAction_("reporteOrdenesTecnico",         p, c); },
  },
};
