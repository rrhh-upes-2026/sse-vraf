import type { PMEProceso } from "@/types/pme";

export type ProcesoWizardDraft = Partial<PMEProceso> & {
  code: string;
  name: string;
};

export const PROCESO_WIZARD_DEFAULTS: ProcesoWizardDraft = {
  code: "",
  name: "",
  description: "",
  tipoProcesoId: "",
  periodicidad: "",
  objetivo: "",
  organizationalUnitId: "",
  responsiblePosition: "",
  responsibleUser: "",
  displayOrder: 0,
  version: "1.0",
  observations: "",
};

export const PROCESO_STEPS = [
  { id: 1, label: "Identificación" },
  { id: 2, label: "Clasificación" },
  { id: 3, label: "Objetivo" },
  { id: 4, label: "Responsables" },
  { id: 5, label: "Configuración" },
  { id: 6, label: "Resumen" },
] as const;
