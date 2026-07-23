// FMI — Framework Maestro de Indicadores

export type FMIStatus     = "activo" | "inactivo";
export type FMITipoUnidad = "cuantitativa" | "cualitativa";
export type FMIPolaridad  = "positiva" | "negativa";
export type FMIRangeLevel = "excelente" | "bueno" | "aceptable" | "critico";
export type FMIVarTipo    = "numero" | "porcentaje" | "moneda" | "texto";

// ─── Core catalogs ──────────────────────────────────────────────────────────

export interface FMIObjective {
  id:          string;
  codigo:      string;
  nombre:      string;
  descripcion: string;
  estado:      FMIStatus;
  orden:       number;
  createdAt:   string;
  updatedAt:   string;
  updatedBy:   string;
}

export interface FMIDimension {
  id:          string;
  codigo:      string;
  nombre:      string;
  descripcion: string;
  estado:      FMIStatus;
  orden:       number;
  createdAt:   string;
  updatedAt:   string;
  updatedBy:   string;
}

export interface FMIUnitMeasure {
  id:     string;
  codigo: string;
  nombre: string;
  tipo:   FMITipoUnidad;
  estado: FMIStatus;
}

export interface FMIFrequency {
  id:          string;
  codigo:      string;
  nombre:      string;
  descripcion: string;
  periodoDias: number;
  estado:      FMIStatus;
}

export interface FMIPolarity {
  id:          string;
  codigo:      string;
  nombre:      string;
  descripcion: string;
  estado:      FMIStatus;
}

// ─── Formula engine ──────────────────────────────────────────────────────────

export interface FMIFormulaVariable {
  id:          string;
  formulaId:   string;
  codigo:      string;
  nombre:      string;
  descripcion: string;
  tipo:        FMIVarTipo;
  orden:       number;
}

export interface FMIFormula {
  id:               string;
  codigo:           string;
  nombre:           string;
  descripcion:      string;
  unidadMedidaId:   string;
  formulaVisible:   string;
  formulaEjecutable: string;
  variables:        FMIFormulaVariable[];
  estado:           FMIStatus;
  createdAt:        string;
  updatedAt:        string;
  updatedBy:        string;
}

// ─── Range config ────────────────────────────────────────────────────────────

export interface FMIRangeBound {
  min: number;
  max: number;
}

export interface FMIRangeConfig {
  id:          string;
  nombre:      string;
  descripcion: string;
  polaridad:   FMIPolaridad;
  excelente:   FMIRangeBound;
  bueno:       FMIRangeBound;
  aceptable:   FMIRangeBound;
  critico:     FMIRangeBound;
  estado:      FMIStatus;
  createdAt:   string;
  updatedAt:   string;
  updatedBy:   string;
}

// ─── Engine results ──────────────────────────────────────────────────────────

export interface FMICalculateResult {
  formulaId: string;
  values:    Record<string, number>;
  result:    number;
}

export interface FMIEvaluateResult {
  rangeConfigId: string;
  value:         number;
  status:        FMIRangeLevel;
}

// ─── Mutation params ─────────────────────────────────────────────────────────

export interface FMICreateObjectiveParams {
  codigo:       string;
  nombre:       string;
  descripcion?: string;
  orden?:       number;
}

export interface FMIUpdateObjectiveParams {
  id:           string;
  codigo?:      string;
  nombre?:      string;
  descripcion?: string;
  estado?:      FMIStatus;
  orden?:       number;
}

export interface FMICreateDimensionParams {
  codigo:       string;
  nombre:       string;
  descripcion?: string;
  orden?:       number;
}

export interface FMIUpdateDimensionParams {
  id:           string;
  codigo?:      string;
  nombre?:      string;
  descripcion?: string;
  estado?:      FMIStatus;
  orden?:       number;
}

export interface FMICreateUnitMeasureParams {
  codigo: string;
  nombre: string;
  tipo:   FMITipoUnidad;
}

export interface FMIUpdateUnitMeasureParams {
  id:      string;
  codigo?: string;
  nombre?: string;
  tipo?:   FMITipoUnidad;
  estado?: FMIStatus;
}

export interface FMICreateFrequencyParams {
  codigo:       string;
  nombre:       string;
  descripcion?: string;
  periodoDias?: number;
}

export interface FMIUpdateFrequencyParams {
  id:           string;
  codigo?:      string;
  nombre?:      string;
  descripcion?: string;
  periodoDias?: number;
  estado?:      FMIStatus;
}

export interface FMIFormulaVariableInput {
  codigo:       string;
  nombre:       string;
  descripcion?: string;
  tipo:         FMIVarTipo;
  orden?:       number;
}

export interface FMICreateFormulaParams {
  codigo:             string;
  nombre:             string;
  descripcion?:       string;
  unidadMedidaId:     string;
  formulaVisible:     string;
  formulaEjecutable:  string;
  variables:          FMIFormulaVariableInput[];
}

export interface FMIUpdateFormulaParams {
  id:                  string;
  codigo?:             string;
  nombre?:             string;
  descripcion?:        string;
  unidadMedidaId?:     string;
  formulaVisible?:     string;
  formulaEjecutable?:  string;
  variables?:          FMIFormulaVariableInput[];
  estado?:             FMIStatus;
}

export interface FMICreateRangeConfigParams {
  nombre:       string;
  descripcion?: string;
  polaridad:    FMIPolaridad;
  excelente:    FMIRangeBound;
  bueno:        FMIRangeBound;
  aceptable:    FMIRangeBound;
  critico:      FMIRangeBound;
}

export interface FMIUpdateRangeConfigParams {
  id:           string;
  nombre?:      string;
  descripcion?: string;
  polaridad?:   FMIPolaridad;
  excelente?:   FMIRangeBound;
  bueno?:       FMIRangeBound;
  aceptable?:   FMIRangeBound;
  critico?:     FMIRangeBound;
  estado?:      FMIStatus;
}

export interface FMIListParams {
  estado?: FMIStatus;
}

export interface FMIListUnitMeasureParams extends FMIListParams {
  tipo?: FMITipoUnidad;
}

export interface FMIListFormulaParams extends FMIListParams {
  unidadMedidaId?: string;
}
