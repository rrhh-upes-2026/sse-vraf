/**
 * Compras Organizational Unit Definition — Procurement & Purchasing.
 *
 * Purchase requisitions, vendor management, quotes, purchase orders,
 * reception, and institutional procurement reporting.
 */

var COMPRAS_UNIT_DEF = {

  key:         "compras",
  label:       "Compras y Adquisiciones",
  description: "Gestión de requisiciones de compra, proveedores, cotizaciones, " +
               "órdenes de compra y recepción de bienes y servicios.",
  version:     "1.0.0",
  enabled:     true,
  icon:        "ShoppingCart",
  color:       "#D97706",
  owner: {
    rol:   "HEAD",
    label: "Jefe de Compras",
  },

  navigation: [
    {
      key: "dashboard", label: "Dashboard Compras", icon: "LayoutDashboard",
      path: "/compras", requiredRoles: [],
    },
    {
      key: "requisiciones", label: "Requisiciones de Compra", icon: "ClipboardList",
      path: "/compras/requisiciones", requiredRoles: [],
      children: [
        { key: "nueva",      label: "Nueva Requisición",  icon: "Plus",         path: "/compras/requisiciones/nueva" },
        { key: "pendientes", label: "Pendientes",         icon: "Clock",        path: "/compras/requisiciones/pendientes" },
        { key: "aprobadas",  label: "Aprobadas",          icon: "CheckCircle",  path: "/compras/requisiciones/aprobadas" },
      ],
    },
    {
      key: "cotizaciones", label: "Cotizaciones", icon: "Receipt",
      path: "/compras/cotizaciones", requiredRoles: [],
      children: [
        { key: "solicitar",  label: "Solicitar Cotización", icon: "Send",      path: "/compras/cotizaciones/solicitar" },
        { key: "comparativo", label: "Cuadro Comparativo",  icon: "Table",     path: "/compras/cotizaciones/comparativo" },
      ],
    },
    {
      key: "ordenes", label: "Órdenes de Compra", icon: "FileText",
      path: "/compras/ordenes", requiredRoles: [],
      children: [
        { key: "generar",   label: "Generar OC",     icon: "FilePlus",   path: "/compras/ordenes/generar" },
        { key: "historial", label: "Historial OC",   icon: "History",    path: "/compras/ordenes/historial" },
      ],
    },
    {
      key: "recepcion", label: "Recepción de Bienes", icon: "PackageCheck",
      path: "/compras/recepcion", requiredRoles: [],
    },
    {
      key: "proveedores", label: "Proveedores", icon: "Building2",
      path: "/compras/proveedores", requiredRoles: [],
    },
    {
      key: "catalogo-bienes", label: "Catálogo de Bienes", icon: "Package",
      path: "/compras/catalogo", requiredRoles: [],
    },
    {
      key: "reportes", label: "Reportes", icon: "BarChart2",
      path: "/compras/reportes", requiredRoles: [],
    },
    {
      key: "configuracion", label: "Configuración", icon: "Settings",
      path: "/compras/config", requiredRoles: ["ADMIN", "HEAD"],
    },
  ],

  modules: [
    "requisiciones", "cotizaciones", "comparativo_precios", "ordenes_compra",
    "recepcion", "proveedores", "catalogo_bienes", "reportes", "auditoria",
    "notificaciones", "documentos", "flujos_aprobacion", "integracion_contabilidad",
    "integracion_inventario", "configuracion", "dashboard", "presupuesto",
    "evaluacion_proveedor", "contratos_proveedor", "alertas",
  ],

  workflows: [
    {
      key:          "compra_bien_servicio_flow",
      label:        "Proceso de Compra de Bien o Servicio",
      entity:       "requisicionesCompra",
      initialEtapa: "solicitud",
      steps: [
        { etapa: "solicitud",      paso: 1, label: "Solicitud de Compra",      nextEtapa: "aprobacion_jefe", requiredDocs: ["especificaciones"] },
        { etapa: "aprobacion_jefe", paso: 2, label: "Aprobación del Jefe",    nextEtapa: "cotizacion",       requiredDocs: [] },
        { etapa: "cotizacion",     paso: 3, label: "Solicitud de Cotizaciones", nextEtapa: "comparativo",     requiredDocs: [] },
        { etapa: "comparativo",    paso: 4, label: "Cuadro Comparativo",       nextEtapa: "aprobacion_conta", requiredDocs: ["cotizaciones"] },
        { etapa: "aprobacion_conta", paso: 5, label: "Aprobación Presupuestal", nextEtapa: "orden_compra",   requiredDocs: [] },
        { etapa: "orden_compra",   paso: 6, label: "Generación de OC",         nextEtapa: "recepcion",       requiredDocs: ["orden_compra"] },
        { etapa: "recepcion",      paso: 7, label: "Recepción de Bienes",      nextEtapa: "pago",            requiredDocs: ["acta_recepcion"] },
        { etapa: "pago",           paso: 8, label: "Autorización de Pago",     nextEtapa: "completado",      requiredDocs: ["factura"] },
        { etapa: "completado",     paso: 9, label: "Completado",               nextEtapa: null,               requiredDocs: [] },
      ],
    },
  ],

  automations: [
    {
      key:     "recordatorio_cotizacion",
      label:   "Recordatorio de cotización pendiente (> 3 días)",
      trigger: "compra.cotizacion_pendiente",
      action:  "notificacion.enviar",
      active:  true,
      config:  { canal: "email", roles: ["HEAD", "ANALYST"] },
    },
  ],

  reports: [
    { key: "reporte_compras_periodo",  label: "Compras por Período",    entity: "ordenesCompra",     requiredRoles: [], format: "table" },
    { key: "reporte_proveedores",      label: "Rendimiento Proveedores", entity: "proveedores",       requiredRoles: [], format: "chart" },
    { key: "reporte_ejecucion_compra", label: "Ejecución Presupuestal Compras", entity: "requisicionesCompra", requiredRoles: ["HEAD", "ADMIN", "AUDIT"], format: "chart" },
  ],

  catalogs: [
    { key: "modalidad_compra", label: "Modalidad de Compra",  values: ["libre_gestion", "licitacion_privada", "licitacion_publica", "contratacion_directa"] },
    { key: "tipo_bien",        label: "Tipo de Bien/Servicio", values: ["bien", "servicio", "obra"] },
    { key: "estado_oc",        label: "Estado Orden de Compra", values: ["borrador", "emitida", "recibida", "pagada", "cancelada"] },
  ],

  permissions: {
    ADMIN:   ["*"],
    HEAD:    ["read", "write", "approve", "report"],
    ANALYST: ["read", "write"],
    OPS:     ["read", "write_solicitud"],
    AUDIT:   ["read", "report"],
  },

  roles: [
    { key: "HEAD",    label: "Jefe de Compras" },
    { key: "ANALYST", label: "Analista de Compras" },
    { key: "OPS",     label: "Solicitante" },
    { key: "AUDIT",   label: "Auditor" },
  ],

  entities: [],

  settings: {
    montoLicitacionPrivada:  5000,
    montoLicitacionPublica:  50000,
    diasVigenciaOC:          30,
    notifEnabled:            true,
    reporteAutoEnabled:      false,
    periodoArchivado:        1825,
  },

  handlers: {},
};
