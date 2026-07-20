import type { ModuleManifest } from "@/lib/sdk/types";

export const contabilidadManifest: ModuleManifest = {
  id: "contabilidad",
  name: "Contabilidad y Finanzas",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Ciclo financiero institucional: compromisos presupuestarios, registros contables, " +
    "facturas, pagos, conciliaciones bancarias y cuentas por pagar/cobrar.",
  icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",

  workspace: {
    id: "contabilidad",
    short: "Contabilidad",
    full: "Contabilidad y Finanzas",
    color: "#059669",
    bg: "#D1FAE5",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  },

  permissions: [
    { key: "contabilidad.read",    description: "Ver registros contables y financieros" },
    { key: "contabilidad.create",  description: "Crear compromisos, facturas y pagos" },
    { key: "contabilidad.edit",    description: "Editar registros contables" },
    { key: "contabilidad.approve", description: "Aprobar facturas y pagos" },
    { key: "contabilidad.archive", description: "Archivar y soft-delete de registros" },
    { key: "contabilidad.report",  description: "Generar reportes financieros" },
    { key: "contabilidad.admin",   description: "Administración completa del módulo" },
  ],

  entities: [
    { id: "contaCompromisos",    sheetName: "ContaCompromisos",    label: "Compromisos Presupuestarios" },
    { id: "contaRegistros",      sheetName: "ContaRegistros",      label: "Registros Contables" },
    { id: "contaFacturas",       sheetName: "ContaFacturas",       label: "Facturas" },
    { id: "contaPagos",          sheetName: "ContaPagos",          label: "Pagos" },
    { id: "contaConciliaciones", sheetName: "ContaConciliaciones", label: "Conciliaciones Bancarias" },
    { id: "contaCuentasPagar",   sheetName: "ContaCuentasPagar",   label: "Cuentas por Pagar" },
    { id: "contaCuentasCobrar",  sheetName: "ContaCuentasCobrar",  label: "Cuentas por Cobrar" },
  ],

  navigation: {
    extensions: [
      {
        id: "compromisos",
        label: "Compromisos",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z",
        href: "compromisos",
        order: 1,
      },
      {
        id: "facturas",
        label: "Facturas",
        icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
        href: "facturas",
        order: 2,
      },
      {
        id: "pagos",
        label: "Pagos",
        icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z",
        href: "pagos",
        order: 3,
      },
      {
        id: "registros-contables",
        label: "Registros",
        icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
        href: "registros-contables",
        order: 4,
      },
      {
        id: "cuentas-pagar",
        label: "Cuentas por Pagar",
        icon: "M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z",
        href: "cuentas-pagar",
        order: 5,
      },
      {
        id: "conciliaciones",
        label: "Conciliaciones",
        icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
        href: "conciliaciones",
        order: 6,
      },
      {
        id: "cuentas-cobrar",
        label: "Cuentas por Cobrar",
        icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
        href: "cuentas-cobrar",
        order: 7,
      },
    ],
  },

  featureFlags: [
    { key: "contabilidad.enabled",       envVar: "NEXT_PUBLIC_FLAG_CONTABILIDAD",              description: "Habilitar el módulo Contabilidad" },
    { key: "contabilidad.compromisos",   envVar: "NEXT_PUBLIC_FLAG_CONTA_COMPROMISOS",          description: "Sub-sección Compromisos" },
    { key: "contabilidad.facturas",      envVar: "NEXT_PUBLIC_FLAG_CONTA_FACTURAS",             description: "Sub-sección Facturas" },
    { key: "contabilidad.pagos",         envVar: "NEXT_PUBLIC_FLAG_CONTA_PAGOS",                description: "Sub-sección Pagos" },
    { key: "contabilidad.registros",     envVar: "NEXT_PUBLIC_FLAG_CONTA_REGISTROS",            description: "Sub-sección Registros" },
    { key: "contabilidad.cuentasPagar",  envVar: "NEXT_PUBLIC_FLAG_CONTA_CUENTAS_PAGAR",        description: "Sub-sección Cuentas por Pagar" },
    { key: "contabilidad.conciliaciones",envVar: "NEXT_PUBLIC_FLAG_CONTA_CONCILIACIONES",       description: "Sub-sección Conciliaciones" },
    { key: "contabilidad.cuentasCobrar", envVar: "NEXT_PUBLIC_FLAG_CONTA_CUENTAS_COBRAR",       description: "Sub-sección Cuentas por Cobrar" },
  ],

  dependencies: [],
  status: "enabled",
};
