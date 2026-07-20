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

  entities: [],

  settings: {
    diasRespuestaEstandar:  3,
    diasRespuestaCritica:   1,
    alertaVencimientoHoras: 24,
    notifEnabled:           true,
    reporteAutoEnabled:     false,
    periodoArchivado:       1095,
  },

  handlers: {},
};
