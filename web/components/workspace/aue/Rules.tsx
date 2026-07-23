"use client";

import { useState } from "react";
import { useAUERules, useUpdateAUERule, useDuplicateAUERule } from "@/hooks/useAUE";
import type { AUEEventType, AUERule } from "@/types/aue";

const PURPLE = "#7C3AED";

const EVENT_TYPE_LABELS: Record<string, string> = {
  "entity.created":      "Entidad creada",
  "entity.updated":      "Entidad actualizada",
  "status.changed":      "Estado cambiado",
  "plan.closed":         "Plan cerrado",
  "task.overdue":        "Tarea vencida",
  "evidence.added":      "Evidencia añadida",
  "recommendation.new":  "Nueva recomendación",
  "diagnosis.new":       "Nuevo diagnóstico",
  "alert.new":           "Nueva alerta",
  "plan.new":            "Nuevo plan",
  "task.new":            "Nueva tarea",
  "milestone.completed": "Hito completado",
  "rule.triggered":      "Regla activada",
  "queue.retry":         "Reintento de cola",
};

const EVENT_TYPE_OPTS: { value: AUEEventType | ""; label: string }[] = [
  { value: "", label: "Todos los tipos" },
  ...Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => ({ value: k as AUEEventType, label: v })),
];

interface Props { wsId: string }

export function AUERules({ wsId: _wsId }: Props) {
  const [filterType, setFilterType] = useState<AUEEventType | "">("");
  const [filterEnabled, setFilterEnabled] = useState<"" | "true" | "false">("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: rules = [], isLoading } = useAUERules({
    eventType: filterType || undefined,
    enabled:   filterEnabled === "" ? undefined : filterEnabled === "true",
    limit: 100,
  });

  const updateRule   = useUpdateAUERule();
  const duplicateRule = useDuplicateAUERule();

  function toggleEnabled(rule: AUERule) {
    updateRule.mutate({ id: rule.id, enabled: !rule.enabled });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as AUEEventType | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {EVENT_TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterEnabled} onChange={(e) => setFilterEnabled(e.target.value as "" | "true" | "false")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          <option value="">Todas</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{rules.length} regla{rules.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando reglas…</p>}
      {!isLoading && rules.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin reglas configuradas.</p>
        </div>
      )}

      <div className="space-y-2">
        {rules.map((rule) => {
          const open = expanded === rule.id;
          return (
            <div key={rule.id} className={`rounded-lg border bg-white overflow-hidden ${rule.enabled ? "border-sse-border" : "border-sse-border opacity-60"}`}>
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Toggle switch */}
                <button
                  onClick={() => toggleEnabled(rule)}
                  disabled={updateRule.isPending}
                  className={`relative shrink-0 h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${rule.enabled ? "" : "bg-gray-200"}`}
                  style={rule.enabled ? { backgroundColor: PURPLE } : {}}
                  aria-label={rule.enabled ? "Desactivar" : "Activar"}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>

                <button className="flex-1 flex items-start gap-3 text-left min-w-0" onClick={() => setExpanded(open ? null : rule.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span className="text-[13px] font-medium text-sse-ink">{rule.name}</span>
                      <span className="text-[9px] text-sse-muted font-mono">v{rule.version}</span>
                      <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-medium text-purple-800">p{rule.priority}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-sse-muted">
                      <span>WHEN <span className="font-medium text-sse-ink">{EVENT_TYPE_LABELS[rule.eventType] ?? rule.eventType}</span></span>
                      <span>·</span>
                      <span>{rule.conditions.length} condición{rule.conditions.length !== 1 ? "es" : ""}</span>
                      <span>·</span>
                      <span>{rule.actions.length} acción{rule.actions.length !== 1 ? "es" : ""}</span>
                      {rule.executionCount > 0 && (
                        <><span>·</span><span>{rule.executionCount} ejecuciones</span></>
                      )}
                    </div>
                  </div>
                  <svg className={`mt-1 h-4 w-4 shrink-0 text-sse-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {open && (
                <div className="border-t border-sse-border px-4 py-3 space-y-3">
                  {rule.description && (
                    <p className="text-[12px] text-sse-muted">{rule.description}</p>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* WHEN */}
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide mb-1.5" style={{ color: PURPLE }}>WHEN</p>
                      <p className="text-[11px] text-sse-ink">{EVENT_TYPE_LABELS[rule.eventType] ?? rule.eventType}</p>
                    </div>

                    {/* IF */}
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide mb-1.5 text-amber-700">IF</p>
                      {rule.conditions.length === 0 ? (
                        <p className="text-[11px] text-sse-muted">Sin condiciones (siempre aplica)</p>
                      ) : (
                        <div className="space-y-1">
                          {rule.conditions.map((c, i) => (
                            <p key={i} className="text-[11px] font-mono text-sse-ink">
                              {c.field} <span className="text-sse-muted">{c.operator}</span> {JSON.stringify(c.value)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* THEN */}
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide mb-1.5 text-emerald-700">THEN</p>
                      <div className="space-y-1">
                        {rule.actions.map((a, i) => (
                          <p key={i} className="text-[11px] font-mono text-sse-ink">{a.type}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => duplicateRule.mutate(rule.id)}
                      disabled={duplicateRule.isPending}
                      className="rounded border border-sse-border px-2.5 py-1 text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-50 transition-colors"
                    >
                      Duplicar
                    </button>
                    {rule.lastExecutedAt && (
                      <span className="self-center text-[10px] text-sse-muted">Última ejecución: {rule.lastExecutedAt.slice(0, 16).replace("T", " ")}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
