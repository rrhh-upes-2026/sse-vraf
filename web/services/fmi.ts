import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  FMIObjective, FMIDimension, FMIUnitMeasure, FMIFrequency,
  FMIPolarity, FMIFormula, FMIRangeConfig,
  FMICalculateResult, FMIEvaluateResult,
  FMICreateObjectiveParams, FMIUpdateObjectiveParams,
  FMICreateDimensionParams, FMIUpdateDimensionParams,
  FMICreateUnitMeasureParams, FMIUpdateUnitMeasureParams,
  FMICreateFrequencyParams, FMIUpdateFrequencyParams,
  FMICreateFormulaParams, FMIUpdateFormulaParams,
  FMICreateRangeConfigParams, FMIUpdateRangeConfigParams,
  FMIListParams, FMIListUnitMeasureParams, FMIListFormulaParams,
} from "@/types/fmi";

const WS = "fmi";
const c = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

// ─── Objectives ───────────────────────────────────────────────────────────────

export const listFMIObjectives  = (params?: FMIListParams) => c().call<FMIObjective[]>(`${WS}.listObjectives`, p(params));
export const getFMIObjective    = (id: string) => c().call<FMIObjective>(`${WS}.getObjective`, { id });
export const createFMIObjective = (params: FMICreateObjectiveParams) => c().call<FMIObjective>(`${WS}.createObjective`, p(params));
export const updateFMIObjective = (params: FMIUpdateObjectiveParams) => c().call<FMIObjective>(`${WS}.updateObjective`, p(params));
export const deleteFMIObjective = (id: string) => c().call<{ deleted: boolean; id: string }>(`${WS}.deleteObjective`, { id });

// ─── Dimensions ───────────────────────────────────────────────────────────────

export const listFMIDimensions  = (params?: FMIListParams) => c().call<FMIDimension[]>(`${WS}.listDimensions`, p(params));
export const getFMIDimension    = (id: string) => c().call<FMIDimension>(`${WS}.getDimension`, { id });
export const createFMIDimension = (params: FMICreateDimensionParams) => c().call<FMIDimension>(`${WS}.createDimension`, p(params));
export const updateFMIDimension = (params: FMIUpdateDimensionParams) => c().call<FMIDimension>(`${WS}.updateDimension`, p(params));
export const deleteFMIDimension = (id: string) => c().call<{ deleted: boolean; id: string }>(`${WS}.deleteDimension`, { id });

// ─── Unit Measures ────────────────────────────────────────────────────────────

export const listFMIUnitMeasures  = (params?: FMIListUnitMeasureParams) => c().call<FMIUnitMeasure[]>(`${WS}.listUnitMeasures`, p(params));
export const getFMIUnitMeasure    = (id: string) => c().call<FMIUnitMeasure>(`${WS}.getUnitMeasure`, { id });
export const createFMIUnitMeasure = (params: FMICreateUnitMeasureParams) => c().call<FMIUnitMeasure>(`${WS}.createUnitMeasure`, p(params));
export const updateFMIUnitMeasure = (params: FMIUpdateUnitMeasureParams) => c().call<FMIUnitMeasure>(`${WS}.updateUnitMeasure`, p(params));
export const deleteFMIUnitMeasure = (id: string) => c().call<{ deleted: boolean; id: string }>(`${WS}.deleteUnitMeasure`, { id });

// ─── Frequencies ──────────────────────────────────────────────────────────────

export const listFMIFrequencies  = (params?: FMIListParams) => c().call<FMIFrequency[]>(`${WS}.listFrequencies`, p(params));
export const getFMIFrequency     = (id: string) => c().call<FMIFrequency>(`${WS}.getFrequency`, { id });
export const createFMIFrequency  = (params: FMICreateFrequencyParams) => c().call<FMIFrequency>(`${WS}.createFrequency`, p(params));
export const updateFMIFrequency  = (params: FMIUpdateFrequencyParams) => c().call<FMIFrequency>(`${WS}.updateFrequency`, p(params));
export const deleteFMIFrequency  = (id: string) => c().call<{ deleted: boolean; id: string }>(`${WS}.deleteFrequency`, { id });

// ─── Polarities (read-only) ───────────────────────────────────────────────────

export const listFMIPolarities = () => c().call<FMIPolarity[]>(`${WS}.listPolarities`, {});

// ─── Formulas ─────────────────────────────────────────────────────────────────

export const listFMIFormulas   = (params?: FMIListFormulaParams) => c().call<FMIFormula[]>(`${WS}.listFormulas`, p(params));
export const getFMIFormula     = (id: string) => c().call<FMIFormula>(`${WS}.getFormula`, { id });
export const createFMIFormula  = (params: FMICreateFormulaParams) => c().call<FMIFormula>(`${WS}.createFormula`, p(params));
export const updateFMIFormula  = (params: FMIUpdateFormulaParams) => c().call<FMIFormula>(`${WS}.updateFormula`, p(params));
export const deleteFMIFormula  = (id: string) => c().call<{ deleted: boolean; id: string }>(`${WS}.deleteFormula`, { id });
export const calculateFMIFormula = (id: string, values: Record<string, number>) =>
  c().call<FMICalculateResult>(`${WS}.calculateFormula`, { id, values });

// ─── Range Configs ────────────────────────────────────────────────────────────

export const listFMIRangeConfigs   = (params?: FMIListParams) => c().call<FMIRangeConfig[]>(`${WS}.listRangeConfigs`, p(params));
export const getFMIRangeConfig     = (id: string) => c().call<FMIRangeConfig>(`${WS}.getRangeConfig`, { id });
export const createFMIRangeConfig  = (params: FMICreateRangeConfigParams) => c().call<FMIRangeConfig>(`${WS}.createRangeConfig`, p(params));
export const updateFMIRangeConfig  = (params: FMIUpdateRangeConfigParams) => c().call<FMIRangeConfig>(`${WS}.updateRangeConfig`, p(params));
export const deleteFMIRangeConfig  = (id: string) => c().call<{ deleted: boolean; id: string }>(`${WS}.deleteRangeConfig`, { id });
export const evaluateFMIRange      = (id: string, value: number) =>
  c().call<FMIEvaluateResult>(`${WS}.evaluateRange`, { id, value });
