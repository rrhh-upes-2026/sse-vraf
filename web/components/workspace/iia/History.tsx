"use client";

import { useState } from "react";
import { useIIAHistory, useClearIIAHistory } from "@/hooks/useIIA";
import type { IIAGetHistoryParams } from "@/types/iia";

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

function fmtMs(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function IIAHistory({ wsId }: { wsId: string }) {
  void wsId;
  const [status, setStatus]       = useState<"" | "success" | "error">("");
  const [limit, setLimit]         = useState(50);
  const [clearing, setClearing]   = useState(false);

  const params: IIAGetHistoryParams = {
    limit,
    status: status || undefined,
  };

  const { data: history, isLoading } = useIIAHistory(params);
  const clearHistory = useClearIIAHistory();

  async function handleClear() {
    if (!window.confirm("¿Limpiar todo el historial de auditoría? Esta acción es irreversible.")) return;
    setClearing(true);
    await clearHistory.mutateAsync();
    setClearing(false);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | "success" | "error")}
            className="text-[12px] border border-sse-border rounded px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="success">Solo exitosos</option>
            <option value="error">Solo errores</option>
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="text-[12px] border border-sse-border rounded px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none"
          >
            <option value={25}>25 registros</option>
            <option value={50}>50 registros</option>
            <option value={100}>100 registros</option>
          </select>
        </div>
        <button
          onClick={() => void handleClear()}
          disabled={clearHistory.isPending || clearing}
          className="text-[12px] px-4 py-1.5 rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {clearHistory.isPending ? "Limpiando…" : "Limpiar historial"}
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 rounded bg-sse-border" />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sse-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-sse-border bg-sse-surface">
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Timestamp</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Usuario</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Acción</th>
                <th className="text-right px-3 py-2 text-sse-muted font-medium">Tokens↑</th>
                <th className="text-right px-3 py-2 text-sse-muted font-medium">Tokens↓</th>
                <th className="text-right px-3 py-2 text-sse-muted font-medium">Latencia</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Modelo</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(history ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-sse-muted py-8">No hay registros.</td>
                </tr>
              )}
              {(history ?? []).map((r) => (
                <tr key={r.id} className="border-b border-sse-border hover:bg-sse-surface/50 group">
                  <td className="px-3 py-2 text-sse-muted font-mono whitespace-nowrap">{fmtDate(r.timestamp)}</td>
                  <td className="px-3 py-2 text-sse-ink font-mono truncate max-w-[100px]">{r.userId}</td>
                  <td className="px-3 py-2 text-sse-ink">{r.action}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-sse-ink">{r.tokensIn.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-sse-ink">{r.tokensOut.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-sse-muted">{fmtMs(r.latencyMs)}</td>
                  <td className="px-3 py-2 text-sse-muted font-mono text-[10px]">{r.model}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      r.status === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {r.status === "success" ? "OK" : "Error"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Error detail (expandable on hover — kept simple) */}
      {(history ?? []).filter((r) => r.status === "error" && r.errorMessage).slice(0, 3).map((r) => (
        <div key={r.id} className="rounded border border-red-200 bg-red-50/40 px-3 py-2 text-[10px] text-red-700 font-mono">
          [{fmtDate(r.timestamp)}] {r.errorMessage}
        </div>
      ))}
    </div>
  );
}
