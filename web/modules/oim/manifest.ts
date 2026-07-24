import type { ModuleManifest } from "@/lib/sdk/types";

export const oimManifest: ModuleManifest = {
  id: "oim",
  name: "Official Indicator Migration",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor de migración oficial de indicadores VRAF. Normaliza, versiona y valida los indicadores " +
    "institucionales contra el catálogo FMI, detecta duplicados y genera reportes de auditoría " +
    "por sprint. Gateway único de importación masiva para el Indicator Definition Engine.",
  icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",

  workspace: {
    id: "oim",
    short: "OIM",
    full: "Official Indicator Migration",
    color: "#6366F1",
    bg: "#EEF2FF",
    icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  },

  permissions: [
    { key: "oim.read",    description: "Ver historial y reportes de migración" },
    { key: "oim.preview", description: "Vista previa de indicadores a importar" },
    { key: "oim.run",     description: "Ejecutar migración oficial de indicadores" },
    { key: "oim.admin",   description: "Administración total del módulo OIM" },
  ],

  entities: [
    { id: "oimImportHistory", sheetName: "OIM_ImportHistory", label: "Historial de Importaciones" },
  ],

  navigation: {
    extensions: [
      {
        id:    "oim-dashboard",
        label: "Dashboard",
        icon:  "M4 20V10M10 20V4M16 20v-7M4 20h16",
        href:  "oim-dashboard",
        order: 1,
      },
      {
        id:    "oim-migracion",
        label: "Migración",
        icon:  "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
        href:  "oim-migracion",
        order: 2,
      },
      {
        id:    "oim-reporte",
        label: "Validación",
        icon:  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        href:  "oim-reporte",
        order: 3,
      },
      {
        id:    "oim-errores",
        label: "Conflictos",
        icon:  "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        href:  "oim-errores",
        order: 4,
      },
      {
        id:    "oim-historial",
        label: "Historial",
        icon:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        href:  "oim-historial",
        order: 5,
      },
    ],
  },

  featureFlags: [
    { key: "oim.enabled", envVar: "NEXT_PUBLIC_FLAG_OIM", description: "Habilitar Official Indicator Migration" },
  ],

  dependencies: ["fmi", "ide"],
  status: "enabled",
};
