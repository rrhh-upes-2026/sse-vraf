import type { PMEProcedimiento } from "@/types/pme";

export type ProcedimientoWizardDraft = Partial<PMEProcedimiento> & {
  code: string;
  name: string;
  procesoId: string;
};

export const PROCEDIMIENTO_WIZARD_DEFAULTS: ProcedimientoWizardDraft = {
  code: "",
  name: "",
  procesoId: "",
  description: "",
  tipoProcedimientoId: "",
  periodicidad: "",
  objetivo: "",
  responsiblePosition: "",
  responsibleUser: "",
  displayOrder: 0,
  version: "1.0",
  observations: "",
};

export const PROCEDIMIENTO_STEPS = [
  { id: 1, label: "Identificación" },
  { id: 2, label: "Proceso Padre" },
  { id: 3, label: "Clasificación" },
  { id: 4, label: "Responsables" },
  { id: 5, label: "Resumen" },
] as const;
