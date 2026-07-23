"use client";

import { useState } from "react";
import { useISPSessions, useCloseISPSession, useCloseAllISPSessions } from "@/hooks/useISP";
import type { ISPSessionStatus } from "@/types/isp";

const STATUS_BADGE: Record<ISPSessionStatus, string> = {
  activa:   "bg-green-100 text-green-700",
  expirada: "bg-gray-100 text-gray-500",
  cerrada:  "bg-sse-border text-sse-muted",
  invalida: "bg-red-100 text-red-600",
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

function fmtDuration(loginAt: string, expiresAt: string) {
  try {
    const diff = new Date(expiresAt).getTime() - new Date(loginAt).getTime();
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  } catch {
    return "—";
  }
}

export function ISPSessions({ wsId }: { wsId: string }) {
  void wsId;
  const [statusFilter, setStatusFilter] = useState<ISPSessionStatus | "">("");
  const [userFilter, setUserFilter]     = useState("");
  const [closeTarget, setCloseTarget]   = useState<string | null>(null);

  const params = { status: statusFilter || undefined, userId: userFilter || undefined };
  const { data: sessions = [], isLoading } = useISPSessions(params);
  const closeSession    = useCloseISPSession();
  const closeAllForUser = useCloseAllISPSessions();

  const filtered = userFilter
    ? sessions.filter((s) =>
        (s.userEmail || "").toLowerCase().includes(userFilter.toLowerCase()) ||
        s.userId.toLowerCase().includes(userFilter.toLowerCase())
      )
    : sessions;

  const activeSessions = filtered.filter((s) => s.status === "activa");
  const byUser = Object.entries(
    activeSessions.reduce<Record<string, number>>((acc, s) => {
      acc[s.userEmail || s.userId] = (acc[s.userEmail || s.userId] || 0) + 1;
      return acc;
    }, {})
  ).filter(([, count]) => count > 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="Filtrar por usuario o email…"
          className="flex-1 min-w-[180px] text-[12px] rounded-md border border-sse-border px-3 py-1.5 bg-sse-surface text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ISPSessionStatus | "")}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
        >
          <option value="">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="expirada">Expirada</option>
          <option value="cerrada">Cerrada</option>
          <option value="invalida">Inválida</option>
        </select>
      </div>

      {byUser.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 space-y-1.5">
          <p className="text-[11px] font-semibold text-amber-700">Usuarios con múltiples sesiones activas</p>
          {byUser.map(([email, count]) => (
            <div key={email} className="flex items-center justify-between text-[11px]">
              <span className="text-sse-ink">{email} — <span className="font-semibold text-amber-700">{count} sesiones</span></span>
              <button
                onClick={() => {
                  const session = activeSessions.find((s) => (s.userEmail || s.userId) === email);
                  if (session) closeAllForUser.mutate(session.userId);
                }}
                disabled={closeAllForUser.isPending}
                className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
              >
                Cerrar todas
              </button>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-sse-border" />)}
        </div>
      )}
      {!isLoading && filtered.length === 0 && (
        <p className="text-center text-[13px] text-sse-muted py-8">No hay sesiones</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-sse-border text-left text-[10px] uppercase tracking-wide text-sse-muted">
              <th className="pb-2 pr-4">Usuario</th>
              <th className="pb-2 pr-4">Estado</th>
              <th className="pb-2 pr-4">Inicio</th>
              <th className="pb-2 pr-4">Última actividad</th>
              <th className="pb-2 pr-4">Expira</th>
              <th className="pb-2 pr-4">Duración</th>
              <th className="pb-2 pr-4">IP</th>
              <th className="pb-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sse-border">
            {filtered.map((s) => (
              <tr key={s.id} className={`hover:bg-sse-border/20 ${closeTarget === s.id ? "opacity-50" : ""}`}>
                <td className="py-2 pr-4">
                  <p className="font-medium text-sse-ink">{s.userEmail || s.userId}</p>
                  <p className="text-[10px] text-sse-muted font-mono">{s.id.slice(0, 8)}…</p>
                </td>
                <td className="py-2 pr-4">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[s.status]}`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-2 pr-4 text-sse-muted whitespace-nowrap">{fmtDate(s.loginAt)}</td>
                <td className="py-2 pr-4 text-sse-muted whitespace-nowrap">{fmtDate(s.lastActivity)}</td>
                <td className="py-2 pr-4 text-sse-muted whitespace-nowrap">{fmtDate(s.expiresAt)}</td>
                <td className="py-2 pr-4 text-sse-muted">{fmtDuration(s.loginAt, s.expiresAt)}</td>
                <td className="py-2 pr-4 font-mono text-[10px] text-sse-muted">{s.ipAddress || "—"}</td>
                <td className="py-2">
                  {s.status === "activa" && (
                    <button
                      onClick={() => {
                        setCloseTarget(s.id);
                        closeSession.mutate(s.id, { onSettled: () => setCloseTarget(null) });
                      }}
                      disabled={closeSession.isPending && closeTarget === s.id}
                      className="text-[11px] text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Cerrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
