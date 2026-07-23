import type { ModuleManifest } from "@/lib/sdk/types";

export const iieManifest: ModuleManifest = {
  id: "iie",
  name: "Institutional Intelligence Engine",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Motor de inteligencia institucional. Transforma datos operativos en conocimiento estructurado " +
    "mediante diagnósticos, recomendaciones, predicciones y narrativas ejecutivas generadas por " +
    "reglas de negocio configurables. Prepara contratos de integración para proveedores de IA futura.",
  icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",

  workspace: {
    id: "iie",
    short: "Inteligencia",
    full: "Institutional Intelligence",
    color: "#6D28D9",
    bg: "#F5F3FF",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },

  permissions: [
    { key: "iie.read",              description: "Ver dashboard de inteligencia institucional" },
    { key: "iie.diagnostics",       description: "Ver diagnósticos institucionales" },
    { key: "iie.recommendations",   description: "Ver recomendaciones del motor" },
    { key: "iie.predictions",       description: "Ver predicciones y proyecciones" },
    { key: "iie.anomalies",         description: "Ver anomalías detectadas" },
    { key: "iie.narratives",        description: "Ver narrativas ejecutivas" },
    { key: "iie.configuration",     description: "Ver configuración del motor" },
    { key: "iie.configuration.edit",description: "Editar configuración y reglas de conocimiento" },
    { key: "iie.semantic",          description: "Acceder al servicio semántico institucional" },
  ],

  entities: [
    { id: "iieConfiguration",   sheetName: "IIE_Configuration",   label: "Configuración IIE" },
    { id: "iieKnowledgeRules",  sheetName: "IIE_KnowledgeRules",  label: "Reglas de Conocimiento" },
    { id: "iieModelParameters", sheetName: "IIE_ModelParameters", label: "Parámetros de Modelos" },
  ],

  navigation: {
    extensions: [
      {
        id:    "iie-dashboard",
        label: "Dashboard",
        icon:  "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
        href:  "iie-dashboard",
        order: 1,
      },
      {
        id:    "iie-diagnosticos",
        label: "Diagnósticos",
        icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
        href:  "iie-diagnosticos",
        order: 2,
      },
      {
        id:    "iie-recomendaciones",
        label: "Recomendaciones",
        icon:  "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
        href:  "iie-recomendaciones",
        order: 3,
      },
      {
        id:    "iie-predicciones",
        label: "Predicciones",
        icon:  "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
        href:  "iie-predicciones",
        order: 4,
      },
      {
        id:    "iie-anomalias",
        label: "Anomalías",
        icon:  "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        href:  "iie-anomalias",
        order: 5,
      },
      {
        id:    "iie-narrativas",
        label: "Narrativas",
        icon:  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        href:  "iie-narrativas",
        order: 6,
      },
      {
        id:    "iie-configuracion",
        label: "Configuración",
        icon:  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
        href:  "iie-configuracion",
        order: 7,
      },
    ],
  },

  featureFlags: [
    { key: "iie.enabled",       envVar: "NEXT_PUBLIC_FLAG_IIE",             description: "Habilitar Institutional Intelligence Engine" },
    { key: "iie.predictions",   envVar: "NEXT_PUBLIC_FLAG_IIE_PREDICTIONS", description: "Motor de predicciones activo" },
    { key: "iie.semantic",      envVar: "NEXT_PUBLIC_FLAG_IIE_SEMANTIC",    description: "Servicio semántico activo" },
  ],

  dependencies: ["ime", "pme", "ape", "aee", "eme", "cpe"],
  status: "enabled",
};
