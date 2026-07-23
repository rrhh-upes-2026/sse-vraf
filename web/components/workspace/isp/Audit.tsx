"use client";

import { useState } from "react";
import { useISPAuditLogs } from "@/hooks/useISP";
import type { ISPAuditResult, ISPAuditAction, ISPAuditParams } from "@/types/isp";

const RESULT_COLOR: Record<ISPAuditResult, string> = {
  exitoso:  "bg-green-100 text-green-700",
  fallido:  "bg-red-100 text-red-700",
  denegado: "bg-amber-100 text-amber-700",
};

const ACTION_LABELS: Record<ISPAuditAction, string> = {
  login:              "Inicio de sesión",
  logout:             "Cierre de sesión",
  login_failed:       "Intento fallido",
  access_denied:      "Acceso denegado",
  permission_changed: "Permisos modificados",
  role_changed:       "Rol cambiado",
  user_created:       "Usuario creado",
  user_updated:       "Usuario actualizado",
  user_locked:        "Usuario bloqueado",
  user_unlocked:      "Usuario desbloqueado",
  session_expired:    "Sesión expirada",
  session_closed:     "Sesión cerrada",
  role_created:       "Rol creado",
  role_updated:       "Rol actualizado",
  role_deleted:       "Rol eliminado",
  permission_created: "Permiso creado",
  config_changed:     "Configuración modificada",
};

const MODULES = ["ime","pme","ape","aee","eme","cpe","eip","iie","ioe","aue","nce","isp","system"];

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

export function ISPAudit({ wsId }: { wsId: string }) {
  void wsId;
  const [resultFilter, setResultFilter] = useState<ISPAuditResult | "">("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter]     = useState("");
  const [expanded, setExpanded]         = useState<string | null>(null);

  const params: ISPAuditParams = {
    result: resultFilter || undefined,
    module: moduleFilter || undefined,
    action: (actionFilter || undefined) as ISPAuditAction | undefined,
    userId: userFilter   || undefined,
  };
  const { data: logs = [], isLoading } = useISPAuditLogs(params);

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="Filtrar por email o usuario…"
          className="flex-1 min-w-[180px] text-[12px] rounded-md border border-sse-border px-3 py-1.5 bg-sse-surface text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value as ISPAuditResult | "")}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
        >
          <option value="">Todos los resultados</option>
          <option value="exitoso">Exitoso</option>
          <option value="fallido">Fallido</option>
          <option value="denegado">Denegado</option>
        </select>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
        >
          <option value="">Todos los módulos</option>
          {MODULES.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
        >
          <option value="">Todas las acciones</option>
          {(Object.keys(ACTION_LABELS) as ISPAuditAction[]).map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-sse-muted">
        <span className="rounded-full w-2 h-2 bg-sse-border inline-block" />
        Los registros de auditoría son inmutables — solo lectura
        <span className="ml-auto font-mono">{logs.length} registros</span>
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-1.5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 rounded bg-sse-border" />)}
        </div>
      )}
      {!isLoading && logs.length === 0 && (
        <p className="text-center text-[13px] text-sse-muted py-8">No hay registros de auditoría</p>
      )}

      <div className="space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="rounded border border-sse-border bg-sse-surface overflow-hidden">
            <button
              onClick={() => toggle(log.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-sse-border/20"
            >
              <span className={`shrink-0 text-[10px] rounded-full px-2 py-0.5 font-medium ${RESULT_COLOR[log.result]}`}>
                {log.result}
              </span>
              <span className="flex-1 min-w-0">
                <span className="text-[12px] font-medium text-sse-ink">
                  {ACTION_LABELS[log.action as ISPAuditAction] ?? log.action}
                </span>
                <span className="ml-2 text-[10px] text-sse-muted bg-sse-border rounded px-1.5 py-0.5">{log.module}</span>
              </span>
              <span className="shrink-0 text-[11px] text-sse-muted">{log.userEmail || log.userId}</span>
              <span className="shrink-0 text-[10px] text-sse-muted">{fmtDate(log.timestamp)}</span>
              <span className="text-sse-muted text-[10px]">{expanded === log.id ? "▲" : "▼"}</span>
            </button>

            {expanded === log.id && (
              <div className="border-t border-sse-border px-4 py-3 bg-sse-border/10">
                <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-[11px]">
                  <div>
                    <dt className="text-sse-muted">ID Registro</dt>
                    <dd className="font-mono text-sse-ink">{log.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sse-muted">Usuario</dt>
                    <dd className="text-sse-ink">{log.userEmail || log.userId}</dd>
                  </div>
                  <div>
                    <dt className="text-sse-muted">IP</dt>
                    <dd className="font-mono text-sse-ink">{log.ipAddress || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sse-muted">Módulo</dt>
                    <dd className="text-sse-ink">{log.module}</dd>
                  </div>
                  <div>
                    <dt className="text-sse-muted">Entidad</dt>
                    <dd className="text-sse-ink">{log.entity || "—"}{log.entityId ? ` (${log.entityId})` : ""}</dd>
                  </div>
                  <div>
                    <dt className="text-sse-muted">Fecha</dt>
                    <dd className="text-sse-ink">{fmtDate(log.timestamp)}</dd>
                  </div>
                </dl>
                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] text-sse-muted mb-1">Detalles</p>
                    <pre className="text-[10px] bg-sse-surface rounded border border-sse-border p-2 overflow-x-auto text-sse-ink">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
