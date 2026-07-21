import type { ModuleManifest } from "@/lib/sdk/types";

export const mantenimientoManifest: ModuleManifest = {
  id: "mantenimiento",
  name: "Mantenimiento e Infraestructura",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Gestión de activos institucionales, mantenimiento preventivo y correctivo, " +
    "órdenes de trabajo, inspecciones técnicas, costos de mantenimiento e inventario técnico.",
  icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",

  workspace: {
    id: "mantenimiento",
    short: "Mantenimiento",
    full: "Mantenimiento e Infraestructura",
    color: "#DC2626",
    bg: "#FEE2E2",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },

  permissions: [
    { key: "mantenimiento.read",    description: "Ver activos, órdenes de trabajo e inspecciones" },
    { key: "mantenimiento.create",  description: "Crear solicitudes, órdenes de trabajo y activos" },
    { key: "mantenimiento.edit",    description: "Editar órdenes de trabajo y activos" },
    { key: "mantenimiento.approve", description: "Aprobar solicitudes y cierre de órdenes" },
    { key: "mantenimiento.archive", description: "Dar de baja activos y archivar registros" },
    { key: "mantenimiento.report",  description: "Generar reportes de mantenimiento" },
    { key: "mantenimiento.admin",   description: "Administración completa del módulo" },
  ],

  entities: [
    { id: "mantoActivos",           sheetName: "MantoActivos",           label: "Activos Institucionales" },
    { id: "mantoUbicaciones",       sheetName: "MantoUbicaciones",       label: "Ubicaciones" },
    { id: "mantoPlanes",            sheetName: "MantoPlanes",            label: "Planes de Mantenimiento" },
    { id: "mantoSolicitudes",       sheetName: "MantoSolicitudes",       label: "Solicitudes de Servicio" },
    { id: "mantoOrdenesTrabajo",    sheetName: "MantoOrdenesTrabajo",    label: "Órdenes de Trabajo" },
    { id: "mantoInspecciones",      sheetName: "MantoInspecciones",      label: "Inspecciones" },
    { id: "mantoHistorial",         sheetName: "MantoHistorial",         label: "Historial Técnico" },
    { id: "mantoCostos",            sheetName: "MantoCostos",            label: "Costos de Mantenimiento" },
    { id: "mantoInventarioTecnico", sheetName: "MantoInventarioTecnico", label: "Inventario Técnico" },
  ],

  navigation: {
    extensions: [
      {
        id: "activos",
        label: "Activos",
        icon: "M5 8h14M5 8a2 2 0 1 0 0-4h14a2 2 0 1 0 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4",
        href: "activos",
        order: 1,
      },
      {
        id: "ordenes-trabajo",
        label: "Órdenes de Trabajo",
        icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4",
        href: "ordenes-trabajo",
        order: 2,
      },
      {
        id: "solicitudes-manto",
        label: "Solicitudes",
        icon: "M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4",
        href: "solicitudes-manto",
        order: 3,
      },
      {
        id: "planes-manto",
        label: "Planes Preventivos",
        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
        href: "planes-manto",
        order: 4,
      },
      {
        id: "inspecciones",
        label: "Inspecciones",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
        href: "inspecciones",
        order: 5,
      },
      {
        id: "costos-manto",
        label: "Costos",
        icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
        href: "costos-manto",
        order: 6,
      },
      {
        id: "ubicaciones",
        label: "Ubicaciones",
        icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z",
        href: "ubicaciones",
        order: 7,
      },
      {
        id: "inventario-tecnico",
        label: "Inventario Técnico",
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
        href: "inventario-tecnico",
        order: 8,
      },
    ],
  },

  featureFlags: [
    { key: "mantenimiento.enabled",      envVar: "NEXT_PUBLIC_FLAG_MANTENIMIENTO",              description: "Habilitar el módulo Mantenimiento" },
    { key: "mantenimiento.activos",      envVar: "NEXT_PUBLIC_FLAG_MANTO_ACTIVOS",               description: "Sub-sección Activos" },
    { key: "mantenimiento.ordenes",      envVar: "NEXT_PUBLIC_FLAG_MANTO_ORDENES",               description: "Sub-sección Órdenes de Trabajo" },
    { key: "mantenimiento.solicitudes",  envVar: "NEXT_PUBLIC_FLAG_MANTO_SOLICITUDES",           description: "Sub-sección Solicitudes" },
    { key: "mantenimiento.planes",       envVar: "NEXT_PUBLIC_FLAG_MANTO_PLANES",                description: "Sub-sección Planes Preventivos" },
    { key: "mantenimiento.inspecciones", envVar: "NEXT_PUBLIC_FLAG_MANTO_INSPECCIONES",          description: "Sub-sección Inspecciones" },
    { key: "mantenimiento.costos",       envVar: "NEXT_PUBLIC_FLAG_MANTO_COSTOS",                description: "Sub-sección Costos" },
    { key: "mantenimiento.inventario",   envVar: "NEXT_PUBLIC_FLAG_MANTO_INVENTARIO",            description: "Sub-sección Inventario Técnico" },
  ],

  dependencies: [],
  status: "enabled",
};
