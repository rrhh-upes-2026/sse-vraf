"use client";

import { useState } from "react";
import Link from "next/link";
import { useICECapturas } from "@/hooks/useICE";
import type { ICEListCapturasParams } from "@/types/ice";

const STATUS_OPTIONS = [
  { value: "",            label: "Todos" },
  { value: "borrador",    label: "Borrador" },
  { value: "enviada",     label: "Enviada" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobada",    label: "Aprobada" },
  { value: "rechazada",   label: "Rechazada" },
  { value: "cerrada",     label: "Cerrada" },
];

const STATUS_COLOR: Record<string, string> = {
  borrador:    "bg-sse-border/40 text-sse-muted",
  enviada:     "bg-amber-100 text-amber-700",
  en_revision: "bg-blue-100 text-blue-700",
  aprobada:    "bg-green-100 text-green-700",
  rechazada:   "bg-red-100 text-red-700",
  cerrada:     "bg-sse-border/40 text-sse-muted",
};

export function CaptureHistory({ wsId }: { wsId: string }) {
  const [filters, setFilters] = useState<ICEListCapturasParams>({});
  const [query, setQuery]     = useState("");

  const { data: captures, isLoading } = useICECapturas(
    Object.keys(filters).length ? filters : undefined
  );

  const visible = captures?.filter(c => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.indicatorId.toLowerCase().includes(q) ||
      c.periodId.toLowerCase().includes(q) ||
      c.responsibleId?.toLowerCase().includes(q)
    );
  }) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por indicador, período…"
          className="flex-1 min-w-[180px] text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <select
          value={filters.status ?? ""}
          onChange={e => setFilters(f => ({ ...f, status: (e.target.value as ICEListCapturasParams["status"]) || undefined }))}
          className="text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-lg border border-sse-border bg-sse-surface animate-pulse" />)}
        </div>
      ) : !visible.length ? (
        <div className="rounded-xl border border-sse-border bg-sse-surface p-8 text-center">
          <p className="text-[13px] text-sse-muted">No se encontraron capturas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sse-border">
          <table className="w-full text-[12px]">
            <thead className="bg-sse-surface border-b border-sse-border">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">Indicador</th>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">Período</th>
                <th className="text-right px-3 py-2 font-semibold text-sse-muted text-[11px] tabular-nums">Resultado</th>
                <th className="text-right px-3 py-2 font-semibold text-sse-muted text-[11px] tabular-nums">%</th>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">Estado</th>
                <th className="text-left px-3 py-2 font-semibold text-sse-muted text-[11px]">Nivel</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-sse-border bg-white">
              {visible.map(c => (
                <tr key={c.id} className="hover:bg-sse-surface/60 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-sse-ink truncate max-w-[160px]">{c.indicatorId}</p>
                  </td>
                  <td className="px-3 py-2.5 text-sse-muted">{c.periodId}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-sse-ink">
                    {c.resultado !== null && c.resultado !== undefined ? c.resultado : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {c.cumplimiento !== null && c.cumplimiento !== undefined ? (
                      <span className={c.cumplimiento >= 100 ? "text-green-700 font-medium" : c.cumplimiento >= 80 ? "text-amber-700" : "text-red-700"}>
                        {c.cumplimiento}%
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${STATUS_COLOR[c.status] ?? ""}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sse-muted">{c.rangeLevel ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <Link href={`/ws/${wsId}/ice-historial?captureId=${c.id}`}
                      className="text-[11px] text-sky-600 hover:underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visible.length > 0 && (
        <p className="text-[11px] text-sse-muted text-right">{visible.length} captura{visible.length !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
}
