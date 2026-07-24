"use client";

import { useState } from "react";
import { useICEAudit } from "@/hooks/useICE";

const ACTION_COLOR: Record<string, string> = {
  create:   "bg-green-100 text-green-700",
  update:   "bg-blue-100 text-blue-700",
  delete:   "bg-red-100 text-red-700",
  submit:   "bg-amber-100 text-amber-700",
  approve:  "bg-green-100 text-green-700",
  reject:   "bg-red-100 text-red-700",
  reopen:   "bg-violet-100 text-violet-700",
  lock:     "bg-gray-200 text-gray-700",
  close:    "bg-gray-200 text-gray-700",
  open:     "bg-sky-100 text-sky-700",
  calculate:"bg-blue-100 text-blue-700",
};

const ENTITY_LABEL: Record<string, string> = {
  ICE_Periods:          "Período",
  ICE_Capturas:         "Captura",
  ICE_CaptureVariables: "Variable",
  ICE_Approvals:        "Aprobación",
  ICE_Locks:            "Bloqueo",
};

export function AuditTrailView({ wsId }: { wsId: string }) {
  const [entityId, setEntityId] = useState("");
  const [search,   setSearch]   = useState(entityId);

  const { data: records, isLoading } = useICEAudit(entityId || undefined);

  const visible = records?.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.entityId?.toLowerCase().includes(q) ||
      r.action?.toLowerCase().includes(q) ||
      r.actorEmail?.toLowerCase().includes(q) ||
      r.entityType?.toLowerCase().includes(q)
    );
  }) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Filtrar por entidad, acción, actor…"
          className="flex-1 min-w-[200px] text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <div className="flex gap-1">
          <input
            value={entityId} onChange={e => setEntityId(e.target.value)}
            placeholder="ID de entidad específica"
            className="text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-1">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 rounded border border-sse-border bg-sse-surface animate-pulse" />)}
        </div>
      ) : !visible.length ? (
        <div className="rounded-xl border border-sse-border bg-sse-surface p-8 text-center">
          <p className="text-[13px] text-sse-muted">Sin registros de auditoría.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sse-border">
          <table className="w-full text-[12px]">
            <thead className="bg-sse-surface border-b border-sse-border">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">Fecha</th>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">Acción</th>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">Entidad</th>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">ID</th>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">Actor</th>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sse-border bg-white">
              {visible.map((r, i) => (
                <tr key={r.id ?? i} className="hover:bg-sse-surface/60 transition-colors">
                  <td className="px-3 py-2.5 text-sse-muted whitespace-nowrap">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${ACTION_COLOR[r.action?.toLowerCase() ?? ""] ?? "bg-sse-border/40 text-sse-muted"}`}>
                      {r.action}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sse-muted">
                    {ENTITY_LABEL[r.entityType ?? ""] ?? r.entityType ?? "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11px] text-sse-ink">{r.entityId ?? "—"}</span>
                  </td>
                  <td className="px-3 py-2.5 text-sse-muted">{r.actorEmail ?? r.actorId ?? "—"}</td>
                  <td className="px-3 py-2.5 text-sse-muted max-w-[200px] truncate">
                    {r.detail ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visible.length > 0 && (
        <p className="text-[11px] text-sse-muted text-right">{visible.length} registro{visible.length !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
}
