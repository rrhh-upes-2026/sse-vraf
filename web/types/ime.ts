/**
 * IME — Indicator Management Engine types.
 */

export type IMECatalogoTipo =
  | "tipoIndicador"
  | "frecuencia"
  | "polaridad"
  | "unidadMedida"
  | "pilarEstrategico"
  | "objetivoEstrategico"
  | "proceso"
  | "procedimiento";

export type IMEPolarity = "positiva" | "negativa" | "neutra";
export type IMECalculationType = "promedio" | "suma" | "ultimo" | "minimo" | "maximo";

export interface IMEIndicador {
  id: string;
  wsId: string;
  code: string;
  name: string;
  description: string;
  active: "true" | "false";
  // Classification
  organizationalUnitId: string;
  processId: string;
  procedureId: string;
  strategicPillar: string;
  strategicObjective: string;
  // Technical configuration
  indicatorType: string;
  measurementUnit: string;
  frequency: string;
  calculationType: IMECalculationType;
  polarity: IMEPolarity;
  targetValue: number | string;
  warningThreshold: number | string;
  criticalThreshold: number | string;
  // Responsibility
  responsiblePosition: string;
  responsibleUser: string;
  // General
  displayOrder: number | string;
  year: number | string;
  version: string;
  observations: string;
  // Audit
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  deletedAt: string;
}

export interface IMECatalogo {
  id: string;
  wsId: string;
  tipo: IMECatalogoTipo;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: "true" | "false";
  orden: number | string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface IMEHistorial {
  id: string;
  wsId: string;
  indicadorId: string;
  accion: "creado" | "actualizado" | "activado" | "desactivado" | "duplicado";
  usuario: string;
  detalle: string;
  createdAt: string;
}

export interface IMEDashboardResumen {
  total: number;
  activos: number;
  inactivos: number;
}

export interface IMECatalogoMap {
  tipoIndicador: IMECatalogo[];
  frecuencia: IMECatalogo[];
  polaridad: IMECatalogo[];
  unidadMedida: IMECatalogo[];
  pilarEstrategico: IMECatalogo[];
  objetivoEstrategico: IMECatalogo[];
  proceso: IMECatalogo[];
  procedimiento: IMECatalogo[];
}

export type IMEIndicadorDraft = Partial<IMEIndicador> & {
  code: string;
  name: string;
  measurementUnit: string;
  frequency: string;
  processId: string;
  targetValue: number | string;
};
