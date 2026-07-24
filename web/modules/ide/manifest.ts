import type { ModuleManifest } from "@/lib/sdk/types";

export const ideManifest: ModuleManifest = {
  id:          "ide",
  name:        "Indicator Definition Engine",
  version:     "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor institucional de definición, validación, importación y versionado de indicadores. " +
    "Consume el FMI como infraestructura. Estándar institucional para todos los indicadores " +
    "estratégicos, tácticos y operativos de la UPES.",
  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",

  workspace: {
    id:    "ide",
    short: "IDE",
    full:  "Indicator Definition Engine",
    color: "#D97706",
    bg:    "#FFFBEB",
    icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },

  permissions: [
    { key: "ide.read",              description: "Ver indicadores definidos" },
    { key: "ide.create",            description: "Crear nuevos indicadores" },
    { key: "ide.edit",              description: "Editar indicadores en borrador" },
    { key: "ide.publish",           description: "Publicar indicadores para uso" },
    { key: "ide.archive",           description: "Archivar indicadores" },
    { key: "ide.simulate",          description: "Ejecutar simulaciones" },
    { key: "ide.import",            description: "Preparar importaciones" },
    { key: "ide.admin",             description: "Administración total del módulo IDE" },
  ],

  entities: [
    { id: "ideIndicators", sheetName: "IDE_Indicators",       label: "Indicadores" },
    { id: "ideVersions",   sheetName: "IDE_IndicatorVersions", label: "Versiones de Indicadores" },
  ],

  navigation: {
    extensions: [
      {
        id:    "ide-dashboard",
        label: "Motor IDE",
        icon:  "M4 6h16M4 10h16M4 14h16M4 18h16",
        href:  "ide-dashboard",
        order: 1,
      },
      {
        id:    "ide-listado",
        label: "Indicadores",
        icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
        href:  "ide-listado",
        order: 2,
      },
      {
        id:    "ide-crear",
        label: "Nuevo Indicador",
        icon:  "M12 4v16m8-8H4",
        href:  "ide-crear",
        order: 3,
      },
      {
        id:    "ide-simulador",
        label: "Simulador",
        icon:  "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z",
        href:  "ide-simulador",
        order: 4,
      },
      {
        id:    "ide-versiones",
        label: "Versiones",
        icon:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        href:  "ide-versiones",
        order: 5,
      },
      {
        id:    "ide-dependencias",
        label: "Dependencias",
        icon:  "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
        href:  "ide-dependencias",
        order: 6,
      },
      {
        id:    "ide-importacion",
        label: "Importación",
        icon:  "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
        href:  "ide-importacion",
        order: 7,
      },
    ],
  },

  featureFlags: [
    { key: "ide.enabled", envVar: "NEXT_PUBLIC_FLAG_IDE", description: "Habilitar Indicator Definition Engine" },
  ],

  dependencies: ["fmi", "isp"],
  status: "enabled",
};
