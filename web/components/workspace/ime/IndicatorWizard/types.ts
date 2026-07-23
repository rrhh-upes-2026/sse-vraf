import type { IMEIndicador } from "@/types/ime";

export type WizardDraft = Partial<IMEIndicador> & {
  code: string;
  name: string;
  measurementUnit: string;
  frequency: string;
  processId: string;
  targetValue: string;
};

export const WIZARD_DEFAULTS: WizardDraft = {
  code:                 "",
  name:                 "",
  description:          "",
  measurementUnit:      "",
  frequency:            "",
  processId:            "",
  targetValue:          "",
  active:               "true",
  organizationalUnitId: "",
  procedureId:          "",
  strategicPillar:      "",
  strategicObjective:   "",
  indicatorType:        "",
  calculationType:      "promedio",
  polarity:             "positiva",
  warningThreshold:     "",
  criticalThreshold:    "",
  responsiblePosition:  "",
  responsibleUser:      "",
  displayOrder:         "",
  year:                 String(new Date().getFullYear()),
  version:              "1.0",
  observations:         "",
};

export const STEPS = [
  { id: 1, label: "Información General" },
  { id: 2, label: "Ubicación Organizacional" },
  { id: 3, label: "Configuración Técnica" },
  { id: 4, label: "Meta y Medición" },
  { id: 5, label: "Responsables" },
  { id: 6, label: "Resumen" },
] as const;

export type StepId = typeof STEPS[number]["id"];
