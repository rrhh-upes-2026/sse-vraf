import type { ModuleManifest } from "@/lib/sdk/types";

export const apeManifest: ModuleManifest = {
  id: "ape",
  name: "Planificación Institucional",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor de planificación de actividades institucionales: generación automática de planes " +
    "anuales, seguimiento de cronogramas y gestión de estados de planificación.",
  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",

  workspace: {
    id: "ape",
    short: "Planificación",
    full: "Planificación Institucional",
    color: "#0369A1",
    bg: "#E0F2FE",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  },

  permissions: [
    { key: "ape.read",     description: "Ver planes de actividades" },
    { key: "ape.create",   description: "Crear planes manualmente" },
    { key: "ape.edit",     description: "Editar planes existentes" },
    { key: "ape.generate", description: "Generar planes automáticamente desde actividades PME" },
    { key: "ape.status",   description: "Cambiar estado de planes" },
    { key: "ape.admin",    description: "Administración completa del módulo" },
  ],

  entities: [
    { id: "apePlanes",    sheetName: "APEPlanes",    label: "Planes de Actividades" },
    { id: "apeHistorial", sheetName: "APEHistorial", label: "Historial de Cambios" },
  ],

  navigation: {
    extensions: [
      {
        id: "ape-planes",
        label: "Planes",
        icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
        href: "ape-planes",
        order: 1,
      },
      {
        id: "ape-calendario",
        label: "Calendario",
        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
        href: "ape-calendario",
        order: 2,
      },
      {
        id: "ape-cronograma",
        label: "Cronograma",
        icon: "M4 6h16M4 10h16M4 14h8M4 18h4",
        href: "ape-cronograma",
        order: 3,
      },
      {
        id: "ape-tabla",
        label: "Tabla",
        icon: "M3 10h18M3 14h18M10 3v18M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z",
        href: "ape-tabla",
        order: 4,
      },
    ],
  },

  featureFlags: [
    { key: "ape.enabled",  envVar: "NEXT_PUBLIC_FLAG_APE",         description: "Habilitar módulo Planificación Institucional" },
    { key: "ape.generate", envVar: "NEXT_PUBLIC_FLAG_APE_GENERATE", description: "Generación automática de planes" },
  ],

  dependencies: ["pme"],
  status: "enabled",
};
