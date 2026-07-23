import type { ModuleManifest } from "@/lib/sdk/types";

export const fmiManifest: ModuleManifest = {
  id: "fmi",
  name: "Framework Maestro de Indicadores",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Núcleo institucional para la administración, cálculo, seguimiento y evaluación de indicadores " +
    "estratégicos, tácticos y operativos de la UPES. Define objetivos, dimensiones, unidades de medida, " +
    "frecuencias, motor de fórmulas y motor de rangos. Gateway exclusivo de indicadores para todas las unidades.",
  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",

  workspace: {
    id: "fmi",
    short: "FMI",
    full: "Framework Maestro de Indicadores",
    color: "#0D9488",
    bg: "#F0FDFA",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },

  permissions: [
    { key: "fmi.read",              description: "Ver catálogos del framework" },
    { key: "fmi.objectives.manage", description: "CRUD de objetivos institucionales" },
    { key: "fmi.dimensions.manage", description: "CRUD de dimensiones" },
    { key: "fmi.units.manage",      description: "CRUD de unidades de medida" },
    { key: "fmi.frequencies.manage",description: "CRUD de frecuencias" },
    { key: "fmi.formulas.manage",   description: "CRUD de fórmulas y variables" },
    { key: "fmi.ranges.manage",     description: "CRUD de configuración de rangos" },
    { key: "fmi.admin",             description: "Administración total del módulo FMI" },
  ],

  entities: [
    { id: "fmiObjectives",    sheetName: "FMI_Objectives",    label: "Objetivos Institucionales" },
    { id: "fmiDimensions",    sheetName: "FMI_Dimensions",    label: "Dimensiones" },
    { id: "fmiUnitMeasures",  sheetName: "FMI_UnitMeasures",  label: "Unidades de Medida" },
    { id: "fmiFrequencies",   sheetName: "FMI_Frequencies",   label: "Frecuencias" },
    { id: "fmiPolarities",    sheetName: "FMI_Polarities",    label: "Polaridades" },
    { id: "fmiFormulas",      sheetName: "FMI_Formulas",      label: "Fórmulas" },
    { id: "fmiFormulaVars",   sheetName: "FMI_FormulaVariables", label: "Variables de Fórmulas" },
    { id: "fmiRangeConfigs",  sheetName: "FMI_RangeConfigs",  label: "Configuraciones de Rangos" },
  ],

  navigation: {
    extensions: [
      {
        id:    "fmi-framework",
        label: "Marco FMI",
        icon:  "M4 6h16M4 10h16M4 14h16M4 18h16",
        href:  "fmi-framework",
        order: 1,
      },
      {
        id:    "fmi-objetivos",
        label: "Objetivos",
        icon:  "M13 10V3L4 14h7v7l9-11h-7z",
        href:  "fmi-objetivos",
        order: 2,
      },
      {
        id:    "fmi-dimensiones",
        label: "Dimensiones",
        icon:  "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
        href:  "fmi-dimensiones",
        order: 3,
      },
      {
        id:    "fmi-unidades",
        label: "Unidades",
        icon:  "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
        href:  "fmi-unidades",
        order: 4,
      },
      {
        id:    "fmi-frecuencias",
        label: "Frecuencias",
        icon:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        href:  "fmi-frecuencias",
        order: 5,
      },
      {
        id:    "fmi-formulas",
        label: "Fórmulas",
        icon:  "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
        href:  "fmi-formulas",
        order: 6,
      },
      {
        id:    "fmi-rangos",
        label: "Rangos",
        icon:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        href:  "fmi-rangos",
        order: 7,
      },
    ],
  },

  featureFlags: [
    { key: "fmi.enabled", envVar: "NEXT_PUBLIC_FLAG_FMI", description: "Habilitar Framework Maestro de Indicadores" },
  ],

  dependencies: [],
  status: "enabled",
};
