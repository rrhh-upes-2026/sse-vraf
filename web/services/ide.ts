import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  IndicatorDefinition, IndicatorVersion,
  IDEPreview, IDEVariable,
  IDESimulationResult, IDEValidationResult,
  IDEDuplicate, IDEImportResult, IDEMappingTemplate,
  IDEListParams, IDECreateParams, IDEUpdateParams,
  IDESimulateParams, IDEPrepareImportParams, IDEFieldMapping,
} from "@/types/ide";

const WS = "ide";
const c = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

// ─── Indicators ───────────────────────────────────────────────────────────────

export const listIDEIndicators   = (params?: IDEListParams) => c().call<IndicatorDefinition[]>(`${WS}.listIndicators`, p(params));
export const getIDEIndicator     = (id: string) => c().call<IndicatorDefinition>(`${WS}.getIndicator`, { id });
export const createIDEIndicator  = (params: IDECreateParams) => c().call<IndicatorDefinition>(`${WS}.createIndicator`, p(params));
export const updateIDEIndicator  = (params: IDEUpdateParams) => c().call<IndicatorDefinition>(`${WS}.updateIndicator`, p(params));
export const deleteIDEIndicator  = (id: string) => c().call<{ deleted: boolean; id: string }>(`${WS}.deleteIndicator`, { id });

// ─── Validation & preview ─────────────────────────────────────────────────────

export const validateIDEIndicator = (params: Partial<IDECreateParams> & { existingId?: string }) =>
  c().call<IDEValidationResult>(`${WS}.validateIndicator`, p(params));
export const previewIDEIndicator  = (params: Partial<IDECreateParams>) =>
  c().call<IDEPreview>(`${WS}.previewIndicator`, p(params));

// ─── Simulation ───────────────────────────────────────────────────────────────

export const simulateIDEIndicator = (params: IDESimulateParams) =>
  c().call<IDESimulationResult>(`${WS}.simulateIndicator`, p(params));

// ─── Status transitions ───────────────────────────────────────────────────────

export const publishIDEIndicator  = (id: string) => c().call<IndicatorDefinition>(`${WS}.publishIndicator`,  { id });
export const archiveIDEIndicator  = (id: string) => c().call<IndicatorDefinition>(`${WS}.archiveIndicator`,  { id });
export const sendIDEToReview      = (id: string) => c().call<IndicatorDefinition>(`${WS}.sendToReview`,       { id });
export const sendIDEToDraft       = (id: string) => c().call<IndicatorDefinition>(`${WS}.sendToDraft`,        { id });

// ─── Versions ─────────────────────────────────────────────────────────────────

export const listIDEVersions      = (indicatorId: string) => c().call<IndicatorVersion[]>(`${WS}.listVersions`, { indicatorId });
export const duplicateIDEVersion  = (versionId: string) => c().call<IndicatorDefinition>(`${WS}.duplicateVersion`, { versionId });

// ─── Variable resolution ──────────────────────────────────────────────────────

export const resolveIDEVariables  = (formulaId: string) => c().call<IDEVariable[]>(`${WS}.resolveVariables`, { formulaId });

// ─── Duplicate detection ──────────────────────────────────────────────────────

export const detectIDEDuplicates  = (params: { codigo?: string; nombre?: string; excludeId?: string }) =>
  c().call<IDEDuplicate[]>(`${WS}.detectDuplicates`, p(params));

// ─── Import engine ────────────────────────────────────────────────────────────

export const prepareIDEImport     = (params: IDEPrepareImportParams) =>
  c().call<IDEImportResult>(`${WS}.prepareImport`, p(params));
export const getIDEMappingTemplate = () =>
  c().call<IDEMappingTemplate>(`${WS}.getMappingTemplate`, {});
