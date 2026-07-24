// IDE — Indicator Definition Engine

import type { FMIRangeLevel } from "./fmi";

export type IDEStatus = "borrador" | "en_revision" | "publicado" | "archivado";

// ─── Core entity ────────────────────────────────────────────────────────────

export interface IndicatorDefinition {
  id:            string;
  codigo:        string;
  nombre:        string;
  descripcion:   string;
  objetivoId:    string;
  dimensionId:   string;
  unitMeasureId: string;
  frequencyId:   string;
  formulaId:     string;
  polarityId:    string;
  rangeConfigId: string;
  responsibleId: string;
  unidadId:      string;
  meta:          number;
  status:        IDEStatus;
  version:       number;
  vigenciaDesde: string;
  vigenciaHasta: string;
  observaciones: string;
  dependencias:  string;
  activo:        boolean;
  createdAt:     string;
  updatedAt:     string;
  createdBy:     string;
  updatedBy:     string;
}

export interface IndicatorVersion {
  id:          string;
  indicatorId: string;
  version:     number;
  status:      IDEStatus;
  snapshot:    string;
  publishedAt: string;
  archivedAt:  string;
  createdAt:   string;
  createdBy:   string;
}

// ─── Preview & simulation ────────────────────────────────────────────────────

export interface IDEPreview {
  indicator:     IndicatorDefinition;
  objetivo:      { id: string; nombre: string; codigo: string } | null;
  dimension:     { id: string; nombre: string; codigo: string } | null;
  unitMeasure:   { id: string; nombre: string; tipo: string } | null;
  frequency:     { id: string; nombre: string; periodoDias: number } | null;
  formula:       { id: string; nombre: string; formulaVisible: string; variables: IDEVariable[] } | null;
  polarity:      { id: string; nombre: string; codigo: string } | null;
  rangeConfig:   { id: string; nombre: string; polaridad: string } | null;
  calculoEjemplo: string;
}

export interface IDEVariable {
  codigo:      string;
  nombre:      string;
  descripcion: string;
  tipo:        string;
}

export interface IDESimulationResult {
  formulaVisible:  string;
  values:          Record<string, number>;
  result:          number;
  resultFormatted: string;
  level:           FMIRangeLevel | null;
  levelLabel:      string;
  interpretation:  string;
  metaCumplida:    boolean;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface IDEValidationError {
  field:   string;
  message: string;
}

export interface IDEValidationResult {
  valid:  boolean;
  errors: IDEValidationError[];
}

// ─── Duplicate detection ─────────────────────────────────────────────────────

export interface IDEDuplicate {
  id:     string;
  codigo: string;
  nombre: string;
  status: IDEStatus;
  reason: string;
}

// ─── Import engine ───────────────────────────────────────────────────────────

export interface IDEImportRow {
  rowIndex: number;
  data:     Record<string, string>;
  mapped:   Partial<IndicatorDefinition>;
  valid:    boolean;
  errors:   IDEValidationError[];
}

export interface IDEImportResult {
  total:   number;
  valid:   number;
  invalid: number;
  rows:    IDEImportRow[];
}

export interface IDEFieldMapping {
  sourceColumn: string;
  targetField:  keyof IndicatorDefinition | "";
}

export interface IDEMappingTemplate {
  fields:       Array<{ key: keyof IndicatorDefinition; label: string; required: boolean }>;
  exampleRow:   Record<string, string>;
}

// ─── Service params ──────────────────────────────────────────────────────────

export interface IDEListParams {
  status?:      IDEStatus;
  objetivoId?:  string;
  dimensionId?: string;
  activo?:      boolean;
}

export interface IDECreateParams {
  codigo:        string;
  nombre:        string;
  descripcion?:  string;
  objetivoId?:   string;
  dimensionId?:  string;
  unitMeasureId?: string;
  frequencyId?:  string;
  formulaId?:    string;
  polarityId?:   string;
  rangeConfigId?: string;
  responsibleId?: string;
  unidadId?:     string;
  meta?:         number;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  observaciones?: string;
  dependencias?:  string;
}

export interface IDEUpdateParams extends Partial<IDECreateParams> {
  id:     string;
  status?: IDEStatus;
  activo?: boolean;
}

export interface IDESimulateParams {
  indicatorId: string;
  values:      Record<string, number>;
}

export interface IDEPrepareImportParams {
  rows:    Array<Record<string, string>>;
  mapping: IDEFieldMapping[];
}
