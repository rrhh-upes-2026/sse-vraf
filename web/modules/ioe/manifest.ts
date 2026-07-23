import type { ModuleManifest } from "@/lib/sdk/types";

export const ioeManifest: ModuleManifest = {
  id: "ioe",
  name: "Institutional Orchestration Engine",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor de orquestación institucional. Transforma diagnósticos, brechas y alertas en planes de acción " +
    "ejecutables con hitos, tareas, decisiones y seguimiento trazable. Cierra el ciclo entre análisis, " +
    "decisión y ejecución estratégica.",
  icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",

  workspace: {
    id: "ioe",
    short: "Orquestación",
    full: "Institutional Orchestration Engine",
    color: "#0F766E",
    bg: "#F0FDFA",
    icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
  },

  permissions: [
    { key: "ioe.read",             description: "Ver planes, hitos, tareas y decisiones" },
    { key: "ioe.plans.create",     description: "Crear planes de acción" },
    { key: "ioe.plans.update",     description: "Actualizar planes de acción" },
    { key: "ioe.plans.close",      description: "Cerrar formalmente planes completados" },
    { key: "ioe.milestones.write", description: "Crear y actualizar hitos" },
    { key: "ioe.tasks.write",      description: "Crear y actualizar tareas" },
    { key: "ioe.decisions.write",  description: "Registrar decisiones institucionales" },
    { key: "ioe.generate",         description: "Generar planes automáticamente desde IIE/CPE/EIP" },
    { key: "ioe.calendar",         description: "Ver calendario de orquestación" },
  ],

  entities: [
    { id: "ioeActionPlans", sheetName: "IOE_ActionPlans", label: "Planes de Acción" },
    { id: "ioeMilestones",  sheetName: "IOE_Milestones",  label: "Hitos" },
    { id: "ioeTasks",       sheetName: "IOE_Tasks",       label: "Tareas" },
    { id: "ioeDecisions",   sheetName: "IOE_Decisions",   label: "Decisiones" },
  ],

  navigation: {
    extensions: [
      {
        id:    "ioe-dashboard",
        label: "Dashboard",
        icon:  "M4 20V10M10 20V4M16 20v-7M4 20h16",
        href:  "ioe-dashboard",
        order: 1,
      },
      {
        id:    "ioe-planes",
        label: "Planes",
        icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        href:  "ioe-planes",
        order: 2,
      },
      {
        id:    "ioe-hitos",
        label: "Hitos",
        icon:  "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
        href:  "ioe-hitos",
        order: 3,
      },
      {
        id:    "ioe-tareas",
        label: "Tareas",
        icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
        href:  "ioe-tareas",
        order: 4,
      },
      {
        id:    "ioe-decisiones",
        label: "Decisiones",
        icon:  "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
        href:  "ioe-decisiones",
        order: 5,
      },
      {
        id:    "ioe-calendario",
        label: "Calendario",
        icon:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
        href:  "ioe-calendario",
        order: 6,
      },
      {
        id:    "ioe-seguimiento",
        label: "Seguimiento",
        icon:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        href:  "ioe-seguimiento",
        order: 7,
      },
    ],
  },

  featureFlags: [
    { key: "ioe.enabled",       envVar: "NEXT_PUBLIC_FLAG_IOE",            description: "Habilitar Institutional Orchestration Engine" },
    { key: "ioe.auto_generate", envVar: "NEXT_PUBLIC_FLAG_IOE_AUTOGEN",    description: "Generación automática de planes desde otros motores" },
  ],

  dependencies: ["iie", "cpe", "eip"],
  status: "enabled",
};
