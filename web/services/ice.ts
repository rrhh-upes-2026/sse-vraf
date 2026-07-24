import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  ICEPeriod, ICECaptura, ICECaptureVariable, ICEApproval, ICEAuditRecord,
  ICECalculationResult, ICECaptureContext, ICEMyIndicatorItem,
  ICECreatePeriodParams, ICEUpdatePeriodParams,
  ICECreateCapturaParams, ICESaveCaptureVarsParams,
  ICEApproveParams, ICERejectParams, ICEReopenParams,
  ICEListPeriodsParams, ICEListCapturasParams,
} from "@/types/ice";

const WS = "ice";
const c = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

// ─── Periods ─────────────────────────────────────────────────────────────────

export const listICEPeriods   = (params?: ICEListPeriodsParams) => c().call<ICEPeriod[]>(`${WS}.listPeriods`,  p(params));
export const getICEPeriod     = (id: string) => c().call<ICEPeriod>(`${WS}.getPeriod`,   { id });
export const createICEPeriod  = (params: ICECreatePeriodParams) => c().call<ICEPeriod>(`${WS}.createPeriod`, p(params));
export const updateICEPeriod  = (params: ICEUpdatePeriodParams) => c().call<ICEPeriod>(`${WS}.updatePeriod`, p(params));
export const openICEPeriod    = (id: string) => c().call<ICEPeriod>(`${WS}.openPeriod`,   { id });
export const reviewICEPeriod  = (id: string) => c().call<ICEPeriod>(`${WS}.reviewPeriod`, { id });
export const closeICEPeriod   = (id: string) => c().call<ICEPeriod>(`${WS}.closePeriod`,  { id });
export const lockICEPeriod    = (id: string) => c().call<ICEPeriod>(`${WS}.lockPeriod`,   { id });

// ─── Captures ─────────────────────────────────────────────────────────────────

export const listICECapturas   = (params?: ICEListCapturasParams) => c().call<ICECaptura[]>(`${WS}.listCapturas`,  p(params));
export const getICECaptura     = (id: string) => c().call<ICECaptura>(`${WS}.getCaptura`,  { id });
export const createICECaptura  = (params: ICECreateCapturaParams) => c().call<ICECaptura>(`${WS}.createCaptura`, p(params));
export const updateICECaptura  = (params: { id: string; comments?: string }) => c().call<ICECaptura>(`${WS}.updateCaptura`, p(params));
export const deleteICECaptura  = (id: string) => c().call<{ deleted: boolean; id: string }>(`${WS}.deleteCaptura`, { id });
export const calculateICECaptura = (params: { captureId: string }) => c().call<ICECaptura & { calculation: ICECalculationResult }>(`${WS}.calculateCaptura`, p(params));
export const submitICECaptura  = (id: string) => c().call<ICECaptura>(`${WS}.submitCaptura`, { id });

// ─── Variables ───────────────────────────────────────────────────────────────

export const listICECaptureVars = (captureId: string) => c().call<ICECaptureVariable[]>(`${WS}.listCaptureVars`, { captureId });
export const saveICECaptureVars = (params: ICESaveCaptureVarsParams) => c().call<ICECaptureVariable[]>(`${WS}.saveCaptureVars`, p(params));

// ─── Approvals ────────────────────────────────────────────────────────────────

export const listICEApprovals  = (captureId: string) => c().call<ICEApproval[]>(`${WS}.listApprovals`, { captureId });
export const approveICECaptura = (params: ICEApproveParams) => c().call<ICECaptura>(`${WS}.approve`, p(params));
export const rejectICECaptura  = (params: ICERejectParams)  => c().call<ICECaptura>(`${WS}.reject`,  p(params));
export const reopenICECaptura  = (params: ICEReopenParams)  => c().call<ICECaptura>(`${WS}.reopen`,  p(params));

// ─── Evidence ────────────────────────────────────────────────────────────────

export const listICEEvidenceRefs = (captureId: string) => c().call<string[]>(`${WS}.listEvidenceRefs`, { captureId });
export const linkICEEvidence     = (captureId: string, evidenceId: string) => c().call<string[]>(`${WS}.linkEvidence`,   { captureId, evidenceId });
export const unlinkICEEvidence   = (captureId: string, evidenceId: string) => c().call<string[]>(`${WS}.unlinkEvidence`, { captureId, evidenceId });

// ─── Audit ────────────────────────────────────────────────────────────────────

export const listICEAudit = (params?: { entityId?: string }) => c().call<ICEAuditRecord[]>(`${WS}.listAudit`, p(params));

// ─── Composite ───────────────────────────────────────────────────────────────

export const getICEMyIndicators   = (params?: { userId?: string }) => c().call<ICEMyIndicatorItem[]>(`${WS}.getMyIndicators`,   p(params));
export const getICECaptureContext = (indicatorId: string, periodId: string) => c().call<ICECaptureContext>(`${WS}.getCaptureContext`, { indicatorId, periodId });
