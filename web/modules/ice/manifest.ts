import type { ModuleManifest } from "@/lib/sdk/types";

export const iceManifest: ModuleManifest = {
  id: "ice",
  name: "Indicator Capture Engine",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor operativo de captura de variables de indicadores. Los responsables institucionales registran " +
    "sus variables por período; el sistema calcula automáticamente el resultado usando FormulaEngine, " +
    "evalúa el rango y lo enruta al flujo de aprobación. Nadie ingresa resultados manualmente.",
  icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",

  workspace: {
    id: "ice",
    short: "ICE",
    full: "Indicator Capture Engine",
    color: "#0284C7",
    bg: "#F0F9FF",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },

  permissions: [
    { key: "ice.read",         description: "Ver capturas e historial" },
    { key: "ice.capture",      description: "Registrar variables propias" },
    { key: "ice.approve",      description: "Aprobar capturas (jefatura)" },
    { key: "ice.admin.approve",description: "Aprobar capturas (vicerrectoría)" },
    { key: "ice.periods.manage",description: "Crear y gestionar períodos" },
    { key: "ice.admin",        description: "Administración total del módulo ICE" },
  ],

  entities: [
    { id: "icePeriods",   sheetName: "ICE_Periods",          label: "Períodos" },
    { id: "iceCapturas",  sheetName: "ICE_Capturas",         label: "Capturas" },
    { id: "iceCapVars",   sheetName: "ICE_CaptureVariables", label: "Variables de Captura" },
    { id: "iceApprovals", sheetName: "ICE_Approvals",        label: "Aprobaciones" },
    { id: "iceLocks",     sheetName: "ICE_Locks",            label: "Bloqueos" },
    { id: "iceAudit",     sheetName: "ICE_AuditTrail",       label: "Auditoría" },
  ],

  navigation: {
    extensions: [
      {
        id:    "ice-dashboard",
        label: "Dashboard",
        icon:  "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        href:  "ice-dashboard",
        order: 1,
      },
      {
        id:    "ice-mis-indicadores",
        label: "Mis Indicadores",
        icon:  "M4 6h16M4 10h16M4 14h7",
        href:  "ice-mis-indicadores",
        order: 2,
      },
      {
        id:    "ice-capturar",
        label: "Capturar",
        icon:  "M12 4v16m8-8H4",
        href:  "ice-capturar",
        order: 3,
      },
      {
        id:    "ice-aprobaciones",
        label: "Aprobaciones",
        icon:  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        href:  "ice-aprobaciones",
        order: 4,
      },
      {
        id:    "ice-periodos",
        label: "Períodos",
        icon:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
        href:  "ice-periodos",
        order: 5,
      },
      {
        id:    "ice-historial",
        label: "Historial",
        icon:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        href:  "ice-historial",
        order: 6,
      },
      {
        id:    "ice-auditoria",
        label: "Auditoría",
        icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        href:  "ice-auditoria",
        order: 7,
      },
    ],
  },

  featureFlags: [
    { key: "ice.enabled", envVar: "NEXT_PUBLIC_FLAG_ICE", description: "Habilitar Indicator Capture Engine" },
  ],

  dependencies: ["fmi", "ide", "oim"],
  status: "enabled",
};
