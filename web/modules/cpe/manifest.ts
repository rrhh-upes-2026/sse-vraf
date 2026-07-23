import type { ModuleManifest } from "@/lib/sdk/types";

export const cpeManifest: ModuleManifest = {
  id: "cpe",
  name: "Cumplimiento Institucional",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor analítico que mide el nivel de cumplimiento operativo, documental y estratégico " +
    "de la institución. Consume datos de IME, PME, APE, AEE y EME sin modificarlos.",
  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",

  workspace: {
    id: "cpe",
    short: "Cumplimiento",
    full: "Cumplimiento Institucional",
    color: "#059669",
    bg: "#ECFDF5",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },

  permissions: [
    { key: "cpe.read",        description: "Ver dashboard y reportes de cumplimiento" },
    { key: "cpe.calcular",    description: "Ejecutar cálculo de cumplimiento" },
    { key: "cpe.brechas",     description: "Ver detección de brechas" },
    { key: "cpe.planes.read", description: "Ver planes de mejora" },
    { key: "cpe.planes.edit", description: "Crear y editar planes de mejora" },
    { key: "cpe.config",      description: "Configurar pesos y semáforos" },
    { key: "cpe.historial",   description: "Ver historial de cálculos" },
    { key: "cpe.admin",       description: "Administración completa del módulo" },
  ],

  entities: [
    { id: "cpeSnapshots",    sheetName: "CPESnapshots",    label: "Snapshots de Cumplimiento" },
    { id: "cpePlanesMejora", sheetName: "CPEPlanesMejora", label: "Planes de Mejora" },
    { id: "cpeHistorial",    sheetName: "CPEHistorial",    label: "Historial de Cálculos" },
    { id: "cpeCatalogos",    sheetName: "CPECatalogos",    label: "Catálogos CPE" },
  ],

  navigation: {
    extensions: [
      {
        id:    "cpe-dashboard",
        label: "Dashboard",
        icon:  "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
        href:  "cpe-dashboard",
        order: 1,
      },
      {
        id:    "cpe-cumplimiento",
        label: "Cumplimiento",
        icon:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        href:  "cpe-cumplimiento",
        order: 2,
      },
      {
        id:    "cpe-brechas",
        label: "Brechas",
        icon:  "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        href:  "cpe-brechas",
        order: 3,
      },
      {
        id:    "cpe-planes-mejora",
        label: "Planes de Mejora",
        icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
        href:  "cpe-planes-mejora",
        order: 4,
      },
      {
        id:    "cpe-configuracion",
        label: "Configuración",
        icon:  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
        href:  "cpe-configuracion",
        order: 5,
      },
    ],
  },

  featureFlags: [
    { key: "cpe.enabled",    envVar: "NEXT_PUBLIC_FLAG_CPE",             description: "Habilitar módulo Cumplimiento Institucional" },
    { key: "cpe.calcular",   envVar: "NEXT_PUBLIC_FLAG_CPE_CALCULAR",    description: "Cálculo de cumplimiento activo" },
    { key: "cpe.brechas",    envVar: "NEXT_PUBLIC_FLAG_CPE_BRECHAS",     description: "Detección de brechas activa" },
  ],

  dependencies: ["ape", "aee", "eme", "ime", "pme"],
  status: "enabled",
};
