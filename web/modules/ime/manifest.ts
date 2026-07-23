import type { ModuleManifest } from "@/lib/sdk/types";

export const imeManifest: ModuleManifest = {
  id: "ime",
  name: "Gestión de Indicadores",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor de indicadores institucionales: definición, clasificación, metas, " +
    "responsables y seguimiento del ciclo de vida de cada indicador.",
  icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z",

  workspace: {
    id: "ime",
    short: "Indicadores",
    full: "Gestión de Indicadores",
    color: "#7C3AED",
    bg: "#EDE9FE",
    icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z",
  },

  permissions: [
    { key: "ime.read",     description: "Ver indicadores y catálogos" },
    { key: "ime.create",   description: "Crear nuevos indicadores" },
    { key: "ime.edit",     description: "Editar indicadores existentes" },
    { key: "ime.activate", description: "Activar y desactivar indicadores" },
    { key: "ime.catalog",  description: "Gestionar catálogos de valores" },
    { key: "ime.admin",    description: "Administración completa del módulo" },
  ],

  entities: [
    { id: "imeIndicadores", sheetName: "IMEIndicadores", label: "Indicadores" },
    { id: "imeCatalogos",   sheetName: "IMECatalogos",   label: "Catálogos" },
    { id: "imeHistorial",   sheetName: "IMEHistorial",   label: "Historial de Cambios" },
  ],

  navigation: {
    extensions: [
      {
        id: "gestion-indicadores",
        label: "Indicadores",
        icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z",
        href: "gestion-indicadores",
        order: 1,
      },
    ],
  },

  featureFlags: [
    { key: "ime.enabled",  envVar: "NEXT_PUBLIC_FLAG_IME",         description: "Habilitar módulo Gestión de Indicadores" },
    { key: "ime.catalogs", envVar: "NEXT_PUBLIC_FLAG_IME_CATALOGS", description: "Administración de catálogos" },
  ],

  dependencies: [],
  status: "enabled",
};
