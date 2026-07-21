import type { ModuleManifest } from "@/lib/sdk/types";

export const ssoManifest: ModuleManifest = {
  id: "sso",
  name: "Salud y Seguridad Ocupacional",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Gestión de incidentes y accidentes laborales, inspecciones de seguridad, " +
    "matriz IPER de riesgos, acciones CAPA, control de EPP, capacitaciones SSO, " +
    "comité de seguridad, auditorías y cumplimiento legal.",
  icon: "M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z",

  workspace: {
    id: "salud",
    short: "SSO",
    full: "Salud y Seguridad Ocupacional",
    color: "#0891B2",
    bg: "#CFFAFE",
    icon: "M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z",
  },

  permissions: [
    { key: "sso.read",    description: "Ver incidentes, riesgos e inspecciones SSO" },
    { key: "sso.create",  description: "Reportar incidentes, crear peligros y acciones" },
    { key: "sso.edit",    description: "Editar incidentes, riesgos y acciones CAPA" },
    { key: "sso.approve", description: "Aprobar investigaciones y verificar acciones" },
    { key: "sso.archive", description: "Cerrar incidentes y archivar registros SSO" },
    { key: "sso.report",  description: "Generar reportes SSO e indicadores de accidentalidad" },
    { key: "sso.admin",   description: "Administración completa del módulo SSO" },
  ],

  entities: [
    { id: "ssoIncidentes",    sheetName: "SSOIncidentes",    label: "Incidentes Laborales" },
    { id: "ssoAccidentes",    sheetName: "SSOAccidentes",    label: "Accidentes de Trabajo" },
    { id: "ssoInspecciones",  sheetName: "SSOInspecciones",  label: "Inspecciones de Seguridad" },
    { id: "ssoPeligros",      sheetName: "SSOPeligros",      label: "Identificación de Peligros" },
    { id: "ssoRiesgos",       sheetName: "SSORiesgos",       label: "Matriz IPER de Riesgos" },
    { id: "ssoAcciones",      sheetName: "SSOAcciones",      label: "Acciones CAPA" },
    { id: "ssoEPP",           sheetName: "SSOEPP",           label: "Control de EPP" },
    { id: "ssoCapacitaciones", sheetName: "SSOCapacitaciones", label: "Capacitaciones SSO" },
    { id: "ssoComite",        sheetName: "SSOComite",        label: "Comité de Seguridad" },
    { id: "ssoAuditorias",    sheetName: "SSOAuditorias",    label: "Auditorías SSO" },
    { id: "ssoCumplimiento",  sheetName: "SSOCumplimiento",  label: "Cumplimiento Legal" },
  ],

  navigation: {
    extensions: [
      {
        id: "incidentes",
        label: "Incidentes",
        icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        href: "incidentes",
        order: 1,
      },
      {
        id: "accidentes",
        label: "Accidentes",
        icon: "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
        href: "accidentes",
        order: 2,
      },
      {
        id: "inspecciones-sso",
        label: "Inspecciones",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
        href: "inspecciones-sso",
        order: 3,
      },
      {
        id: "matriz-riesgos",
        label: "Matriz IPER",
        icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z",
        href: "matriz-riesgos",
        order: 4,
      },
      {
        id: "acciones-capa",
        label: "Acciones CAPA",
        icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4",
        href: "acciones-capa",
        order: 5,
      },
      {
        id: "epp",
        label: "Control EPP",
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        href: "epp",
        order: 6,
      },
      {
        id: "capacitaciones-sso",
        label: "Capacitaciones",
        icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z",
        href: "capacitaciones-sso",
        order: 7,
      },
      {
        id: "comite",
        label: "Comité SSO",
        icon: "M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
        href: "comite",
        order: 8,
      },
      {
        id: "auditorias-sso",
        label: "Auditorías",
        icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z",
        href: "auditorias-sso",
        order: 9,
      },
      {
        id: "cumplimiento-legal",
        label: "Cumplimiento Legal",
        icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 0 0 6.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
        href: "cumplimiento-legal",
        order: 10,
      },
    ],
  },

  featureFlags: [
    { key: "sso.enabled",       envVar: "NEXT_PUBLIC_FLAG_SSO",                   description: "Habilitar el módulo SSO" },
    { key: "sso.incidentes",    envVar: "NEXT_PUBLIC_FLAG_SSO_INCIDENTES",         description: "Sub-sección Incidentes" },
    { key: "sso.accidentes",    envVar: "NEXT_PUBLIC_FLAG_SSO_ACCIDENTES",         description: "Sub-sección Accidentes" },
    { key: "sso.inspecciones",  envVar: "NEXT_PUBLIC_FLAG_SSO_INSPECCIONES",       description: "Sub-sección Inspecciones" },
    { key: "sso.riesgos",       envVar: "NEXT_PUBLIC_FLAG_SSO_RIESGOS",            description: "Sub-sección Matriz IPER" },
    { key: "sso.acciones",      envVar: "NEXT_PUBLIC_FLAG_SSO_ACCIONES",           description: "Sub-sección Acciones CAPA" },
    { key: "sso.epp",           envVar: "NEXT_PUBLIC_FLAG_SSO_EPP",                description: "Sub-sección Control EPP" },
    { key: "sso.capacitaciones", envVar: "NEXT_PUBLIC_FLAG_SSO_CAPACITACIONES",   description: "Sub-sección Capacitaciones" },
    { key: "sso.cumplimiento",  envVar: "NEXT_PUBLIC_FLAG_SSO_CUMPLIMIENTO",       description: "Sub-sección Cumplimiento Legal" },
  ],

  dependencies: [],
  status: "enabled",
};
