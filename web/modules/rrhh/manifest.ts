import type { ModuleManifest } from "@/lib/sdk/types";

export const rrhhManifest: ModuleManifest = {
  id: "rrhh",
  name: "Recursos Humanos",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description: "Gestión de empleados, contratación, capacitaciones y evaluaciones de desempeño.",
  icon: "M16 20v-2a4 4 0 0 0-8 0v2M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",

  workspace: {
    id: "rrhh",
    short: "Recursos Humanos",
    full: "Recursos Humanos",
    color: "#E5A100",
    bg: "#FDF3E1",
    icon: "M16 20v-2a4 4 0 0 0-8 0v2M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  },

  permissions: [
    { key: "rrhh.view",             description: "Ver el workspace de Recursos Humanos" },
    { key: "rrhh.employees.view",   description: "Ver listado de empleados" },
    { key: "rrhh.employees.edit",   description: "Crear y editar empleados" },
    { key: "rrhh.hiring.view",      description: "Ver solicitudes de contratación" },
    { key: "rrhh.hiring.manage",    description: "Gestionar el flujo de contratación" },
    { key: "rrhh.training.view",    description: "Ver capacitaciones" },
    { key: "rrhh.training.manage",  description: "Gestionar capacitaciones" },
    { key: "rrhh.evals.view",       description: "Ver evaluaciones de desempeño" },
    { key: "rrhh.evals.manage",     description: "Gestionar evaluaciones de desempeño" },
  ],

  entities: [
    { id: "empleados",               sheetName: "Empleados",               label: "Empleados" },
    { id: "solicitudesContratacion", sheetName: "SolicitudesContratacion", label: "Solicitudes de Contratación" },
    { id: "capacitaciones",          sheetName: "Capacitaciones",          label: "Capacitaciones" },
    { id: "evaluaciones",            sheetName: "Evaluaciones",            label: "Evaluaciones de Desempeño" },
  ],

  navigation: {
    extensions: [
      {
        id: "empleados",
        label: "Empleados",
        icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        href: "empleados",
        order: 1,
      },
      {
        id: "contratacion",
        label: "Contratación",
        icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M12 12h.01M8 12h.01M16 12h.01",
        href: "contratacion",
        order: 2,
      },
    ],
  },

  featureFlags: [
    { key: "rrhh.enabled",     envVar: "NEXT_PUBLIC_FLAG_RRHH",                 description: "Habilitar el módulo RRHH" },
    { key: "rrhh.employees",   envVar: "NEXT_PUBLIC_FLAG_RRHH_EMPLOYEES",        description: "Sub-sección Empleados" },
    { key: "rrhh.hiring",      envVar: "NEXT_PUBLIC_FLAG_RRHH_HIRING",           description: "Sub-sección Contratación" },
    { key: "rrhh.training",    envVar: "NEXT_PUBLIC_FLAG_RRHH_TRAINING",         description: "Sub-sección Capacitaciones" },
    { key: "rrhh.evaluations", envVar: "NEXT_PUBLIC_FLAG_RRHH_EVALUATIONS",      description: "Sub-sección Evaluaciones" },
  ],

  dependencies: [],
  status: "enabled",
};
