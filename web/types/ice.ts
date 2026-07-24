// ICE — Indicator Capture Engine

import type { FMIRangeLevel, FMIFormula, FMIRangeConfig } from "./fmi";
import type { IndicatorDefinition } from "./ide";

// ─── Periods ────────────────────────────────────────────────────────────────

export type ICEPeriodEstado = "borrador" | "abierto" | "en_revision" | "cerrado" | "bloqueado";
export type ICEPeriodTipo   = "mensual" | "trimestral" | "semestral" | "anual";

export interface ICEPeriod {
  id:          string;
  nombre:      string;
  tipo?:       ICEPeriodTipo;
  inicio:      string;
  fin:         string;
  descripcion?: string;
  estado:      ICEPeriodEstado;
  activo?:     boolean;
  createdBy?:  string;
  createdAt?:  string;
  updatedAt?:  string;
}

// ─── Captures ────────────────────────────────────────────────────────────────

export type ICECapturaStatus =
  | "borrador"
  | "enviada"
  | "en_revision"
  | "aprobada"
  | "rechazada"
  | "cerrada";

export interface ICECaptura {
  id:              string;
  indicatorId:     string;
  periodId:        string;
  responsibleId?:  string;
  captureDate?:    string;
  resultado:       number | null;
  meta:            number | null;
  cumplimiento:    number | null;
  rangeLevel:      FMIRangeLevel | null;
  status:          ICECapturaStatus;
  comments?:       string;
  evidenceRefs?:   string;
  createdBy?:      string;
  updatedBy?:      string;
  createdAt?:      string;
  updatedAt?:      string;
}

// ─── Variables ───────────────────────────────────────────────────────────────

export interface ICECaptureVariable {
  id?:           string;
  captureId:     string;
  variableId:    string;
  variableName?: string;
  value:         number;
  rawInput?:     string;
  createdAt?:    string;
}

// ─── Approvals ───────────────────────────────────────────────────────────────

export type ICEApprovalDecision = "pendiente" | "aprobada" | "rechazada" | "anulada";

export interface ICEApproval {
  id:            string;
  captureId:     string;
  level:         number;
  approverEmail?: string;
  approverRol?:  string;
  decision:      ICEApprovalDecision;
  comments?:     string;
  createdAt?:    string;
}

// ─── Locks ───────────────────────────────────────────────────────────────────

export interface ICELock {
  id:        string;
  periodId:  string;
  captureId: string;
  lockedAt:  string;
  lockedBy:  string;
  reason:    string;
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────

export interface ICEAuditRecord {
  id?:         string;
  entityType?: string;
  entityId?:   string;
  action?:     string;
  actorId?:    string;
  actorEmail?: string;
  detail?:     string;
  before?:     string;
  after?:      string;
  createdAt?:  string;
}

// ─── Calculation result ───────────────────────────────────────────────────────

export interface ICECalculationResult {
  resultado:      number;
  meta:           number;
  cumplimiento:   number | null;
  rangeLevel:     FMIRangeLevel | null;
  formula?:       string;
  formulaVersion: number;
  indicatorId:    string;
  valuesUsed?:    Record<string, number>;
}

// ─── Capture context (for wizard) ────────────────────────────────────────────

export interface ICECaptureContext {
  indicator:          IndicatorDefinition;
  period:             ICEPeriod;
  formula:            FMIFormula | null;
  rangeConfig:        FMIRangeConfig | null;
  existingCaptura:    ICECaptura | null;
  existingVariables?: ICECaptureVariable[];
}

// ─── My indicators item ───────────────────────────────────────────────────────

export interface ICEMyIndicatorItem {
  indicator:    IndicatorDefinition;
  captura:      ICECaptura | null;
  activePeriod: ICEPeriod | null;
}

// ─── Mutation params ─────────────────────────────────────────────────────────

export interface ICECreatePeriodParams {
  nombre:       string;
  tipo?:        ICEPeriodTipo;
  inicio:       string;
  fin:          string;
  descripcion?: string;
}

export interface ICEUpdatePeriodParams extends Partial<ICECreatePeriodParams> {
  id: string;
}

export interface ICECreateCapturaParams {
  indicatorId:    string;
  periodId:       string;
  responsibleId?: string;
  comments?:      string;
}

export interface ICESaveCaptureVarsParams {
  captureId:  string;
  variables:  Array<{
    variableId:    string;
    variableName?: string;
    value:         number;
    rawInput?:     string;
  }>;
}

export interface ICEApproveParams {
  captureId:  string;
  comments?:  string;
}

export interface ICERejectParams {
  captureId: string;
  reason:    string;
}

export interface ICEReopenParams {
  captureId: string;
  reason?:   string;
}

export interface ICEListPeriodsParams {
  estado?: ICEPeriodEstado;
  activo?: boolean;
}

export interface ICEListCapturasParams {
  periodId?:      string;
  indicatorId?:   string;
  responsibleId?: string;
  status?:        ICECapturaStatus;
}
