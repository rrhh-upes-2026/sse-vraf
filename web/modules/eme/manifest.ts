import type { ModuleManifest } from "@/lib/sdk/types";

export const emeManifest: ModuleManifest = {
  id: "eme",
  name: "Gestión de Evidencias",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Repositorio institucional de evidencias generadas por la ejecución de actividades. " +
    "Versionamiento, trazabilidad, validación y clasificación de confidencialidad.",
  icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",

  workspace: {
    id: "eme",
    short: "Evidencias",
    full: "Gestión de Evidencias",
    color: "#7C3AED",
    bg: "#F5F3FF",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },

  permissions: [
    { key: "eme.read",     description: "Ver evidencias y repositorio" },
    { key: "eme.create",   description: "Cargar nuevas evidencias" },
    { key: "eme.edit",     description: "Editar metadatos de evidencias" },
    { key: "eme.version",  description: "Crear nuevas versiones de evidencias" },
    { key: "eme.validate", description: "Validar o rechazar evidencias" },
    { key: "eme.archive",  description: "Archivar evidencias" },
    { key: "eme.catalog",  description: "Gestionar catálogos del módulo" },
    { key: "eme.admin",    description: "Administración completa del módulo" },
  ],

  entities: [
    { id: "emeEvidencias", sheetName: "EMEEvidencias", label: "Evidencias" },
    { id: "emeCatalogos",  sheetName: "EMECatalogos",  label: "Catálogos" },
    { id: "emeHistorial",  sheetName: "EMEHistorial",  label: "Historial de Evidencias" },
  ],

  navigation: {
    extensions: [
      {
        id: "eme-dashboard",
        label: "Dashboard",
        icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
        href: "eme-dashboard",
        order: 1,
      },
      {
        id: "eme-mis-evidencias",
        label: "Mis evidencias",
        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
        href: "eme-mis-evidencias",
        order: 2,
      },
      {
        id: "eme-repositorio",
        label: "Repositorio",
        icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
        href: "eme-repositorio",
        order: 3,
      },
      {
        id: "eme-carga",
        label: "Carga",
        icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
        href: "eme-carga",
        order: 4,
      },
      {
        id: "eme-validacion",
        label: "Validación",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        href: "eme-validacion",
        order: 5,
      },
    ],
  },

  featureFlags: [
    { key: "eme.enabled",    envVar: "NEXT_PUBLIC_FLAG_EME",          description: "Habilitar módulo Gestión de Evidencias" },
    { key: "eme.versioning", envVar: "NEXT_PUBLIC_FLAG_EME_VERSIONING",description: "Versionamiento de evidencias" },
    { key: "eme.validation", envVar: "NEXT_PUBLIC_FLAG_EME_VALIDATION",description: "Flujo de validación de evidencias" },
  ],

  dependencies: ["aee"],
  status: "enabled",
};
