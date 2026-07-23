import type { ModuleManifest } from "@/lib/sdk/types";

export const nceManifest: ModuleManifest = {
  id: "nce",
  name: "Notification & Communication Engine",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor de Notificaciones institucional. Consume eventos del AUE, aplica templates " +
    "con sustitución {{variable}}, gestiona preferencias por usuario, aplica horario de " +
    "silencio y genera digests periódicos. Canal interno habilitado; correo y Google Chat " +
    "como contratos de integración futura.",
  icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",

  workspace: {
    id: "nce",
    short: "Notificaciones",
    full: "Notification & Communication Engine",
    color: "#0369A1",
    bg: "#F0F9FF",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },

  permissions: [
    { key: "nce.read",                description: "Ver notificaciones propias" },
    { key: "nce.notifications.create", description: "Crear notificaciones institucionales" },
    { key: "nce.notifications.manage", description: "Gestionar notificaciones de todos los usuarios" },
    { key: "nce.templates.read",       description: "Ver templates de notificación" },
    { key: "nce.templates.manage",     description: "Crear y editar templates" },
    { key: "nce.preferences.manage",   description: "Gestionar preferencias de usuario" },
    { key: "nce.digest.generate",      description: "Generar digests periódicos" },
    { key: "nce.aue.consume",          description: "Consumir eventos del AUE para generar notificaciones" },
  ],

  entities: [
    { id: "nceNotifications",   sheetName: "NCE_Notifications",   label: "Notificaciones" },
    { id: "nceTemplates",       sheetName: "NCE_Templates",       label: "Templates" },
    { id: "nceUserPreferences", sheetName: "NCE_UserPreferences", label: "Preferencias" },
    { id: "nceDigests",         sheetName: "NCE_Digests",         label: "Digests" },
  ],

  navigation: {
    extensions: [
      {
        id:    "nce-dashboard",
        label: "Dashboard",
        icon:  "M4 20V10M10 20V4M16 20v-7M4 20h16",
        href:  "nce-dashboard",
        order: 1,
      },
      {
        id:    "nce-bandeja",
        label: "Bandeja",
        icon:  "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
        href:  "nce-bandeja",
        order: 2,
      },
      {
        id:    "nce-plantillas",
        label: "Plantillas",
        icon:  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        href:  "nce-plantillas",
        order: 3,
      },
      {
        id:    "nce-preferencias",
        label: "Preferencias",
        icon:  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
        href:  "nce-preferencias",
        order: 4,
      },
      {
        id:    "nce-digest",
        label: "Digest",
        icon:  "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
        href:  "nce-digest",
        order: 5,
      },
    ],
  },

  featureFlags: [
    { key: "nce.enabled",          envVar: "NEXT_PUBLIC_FLAG_NCE",              description: "Habilitar Notification & Communication Engine" },
    { key: "nce.digest.auto",      envVar: "NEXT_PUBLIC_FLAG_NCE_DIGEST_AUTO",  description: "Generación automática de digests" },
    { key: "nce.aue.consume.auto", envVar: "NEXT_PUBLIC_FLAG_NCE_AUE_AUTO",     description: "Consumo automático de eventos AUE" },
  ],

  dependencies: ["aue"],
  status: "enabled",
};
