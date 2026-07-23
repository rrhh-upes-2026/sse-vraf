import type { ModuleManifest } from "@/lib/sdk/types";

export const pmeManifest: ModuleManifest = {
  id: "pme",
  name: "Gestión de Procesos",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor de procesos institucionales: definición, clasificación y ciclo de vida de " +
    "procesos, procedimientos y actividades operativas.",
  icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",

  workspace: {
    id: "pme",
    short: "Procesos",
    full: "Gestión de Procesos",
    color: "#0F766E",
    bg: "#CCFBF1",
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },

  permissions: [
    { key: "pme.read",      description: "Ver procesos, procedimientos y actividades" },
    { key: "pme.create",    description: "Crear nuevos registros" },
    { key: "pme.edit",      description: "Editar registros existentes" },
    { key: "pme.archive",   description: "Archivar y reactivar registros" },
    { key: "pme.catalog",   description: "Gestionar catálogos de valores" },
    { key: "pme.admin",     description: "Administración completa del módulo" },
  ],

  entities: [
    { id: "pmeProcesos",        sheetName: "PMEProcesos",        label: "Procesos" },
    { id: "pmeProcedimientos",  sheetName: "PMEProcedimientos",  label: "Procedimientos" },
    { id: "pmeActividades",     sheetName: "PMEActividades",     label: "Actividades" },
    { id: "pmeCatalogos",       sheetName: "PMECatalogos",       label: "Catálogos" },
    { id: "pmeHistorial",       sheetName: "PMEHistorial",       label: "Historial de Cambios" },
  ],

  navigation: {
    extensions: [
      {
        id: "procesos-pme",
        label: "Procesos",
        icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
        href: "procesos-pme",
        order: 1,
      },
      {
        id: "procedimientos",
        label: "Procedimientos",
        icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
        href: "procedimientos",
        order: 2,
      },
      {
        id: "actividades-pme",
        label: "Actividades",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        href: "actividades-pme",
        order: 3,
      },
    ],
  },

  featureFlags: [
    { key: "pme.enabled",  envVar: "NEXT_PUBLIC_FLAG_PME",         description: "Habilitar módulo Gestión de Procesos" },
    { key: "pme.catalogs", envVar: "NEXT_PUBLIC_FLAG_PME_CATALOGS", description: "Administración de catálogos PME" },
  ],

  dependencies: [],
  status: "enabled",
};
