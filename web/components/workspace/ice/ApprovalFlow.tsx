"use client";

import { useState } from "react";
import {
  useICECapturas, useICEApprovals,
  useApproveICECaptura, useRejectICECaptura, useReopenICECaptura,
} from "@/hooks/useICE";
import type { ICECaptura, ICEApproval } from "@/types/ice";

const LEVEL_LABEL: Record<number, string> = {
  1: "Jefatura",
  2: "Vicerrectoría",
  3: "Cierre",
};

function ApprovalTimeline({ captureId }: { captureId: string }) {
  const { data: approvals, isLoading } = useICEApprovals(captureId);

  if (isLoading) return <p className="text-[11px] text-sse-muted">Cargando historial…</p>;
  if (!approvals?.length) return <p className="text-[11px] text-sse-muted">Sin aprobaciones registradas.</p>;

  return (
    <div className="space-y-2">
      {approvals.map((a, i) => (
        <div key={a.id} className="flex gap-2 text-[11px]">
          <div className="flex flex-col items-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
              ${a.decision === "aprobada" ? "bg-green-100 text-green-700" : a.decision === "rechazada" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
              {a.decision === "aprobada" ? "✓" : a.decision === "rechazada" ? "✕" : "○"}
            </div>
            {i < approvals.length - 1 && <div className="w-px flex-1 bg-sse-border mt-1" />}
          </div>
          <div className="pb-3">
            <p className="font-medium text-sse-ink">{LEVEL_LABEL[a.level] ?? `Nivel ${a.level}`}</p>
            <p className="text-sse-muted">{a.approverEmail} · {a.createdAt ? new Date(a.createdAt).toLocaleDateString("es-SV") : "—"}</p>
            {a.comments && <p className="text-sse-muted italic mt-0.5">"{a.comments}"</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function CaptureApprovalCard({ capture, wsId }: { capture: ICECaptura; wsId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState("");
  const [action, setAction]     = useState<"approve" | "reject" | null>(null);

  const approve = useApproveICECaptura();
  const reject  = useRejectICECaptura();
  const reopen  = useReopenICECaptura();

  const handleApprove = async () => {
    await approve.mutateAsync({ captureId: capture.id, comments });
    setAction(null); setComments("");
  };
  const handleReject = async () => {
    await reject.mutateAsync({ captureId: capture.id, reason: comments || "Sin motivo especificado" });
    setAction(null); setComments("");
  };
  const handleReopen = async () => {
    await reopen.mutateAsync({ captureId: capture.id, reason: "Reabierta para corrección" });
  };

  const statusColor: Record<string, string> = {
    enviada:     "bg-amber-100 text-amber-700",
    en_revision: "bg-blue-100 text-blue-700",
    aprobada:    "bg-green-100 text-green-700",
    rechazada:   "bg-red-100 text-red-700",
  };

  const isPending = capture.status === "enviada" || capture.status === "en_revision";

  return (
    <div className="rounded-lg border border-sse-border bg-white">
      <button className="w-full text-left p-4 flex items-start gap-3" onClick={() => setExpanded(e => !e)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[12px] font-semibold text-sse-ink truncate">{capture.indicatorId}</p>
            <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${statusColor[capture.status] ?? "bg-sse-border/40 text-sse-muted"}`}>
              {capture.status}
            </span>
          </div>
          <p className="text-[11px] text-sse-muted mt-0.5">
            Período: {capture.periodId} ·
            Resultado: <span className="tabular-nums font-medium">{capture.resultado ?? "—"}</span>
            {capture.cumplimiento !== null && capture.cumplimiento !== undefined && (
              <> · Cumplimiento: <span className="tabular-nums font-medium">{capture.cumplimiento}%</span></>
            )}
          </p>
          {capture.rangeLevel && (
            <p className="text-[11px] text-sse-muted">Nivel: <span className="font-medium">{capture.rangeLevel}</span></p>
          )}
        </div>
        <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-sse-muted shrink-0 transition-transform mt-0.5 ${expanded ? "rotate-180" : ""}`}>
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-sse-border px-4 py-3 space-y-4">
          <ApprovalTimeline captureId={capture.id} />

          {isPending && !action && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setAction("approve")}
                className="text-[11px] px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium">
                Aprobar
              </button>
              <button onClick={() => setAction("reject")}
                className="text-[11px] px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-medium">
                Rechazar
              </button>
            </div>
          )}

          {capture.status === "aprobada" && (
            <button onClick={handleReopen}
              className="text-[11px] px-3 py-1.5 rounded-md border border-sse-border text-sse-muted hover:bg-sse-surface">
              Reabrir captura
            </button>
          )}

          {action && (
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-sse-muted block">
                {action === "approve" ? "Comentarios (opcional)" : "Motivo del rechazo *"}
              </label>
              <textarea value={comments} onChange={e => setComments(e.target.value)} rows={2}
                placeholder={action === "approve" ? "Observaciones…" : "Indique el motivo…"}
                className="w-full text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={action === "approve" ? handleApprove : handleReject}
                  disabled={approve.isPending || reject.isPending}
                  className={`text-[11px] px-3 py-1.5 rounded-md font-medium disabled:opacity-60
                    ${action === "approve" ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"}`}>
                  {approve.isPending || reject.isPending ? "Procesando…" : action === "approve" ? "Confirmar aprobación" : "Confirmar rechazo"}
                </button>
                <button onClick={() => { setAction(null); setComments(""); }}
                  className="text-[11px] px-3 py-1.5 rounded-md border border-sse-border text-sse-muted hover:bg-sse-surface">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ApprovalFlow({ wsId }: { wsId: string }) {
  const { data: enviadas,    isLoading: l1 } = useICECapturas({ status: "enviada" });
  const { data: en_revision, isLoading: l2 } = useICECapturas({ status: "en_revision" });
  const { data: aprobadas,   isLoading: l3 } = useICECapturas({ status: "aprobada" });
  const { data: rechazadas,  isLoading: l4 } = useICECapturas({ status: "rechazada" });

  const isLoading = l1 || l2 || l3 || l4;

  if (isLoading) {
    return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg border border-sse-border bg-sse-surface animate-pulse" />)}</div>;
  }

  const pending = [...(enviadas ?? []), ...(en_revision ?? [])];
  const resolved = [...(aprobadas ?? []), ...(rechazadas ?? [])];

  return (
    <div className="space-y-6">
      {pending.length > 0 ? (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-2">
            Pendientes de revisión ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map(c => <CaptureApprovalCard key={c.id} capture={c} wsId={wsId} />)}
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-[13px] font-semibold text-green-800">Sin capturas pendientes</p>
          <p className="text-[11px] text-green-700 mt-1">No hay capturas esperando aprobación.</p>
        </div>
      )}

      {resolved.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-2">
            Resueltas recientes ({resolved.length})
          </h3>
          <div className="space-y-2">
            {resolved.slice(0, 10).map(c => <CaptureApprovalCard key={c.id} capture={c} wsId={wsId} />)}
          </div>
        </section>
      )}
    </div>
  );
}
