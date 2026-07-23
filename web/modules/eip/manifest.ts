import type { ModuleManifest } from "@/lib/sdk/types";

export const eipManifest: ModuleManifest = {
  id: "eip",
  name: "Executive Intelligence Platform",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Plataforma ejecutiva institucional. Consolida información de todos los motores " +
    "en tableros estratégicos, scorecards, mapas de calor, rankings y alertas ejecutivas. " +
    "Solo lectura — no almacena ni modifica datos fuente.",
  icon: "M13 10V3L4 14h7v7l9-11h-7z",

  workspace: {
    id: "eip",
    short: "Ejecutivo",
    full: "Executive Intelligence",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },

  permissions: [
    { key: "eip.read",        description: "Ver dashboard ejecutivo" },
    { key: "eip.scorecard",   description: "Ver Balanced Scorecard" },
    { key: "eip.heatmap",     description: "Ver mapa de calor" },
    { key: "eip.trends",      description: "Ver tendencias" },
    { key: "eip.alerts",      description: "Ver alertas ejecutivas" },
    { key: "eip.timeline",    description: "Ver cronología institucional" },
    { key: "eip.ranking",     description: "Ver rankings" },
    { key: "eip.comparativo", description: "Ver analítica comparativa" },
  ],

  entities: [],

  navigation: {
    extensions: [
      {
        id:    "eip-dashboard",
        label: "Dashboard",
        icon:  "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
        href:  "eip-dashboard",
        order: 1,
      },
      {
        id:    "eip-scorecard",
        label: "Scorecard",
        icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
        href:  "eip-scorecard",
        order: 2,
      },
      {
        id:    "eip-heatmap",
        label: "Mapa de Calor",
        icon:  "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
        href:  "eip-heatmap",
        order: 3,
      },
      {
        id:    "eip-ranking",
        label: "Ranking",
        icon:  "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12",
        href:  "eip-ranking",
        order: 4,
      },
      {
        id:    "eip-timeline",
        label: "Cronología",
        icon:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
        href:  "eip-timeline",
        order: 5,
      },
      {
        id:    "eip-tendencias",
        label: "Tendencias",
        icon:  "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
        href:  "eip-tendencias",
        order: 6,
      },
      {
        id:    "eip-alertas",
        label: "Alertas",
        icon:  "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
        href:  "eip-alertas",
        order: 7,
      },
      {
        id:    "eip-comparativo",
        label: "Comparativo",
        icon:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        href:  "eip-comparativo",
        order: 8,
      },
      {
        id:    "eip-reportes",
        label: "Reportes",
        icon:  "M8 3h6l4 4v14H6V5a2 2 0 012-2zM14 3v4h4M9 13h6",
        href:  "eip-reportes",
        order: 9,
      },
    ],
  },

  featureFlags: [
    { key: "eip.enabled",     envVar: "NEXT_PUBLIC_FLAG_EIP",             description: "Habilitar Executive Intelligence Platform" },
    { key: "eip.alerts",      envVar: "NEXT_PUBLIC_FLAG_EIP_ALERTS",       description: "Alertas ejecutivas activas" },
    { key: "eip.comparativo", envVar: "NEXT_PUBLIC_FLAG_EIP_COMPARATIVO",  description: "Analítica comparativa activa" },
  ],

  dependencies: ["ime", "pme", "ape", "aee", "eme", "cpe"],
  status: "enabled",
};
