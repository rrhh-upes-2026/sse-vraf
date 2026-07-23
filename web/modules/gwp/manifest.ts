import type { ModuleManifest } from "@/lib/sdk/types";

export const gwpManifest: ModuleManifest = {
  id: "gwp",
  name: "Google Workspace Integration Platform",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Plataforma de integración con Google Workspace. Único gateway autorizado para comunicarse " +
    "con servicios de Google. Implementa adaptadores desacoplados para Gmail, Calendar, Drive " +
    "y Google Chat. OAuth 2.0 con refresh automático, revocación y protección CSRF.",
  icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",

  workspace: {
    id: "gwp",
    short: "Google WS",
    full: "Google Workspace Platform",
    color: "#0F9D58",
    bg: "#F0FDF4",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  },

  permissions: [
    { key: "gwp.read",              description: "Ver estado de integración y logs" },
    { key: "gwp.oauth.manage",      description: "Gestionar tokens OAuth de Google" },
    { key: "gwp.drive.use",         description: "Operar sobre Google Drive" },
    { key: "gwp.gmail.send",        description: "Enviar correos vía Gmail" },
    { key: "gwp.calendar.manage",   description: "Crear y modificar eventos de Calendar" },
    { key: "gwp.chat.send",         description: "Enviar mensajes a Google Chat" },
    { key: "gwp.config.manage",     description: "Administrar credenciales OAuth y scopes" },
    { key: "gwp.admin",             description: "Administración total de GWP" },
  ],

  entities: [
    { id: "gwpOAuthTokens",    sheetName: "GWP_OAuthTokens",    label: "Tokens OAuth" },
    { id: "gwpConfig",         sheetName: "GWP_Config",         label: "Configuración" },
    { id: "gwpMailLog",        sheetName: "GWP_MailLog",        label: "Log de Correos" },
    { id: "gwpDriveMetadata",  sheetName: "GWP_DriveMetadata",  label: "Metadatos Drive" },
    { id: "gwpCalendarEvents", sheetName: "GWP_CalendarEvents", label: "Eventos Calendar" },
    { id: "gwpChatLog",        sheetName: "GWP_ChatLog",        label: "Log de Chat" },
    { id: "gwpAuditLog",       sheetName: "GWP_AuditLog",       label: "Auditoría GWP" },
  ],

  navigation: {
    extensions: [
      {
        id:    "gwp-dashboard",
        label: "Dashboard",
        icon:  "M4 20V10M10 20V4M16 20v-7M4 20h16",
        href:  "gwp-dashboard",
        order: 1,
      },
      {
        id:    "gwp-oauth",
        label: "OAuth",
        icon:  "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
        href:  "gwp-oauth",
        order: 2,
      },
      {
        id:    "gwp-drive",
        label: "Drive",
        icon:  "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
        href:  "gwp-drive",
        order: 3,
      },
      {
        id:    "gwp-gmail",
        label: "Gmail",
        icon:  "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
        href:  "gwp-gmail",
        order: 4,
      },
      {
        id:    "gwp-calendar",
        label: "Calendar",
        icon:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
        href:  "gwp-calendar",
        order: 5,
      },
      {
        id:    "gwp-chat",
        label: "Chat",
        icon:  "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
        href:  "gwp-chat",
        order: 6,
      },
      {
        id:    "gwp-configuracion",
        label: "Configuración",
        icon:  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
        href:  "gwp-configuracion",
        order: 7,
      },
    ],
  },

  featureFlags: [
    { key: "gwp.enabled",        envVar: "NEXT_PUBLIC_FLAG_GWP",              description: "Habilitar Google Workspace Integration Platform" },
    { key: "gwp.drive.enabled",  envVar: "NEXT_PUBLIC_FLAG_GWP_DRIVE",        description: "Adaptador Drive activo" },
    { key: "gwp.gmail.enabled",  envVar: "NEXT_PUBLIC_FLAG_GWP_GMAIL",        description: "Adaptador Gmail activo" },
    { key: "gwp.calendar.enabled", envVar: "NEXT_PUBLIC_FLAG_GWP_CALENDAR",   description: "Adaptador Calendar activo" },
    { key: "gwp.chat.enabled",   envVar: "NEXT_PUBLIC_FLAG_GWP_CHAT",         description: "Adaptador Chat activo" },
  ],

  dependencies: ["isp"],
  status: "enabled",
};
