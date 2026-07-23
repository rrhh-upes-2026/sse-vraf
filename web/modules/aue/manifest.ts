import type { ModuleManifest } from "@/lib/sdk/types";

export const aueManifest: ModuleManifest = {
  id: "aue",
  name: "Automation & Event Engine",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Event Bus institucional transversal. Registra eventos de cualquier motor, evalúa reglas " +
    "WHEN/IF/THEN de forma determinista, encola ejecuciones y despacha acciones declarativas " +
    "sin código dinámico. Prepara la plataforma para automatizaciones e integraciones externas.",
  icon: "M13 10V3L4 14h7v7l9-11h-7z",

  workspace: {
    id: "aue",
    short: "Automatización",
    full: "Automation & Event Engine",
    color: "#7C3AED",
    bg: "#F5F3FF",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },

  permissions: [
    { key: "aue.read",             description: "Ver eventos, reglas y ejecuciones" },
    { key: "aue.events.create",    description: "Registrar eventos institucionales" },
    { key: "aue.events.process",   description: "Procesar eventos pendientes manualmente" },
    { key: "aue.rules.create",     description: "Crear reglas de automatización" },
    { key: "aue.rules.update",     description: "Modificar y versionar reglas" },
    { key: "aue.rules.toggle",     description: "Activar y desactivar reglas" },
    { key: "aue.queue.manage",     description: "Gestionar cola y reintentos" },
    { key: "aue.audit",            description: "Ver historial de auditoría completo" },
  ],

  entities: [
    { id: "aueEvents",     sheetName: "AUE_Events",     label: "Eventos" },
    { id: "aueRules",      sheetName: "AUE_Rules",      label: "Reglas" },
    { id: "aueExecutions", sheetName: "AUE_Executions", label: "Ejecuciones" },
    { id: "aueQueue",      sheetName: "AUE_Queue",      label: "Cola" },
  ],

  navigation: {
    extensions: [
      {
        id:    "aue-dashboard",
        label: "Dashboard",
        icon:  "M4 20V10M10 20V4M16 20v-7M4 20h16",
        href:  "aue-dashboard",
        order: 1,
      },
      {
        id:    "aue-eventos",
        label: "Eventos",
        icon:  "M13 10V3L4 14h7v7l9-11h-7z",
        href:  "aue-eventos",
        order: 2,
      },
      {
        id:    "aue-reglas",
        label: "Reglas",
        icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        href:  "aue-reglas",
        order: 3,
      },
      {
        id:    "aue-cola",
        label: "Cola",
        icon:  "M4 6h16M4 10h16M4 14h16M4 18h16",
        href:  "aue-cola",
        order: 4,
      },
      {
        id:    "aue-ejecuciones",
        label: "Ejecuciones",
        icon:  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        href:  "aue-ejecuciones",
        order: 5,
      },
      {
        id:    "aue-auditoria",
        label: "Auditoría",
        icon:  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        href:  "aue-auditoria",
        order: 6,
      },
    ],
  },

  featureFlags: [
    { key: "aue.enabled",      envVar: "NEXT_PUBLIC_FLAG_AUE",            description: "Habilitar Automation & Event Engine" },
    { key: "aue.auto_process", envVar: "NEXT_PUBLIC_FLAG_AUE_AUTOPROCESS", description: "Procesar eventos automáticamente al crearlos" },
  ],

  dependencies: ["ioe"],
  status: "enabled",
};
