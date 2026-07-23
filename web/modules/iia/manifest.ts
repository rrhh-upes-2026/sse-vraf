import type { ModuleManifest } from "@/lib/sdk/types";

export const iiaManifest: ModuleManifest = {
  id: "iia",
  name: "Institutional Intelligence Assistant",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Asistente de Inteligencia Institucional impulsado por Gemini. Gateway exclusivo de IA para " +
    "la plataforma: consultas en lenguaje natural, acciones institucionales supervisadas, " +
    "análisis de indicadores y síntesis ejecutiva. Sin datos externos ni agentes autónomos.",
  icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",

  workspace: {
    id: "iia",
    short: "IIA",
    full: "Institutional Intelligence Assistant",
    color: "#4F46E5",
    bg: "#EEF2FF",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },

  permissions: [
    { key: "iia.read",             description: "Acceder al asistente y ver el dashboard" },
    { key: "iia.chat",             description: "Enviar mensajes y recibir respuestas de Gemini" },
    { key: "iia.conversations.manage", description: "Ver y eliminar conversaciones propias" },
    { key: "iia.prompts.read",     description: "Ver plantillas de prompts institucionales" },
    { key: "iia.prompts.manage",   description: "Editar plantillas de prompts" },
    { key: "iia.history.read",     description: "Ver historial de uso y auditoría" },
    { key: "iia.config.manage",    description: "Gestionar configuración y clave API de Gemini" },
    { key: "iia.admin",            description: "Administración total del módulo IIA" },
  ],

  entities: [
    { id: "iiaConfig",        sheetName: "IIA_Config",          label: "Configuración" },
    { id: "iiaConversations", sheetName: "IIA_Conversations",   label: "Conversaciones" },
    { id: "iiaMessages",      sheetName: "IIA_Messages",        label: "Mensajes" },
    { id: "iiaPrompts",       sheetName: "IIA_PromptTemplates", label: "Plantillas de Prompts" },
    { id: "iiaActions",       sheetName: "IIA_Actions",         label: "Acciones" },
    { id: "iiaAuditLog",      sheetName: "IIA_AuditLog",        label: "Auditoría" },
    { id: "iiaUsageMetrics",  sheetName: "IIA_UsageMetrics",    label: "Métricas de Uso" },
  ],

  navigation: {
    extensions: [
      {
        id:    "iia-dashboard",
        label: "Dashboard",
        icon:  "M4 20V10M10 20V4M16 20v-7M4 20h16",
        href:  "iia-dashboard",
        order: 1,
      },
      {
        id:    "iia-chat",
        label: "Chat",
        icon:  "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
        href:  "iia-chat",
        order: 2,
      },
      {
        id:    "iia-conversaciones",
        label: "Conversaciones",
        icon:  "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
        href:  "iia-conversaciones",
        order: 3,
      },
      {
        id:    "iia-prompts",
        label: "Prompts",
        icon:  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        href:  "iia-prompts",
        order: 4,
      },
      {
        id:    "iia-configuracion",
        label: "Configuración",
        icon:  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
        href:  "iia-configuracion",
        order: 5,
      },
      {
        id:    "iia-historial",
        label: "Historial",
        icon:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        href:  "iia-historial",
        order: 6,
      },
    ],
  },

  featureFlags: [
    { key: "iia.enabled",       envVar: "NEXT_PUBLIC_FLAG_IIA",         description: "Habilitar módulo IIA" },
    { key: "iia.gemini.ready",  envVar: "NEXT_PUBLIC_FLAG_IIA_GEMINI",  description: "Gemini API configurada" },
  ],

  dependencies: ["isp", "iie", "gwp"],
  status: "enabled",
};
