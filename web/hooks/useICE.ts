"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listICEPeriods, getICEPeriod, createICEPeriod, updateICEPeriod,
  openICEPeriod, reviewICEPeriod, closeICEPeriod, lockICEPeriod,
  listICECapturas, getICECaptura, createICECaptura, updateICECaptura,
  deleteICECaptura, calculateICECaptura, submitICECaptura,
  listICECaptureVars, saveICECaptureVars,
  listICEApprovals, approveICECaptura, rejectICECaptura, reopenICECaptura,
  listICEEvidenceRefs, linkICEEvidence, unlinkICEEvidence,
  listICEAudit, getICEMyIndicators, getICECaptureContext,
} from "@/services/ice";
import type {
  ICECreatePeriodParams, ICEUpdatePeriodParams,
  ICECreateCapturaParams, ICESaveCaptureVarsParams,
  ICEApproveParams, ICERejectParams, ICEReopenParams,
  ICEListPeriodsParams, ICEListCapturasParams,
} from "@/types/ice";

const K = {
  periods:   (p?: ICEListPeriodsParams) => ["ice", "periods",   p] as const,
  period:    (id: string)               => ["ice", "period",    id] as const,
  capturas:  (p?: ICEListCapturasParams)=> ["ice", "capturas",  p] as const,
  captura:   (id: string)               => ["ice", "captura",   id] as const,
  capVars:   (id: string)               => ["ice", "capVars",   id] as const,
  approvals: (id: string)               => ["ice", "approvals", id] as const,
  evidRefs:  (id: string)               => ["ice", "evidRefs",  id] as const,
  audit:     (eid?: string)             => ["ice", "audit",     eid] as const,
  myInds:    (uid?: string)             => ["ice", "myInds",    uid] as const,
  context:   (iid: string, pid: string) => ["ice", "context",   iid, pid] as const,
};

// ─── Periods ─────────────────────────────────────────────────────────────────

export function useICEPeriods(params?: ICEListPeriodsParams) {
  return useQuery({ queryKey: K.periods(params), queryFn: () => listICEPeriods(params) });
}
export function useICEPeriod(id: string) {
  return useQuery({ queryKey: K.period(id), queryFn: () => getICEPeriod(id), enabled: !!id });
}
export function useCreateICEPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ICECreatePeriodParams) => createICEPeriod(params),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice", "periods"] }),
  });
}
export function useUpdateICEPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ICEUpdatePeriodParams) => updateICEPeriod(params),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice", "periods"] }),
  });
}
export function useOpenICEPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => openICEPeriod(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice", "periods"] }),
  });
}
export function useReviewICEPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewICEPeriod(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice", "periods"] }),
  });
}
export function useCloseICEPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => closeICEPeriod(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice"] }),
  });
}
export function useLockICEPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lockICEPeriod(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice"] }),
  });
}

// ─── Captures ─────────────────────────────────────────────────────────────────

export function useICECapturas(params?: ICEListCapturasParams) {
  return useQuery({ queryKey: K.capturas(params), queryFn: () => listICECapturas(params) });
}
export function useICECaptura(id: string) {
  return useQuery({ queryKey: K.captura(id), queryFn: () => getICECaptura(id), enabled: !!id });
}
export function useCreateICECaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ICECreateCapturaParams) => createICECaptura(params),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice", "capturas"] }),
  });
}
export function useUpdateICECaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; comments?: string }) => updateICECaptura(params),
    onSuccess: (_, v) => void qc.invalidateQueries({ queryKey: K.captura(v.id) }),
  });
}
export function useDeleteICECaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteICECaptura(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice", "capturas"] }),
  });
}
export function useCalculateICECaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (captureId: string) => calculateICECaptura({ captureId }),
    onSuccess: (_, id) => void qc.invalidateQueries({ queryKey: K.captura(id) }),
  });
}
export function useSubmitICECaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submitICECaptura(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice"] }),
  });
}

// ─── Variables ───────────────────────────────────────────────────────────────

export function useICECaptureVars(captureId: string) {
  return useQuery({ queryKey: K.capVars(captureId), queryFn: () => listICECaptureVars(captureId), enabled: !!captureId });
}
export function useSaveICECaptureVars() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ICESaveCaptureVarsParams) => saveICECaptureVars(params),
    onSuccess: (_, v) => void qc.invalidateQueries({ queryKey: K.capVars(v.captureId) }),
  });
}

// ─── Approvals ───────────────────────────────────────────────────────────────

export function useICEApprovals(captureId: string) {
  return useQuery({ queryKey: K.approvals(captureId), queryFn: () => listICEApprovals(captureId), enabled: !!captureId });
}
export function useApproveICECaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ICEApproveParams) => approveICECaptura(params),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice"] }),
  });
}
export function useRejectICECaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ICERejectParams) => rejectICECaptura(params),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice"] }),
  });
}
export function useReopenICECaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ICEReopenParams) => reopenICECaptura(params),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ice"] }),
  });
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export function useICEEvidenceRefs(captureId: string) {
  return useQuery({ queryKey: K.evidRefs(captureId), queryFn: () => listICEEvidenceRefs(captureId), enabled: !!captureId });
}
export function useLinkICEEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ captureId, evidenceId }: { captureId: string; evidenceId: string }) => linkICEEvidence(captureId, evidenceId),
    onSuccess: (_, v) => void qc.invalidateQueries({ queryKey: K.evidRefs(v.captureId) }),
  });
}
export function useUnlinkICEEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ captureId, evidenceId }: { captureId: string; evidenceId: string }) => unlinkICEEvidence(captureId, evidenceId),
    onSuccess: (_, v) => void qc.invalidateQueries({ queryKey: K.evidRefs(v.captureId) }),
  });
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export function useICEAudit(entityId?: string) {
  return useQuery({ queryKey: K.audit(entityId), queryFn: () => listICEAudit(entityId ? { entityId } : undefined) });
}

// ─── Composite ───────────────────────────────────────────────────────────────

export function useICEMyIndicators(userId?: string) {
  return useQuery({ queryKey: K.myInds(userId), queryFn: () => getICEMyIndicators(userId ? { userId } : undefined) });
}
export function useICECaptureContext(indicatorId: string, periodId: string) {
  return useQuery({
    queryKey: K.context(indicatorId, periodId),
    queryFn:  () => getICECaptureContext(indicatorId, periodId),
    enabled:  !!indicatorId && !!periodId,
  });
}
