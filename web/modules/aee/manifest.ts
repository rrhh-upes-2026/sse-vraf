import type { ModuleManifest } from "@/lib/sdk/types";

export const aeeManifest: ModuleManifest = {
  id: "aee",
  name: "Ejecución Institucional",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor de ejecución de actividades institucionales: registro oficial de ejecuciones, " +
    "historial de responsables, tiempos reales y trazabilidad completa de la operación.",
  icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",

  workspace: {
    id: "aee",
    short: "Ejecución",
    full: "Ejecución Institucional",
    color: "#0E7490",
    bg: "#ECFEFF",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },

  permissions: [
    { key: "aee.read",     description: "Ver ejecuciones y historial" },
    { key: "aee.create",   description: "Registrar nuevas ejecuciones" },
    { key: "aee.edit",     description: "Editar ejecuciones existentes" },
    { key: "aee.status",   description: "Cambiar estado de ejecuciones" },
    { key: "aee.archive",  description: "Archivar ejecuciones" },
    { key: "aee.catalog",  description: "Gestionar catálogos del módulo" },
    { key: "aee.admin",    description: "Administración completa del módulo" },
  ],

  entities: [
    { id: "aeeEjecuciones", sheetName: "AEEEjecuciones", label: "Ejecuciones" },
    { id: "aeeCatalogos",   sheetName: "AEECatalogos",   label: "Catálogos" },
    { id: "aeeHistorial",   sheetName: "AEEHistorial",   label: "Historial de Cambios" },
  ],

  navigation: {
    extensions: [
      {
        id: "aee-dashboard",
        label: "Dashboard",
        icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
        href: "aee-dashboard",
        order: 1,
      },
      {
        id: "aee-mis-actividades",
        label: "Mis actividades",
        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
        href: "aee-mis-actividades",
        order: 2,
      },
      {
        id: "aee-registro",
        label: "Registro",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        href: "aee-registro",
        order: 3,
      },
      {
        id: "aee-historial",
        label: "Historial",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        href: "aee-historial",
        order: 4,
      },
    ],
  },

  featureFlags: [
    { key: "aee.enabled",  envVar: "NEXT_PUBLIC_FLAG_AEE",         description: "Habilitar módulo Ejecución Institucional" },
    { key: "aee.approval", envVar: "NEXT_PUBLIC_FLAG_AEE_APPROVAL", description: "Flujo de aprobación de ejecuciones (Sprint 005+)" },
  ],

  dependencies: ["ape"],
  status: "enabled",
};
