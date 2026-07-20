import type { ModuleManifest } from "@/lib/sdk/types";

export const comprasManifest: ModuleManifest = {
  id: "compras",
  name: "Compras y Adquisiciones",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Ciclo completo de abastecimiento: solicitudes, requisiciones, cotizaciones, " +
    "órdenes de compra, recepción de bienes y evaluación de proveedores.",
  icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",

  workspace: {
    id: "compras",
    short: "Compras",
    full: "Compras y Adquisiciones",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  },

  permissions: [
    { key: "compras.read",    description: "Ver registros de compras" },
    { key: "compras.create",  description: "Crear solicitudes y registros" },
    { key: "compras.edit",    description: "Editar solicitudes y documentos" },
    { key: "compras.approve", description: "Aprobar requisiciones y órdenes" },
    { key: "compras.archive", description: "Archivar y soft-delete de registros" },
    { key: "compras.report",  description: "Generar reportes de compras" },
    { key: "compras.admin",   description: "Administración completa del módulo" },
  ],

  entities: [
    { id: "comprasSolicitudes",  sheetName: "ComprasSolicitudes",  label: "Solicitudes de Compra" },
    { id: "comprasRequisiciones",sheetName: "ComprasRequisiciones", label: "Requisiciones" },
    { id: "comprasCotizaciones", sheetName: "ComprasCotizaciones",  label: "Cotizaciones" },
    { id: "comprasProveedores",  sheetName: "ComprasProveedores",   label: "Proveedores" },
    { id: "comprasOrdenes",      sheetName: "ComprasOrdenes",       label: "Órdenes de Compra" },
    { id: "comprasRecepciones",  sheetName: "ComprasRecepciones",   label: "Recepciones" },
    { id: "comprasEvaluaciones", sheetName: "ComprasEvaluaciones",  label: "Evaluaciones de Proveedor" },
  ],

  navigation: {
    extensions: [
      {
        id: "solicitudes-compra",
        label: "Solicitudes",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        href: "solicitudes-compra",
        order: 1,
      },
      {
        id: "requisiciones",
        label: "Requisiciones",
        icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
        href: "requisiciones",
        order: 2,
      },
      {
        id: "cotizaciones",
        label: "Cotizaciones",
        icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
        href: "cotizaciones",
        order: 3,
      },
      {
        id: "ordenes",
        label: "Órdenes de Compra",
        icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M15 5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2M15 5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2m0 6h6m-6 4h3",
        href: "ordenes",
        order: 4,
      },
      {
        id: "recepcion",
        label: "Recepción",
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
        href: "recepcion",
        order: 5,
      },
      {
        id: "proveedores",
        label: "Proveedores",
        icon: "M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4",
        href: "proveedores",
        order: 6,
      },
    ],
  },

  featureFlags: [
    { key: "compras.enabled",      envVar: "NEXT_PUBLIC_FLAG_COMPRAS",              description: "Habilitar el módulo Compras" },
    { key: "compras.solicitudes",  envVar: "NEXT_PUBLIC_FLAG_COMPRAS_SOLICITUDES",  description: "Sub-sección Solicitudes" },
    { key: "compras.requisiciones",envVar: "NEXT_PUBLIC_FLAG_COMPRAS_REQUISICIONES",description: "Sub-sección Requisiciones" },
    { key: "compras.cotizaciones", envVar: "NEXT_PUBLIC_FLAG_COMPRAS_COTIZACIONES", description: "Sub-sección Cotizaciones" },
    { key: "compras.ordenes",      envVar: "NEXT_PUBLIC_FLAG_COMPRAS_ORDENES",      description: "Sub-sección Órdenes de Compra" },
    { key: "compras.recepcion",    envVar: "NEXT_PUBLIC_FLAG_COMPRAS_RECEPCION",    description: "Sub-sección Recepción" },
    { key: "compras.proveedores",  envVar: "NEXT_PUBLIC_FLAG_COMPRAS_PROVEEDORES",  description: "Sub-sección Proveedores" },
  ],

  dependencies: [],
  status: "enabled",
};
