import type { PMEActividad } from "@/types/pme";

export type ActividadWizardDraft = Partial<PMEActividad> & {
  code: string;
  name: string;
  procesoId: string;
  procedimientoId: string;
};

export const ACTIVIDAD_WIZARD_DEFAULTS: ActividadWizardDraft = {
  code: "",
  name: "",
  procesoId: "",
  procedimientoId: "",
  description: "",
  tipoActividadId: "",
  estadoOperativoId: "",
  periodicidad: "",
  objetivo: "",
  duracion: "",
  unidadDuracionId: "",
  responsiblePosition: "",
  responsibleUser: "",
  displayOrder: 0,
  version: "1.0",
  observations: "",
  indicadorId: "",
};

export const ACTIVIDAD_STEPS = [
  { id: 1, label: "Identificación" },
  { id: 2, label: "Jerarquía" },
  { id: 3, label: "Clasificación" },
  { id: 4, label: "Duración" },
  { id: 5, label: "Responsables" },
  { id: 6, label: "Resumen" },
] as const;
