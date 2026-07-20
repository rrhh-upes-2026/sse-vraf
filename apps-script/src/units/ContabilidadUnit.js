/**
 * Contabilidad Organizational Unit Definition — Accounting & Finance.
 *
 * Budget execution, treasury, accounting records, financial reporting,
 * and audit trails for institutional finances.
 */

var CONTABILIDAD_UNIT_DEF = {

  key:         "contabilidad",
  label:       "Contabilidad y Finanzas",
  description: "Gestión presupuestaria, tesorería, registros contables y " +
               "reportes financieros institucionales.",
  version:     "1.0.0",
  enabled:     true,
  icon:        "DollarSign",
  color:       "#059669",
  owner: {
    rol:   "HEAD",
    label: "Jefe de Contabilidad",
  },

  navigation: [
    {
      key: "dashboard", label: "Dashboard Contabilidad", icon: "LayoutDashboard",
      path: "/contabilidad", requiredRoles: [],
    },
    {
      key: "presupuesto", label: "Presupuesto", icon: "PiggyBank",
      path: "/contabilidad/presupuesto", requiredRoles: [],
      children: [
        { key: "formulacion",   label: "Formulación",          icon: "FileText",    path: "/contabilidad/presupuesto/formulacion" },
        { key: "ejecucion",     label: "Ejecución",            icon: "TrendingUp",  path: "/contabilidad/presupuesto/ejecucion" },
        { key: "modificaciones", label: "Modificaciones",      icon: "Edit",        path: "/contabilidad/presupuesto/modificaciones" },
      ],
    },
    {
      key: "tesoreria", label: "Tesorería", icon: "Wallet",
      path: "/contabilidad/tesoreria", requiredRoles: [],
      children: [
        { key: "pagos",       label: "Pagos",              icon: "CreditCard",  path: "/contabilidad/tesoreria/pagos" },
        { key: "ingresos",    label: "Ingresos",           icon: "ArrowDownLeft", path: "/contabilidad/tesoreria/ingresos" },
        { key: "conciliacion", label: "Conciliación",      icon: "ArrowLeftRight", path: "/contabilidad/tesoreria/conciliacion" },
      ],
    },
    {
      key: "registros", label: "Registros Contables", icon: "BookText",
      path: "/contabilidad/registros", requiredRoles: [],
      children: [
        { key: "diario",    label: "Libro Diario",    icon: "List",    path: "/contabilidad/registros/diario" },
        { key: "mayor",     label: "Libro Mayor",     icon: "Layers",  path: "/contabilidad/registros/mayor" },
        { key: "balances",  label: "Balances",        icon: "Scale",   path: "/contabilidad/registros/balances" },
      ],
    },
    {
      key: "cuentas-pagar", label: "Cuentas por Pagar", icon: "Receipt",
      path: "/contabilidad/cuentas-pagar", requiredRoles: [],
    },
    {
      key: "cuentas-cobrar", label: "Cuentas por Cobrar", icon: "HandCoins",
      path: "/contabilidad/cuentas-cobrar", requiredRoles: [],
    },
    {
      key: "reportes", label: "Reportes Financieros", icon: "BarChart2",
      path: "/contabilidad/reportes", requiredRoles: [],
    },
    {
      key: "auditoria", label: "Auditoría", icon: "Search",
      path: "/contabilidad/auditoria", requiredRoles: ["ADMIN", "HEAD", "AUDIT"],
    },
    {
      key: "configuracion", label: "Configuración", icon: "Settings",
      path: "/contabilidad/config", requiredRoles: ["ADMIN", "HEAD"],
    },
  ],

  modules: [
    "presupuesto", "tesoreria", "pagos", "ingresos", "conciliacion",
    "diario", "mayor", "balances", "cuentas_pagar", "cuentas_cobrar",
    "reportes", "auditoria", "notificaciones", "documentos",
    "catalogo_cuentas", "centros_costo", "configuracion", "dashboard",
    "flujos_aprobacion", "integracion_rrhh",
  ],

  workflows: [
    {
      key:          "pago_proveedor_flow",
      label:        "Proceso de Pago a Proveedor",
      entity:       "pagos",
      initialEtapa: "solicitud",
      steps: [
        { etapa: "solicitud",  paso: 1, label: "Solicitud de Pago",       nextEtapa: "revision",    requiredDocs: ["factura"] },
        { etapa: "revision",   paso: 2, label: "Revisión Contable",       nextEtapa: "aprobacion",  requiredDocs: [] },
        { etapa: "aprobacion", paso: 3, label: "Aprobación Presupuestal", nextEtapa: "pago",        requiredDocs: [] },
        { etapa: "pago",       paso: 4, label: "Ejecución del Pago",      nextEtapa: "registro",    requiredDocs: [] },
        { etapa: "registro",   paso: 5, label: "Registro Contable",       nextEtapa: "completado",  requiredDocs: [] },
        { etapa: "completado", paso: 6, label: "Completado",              nextEtapa: null,           requiredDocs: [] },
      ],
    },
  ],

  automations: [
    {
      key:     "alerta_presupuesto_agotado",
      label:   "Alerta presupuesto > 90% ejecutado",
      trigger: "presupuesto.umbral_critico",
      action:  "notificacion.enviar",
      active:  true,
      config:  { canal: "both", roles: ["HEAD", "ADMIN"] },
    },
  ],

  reports: [
    { key: "estado_resultados", label: "Estado de Resultados",     entity: "registros", requiredRoles: [], format: "table" },
    { key: "ejecucion_ppto",    label: "Ejecución Presupuestaria", entity: "presupuesto", requiredRoles: [], format: "chart" },
    { key: "flujo_caja",        label: "Flujo de Caja",            entity: "tesoreria", requiredRoles: ["HEAD", "ADMIN", "AUDIT"], format: "chart" },
  ],

  catalogs: [
    { key: "plan_cuentas",    label: "Plan de Cuentas",     values: ["activo", "pasivo", "patrimonio", "ingreso", "gasto"] },
    { key: "centro_costo",    label: "Centro de Costo",     values: ["administracion", "academico", "rrhh", "tic", "biblioteca"] },
    { key: "tipo_transaccion", label: "Tipo de Transacción", values: ["ingreso", "egreso", "transferencia", "ajuste"] },
  ],

  permissions: {
    ADMIN:   ["*"],
    HEAD:    ["read", "write", "approve", "report"],
    ANALYST: ["read", "write"],
    OPS:     ["read"],
    AUDIT:   ["read", "report"],
  },

  roles: [
    { key: "HEAD",    label: "Jefe de Contabilidad" },
    { key: "ANALYST", label: "Contador" },
    { key: "OPS",     label: "Auxiliar Contable" },
    { key: "AUDIT",   label: "Auditor Interno" },
  ],

  entities: [],

  settings: {
    moneda:              "USD",
    periodoFiscal:       "enero_diciembre",
    niifEnabled:         false,
    notifEnabled:        true,
    reporteAutoEnabled:  true,
    periodoArchivado:    1825,
  },

  handlers: {},
};
