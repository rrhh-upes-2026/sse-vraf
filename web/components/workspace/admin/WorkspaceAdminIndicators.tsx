"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useKPIs, lifecycleBadge } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { WorkspaceKPI, ObjectLifecycle } from "@/types/workspace-admin";

const CATEGORIA_LABELS: Record<string, string> = {
  gestion: "Gestión",
  desempeno: "Desempeño",
  calidad: "Calidad",
  eficiencia: "Eficiencia",
  satisfaccion: "Satisfacción",
};

const SEMAFORO_COLORS = { verde: "#12A150", amarillo: "#E5A100", rojo: "#E54D4D" };

function SemaforoBar({ kpi }: { kpi: WorkspaceKPI }) {
  if (!kpi.valorActual) return <span className="text-[11px] text-sse-muted">—</span>;
  const color = SEMAFORO_COLORS[
    kpi.valorActual >= kpi.semaforo.verde.min && kpi.valorActual <= kpi.semaforo.verde.max
      ? "verde"
      : kpi.valorActual >= kpi.semaforo.amarillo.min && kpi.valorActual <= kpi.semaforo.amarillo.max
        ? "amarillo"
        : "rojo"
  ];
  const pct = Math.min(100, (kpi.valorActual / kpi.meta) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-sse-border rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] tabular-nums" style={{ color }}>
        {kpi.valorActual} / {kpi.meta} {kpi.unidadMedida}
      </span>
    </div>
  );
}

function TendenciaIcon({ tendencia }: { tendencia?: string }) {
  if (!tendencia) return null;
  const icons = {
    sube: { d: "M5 15l7-7 7 7", color: "#12A150" },
    baja: { d: "M19 9l-7 7-7-7", color: "#E54D4D" },
    estable: { d: "M5 12h14", color: "#637083" },
  };
  const icon = icons[tendencia as keyof typeof icons];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      className="w-3.5 h-3.5" style={{ color: icon.color }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icon.d} />
    </svg>
  );
}

function KPIRow({ kpi, onAction }: { kpi: WorkspaceKPI; onAction: () => void }) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("ws.indicators.manage");
  const [busy, setBusy] = useState(false);

  const handlePublish = async () => {
    if (!confirm(`¿Publicar el KPI "${kpi.nombre}"?`)) return;
    setBusy(true);
    await WorkspaceAdminService.publishKPI(kpi.id);
    setBusy(false);
    onAction();
  };

  const { label, color } = lifecycleBadge(kpi.lifecycle);

  return (
    <tr className="border-b border-sse-border last:border-0 hover:bg-sse-hover/50 transition-colors">
      <td className="py-3 px-4">
        <div>
          <p className="text-[13px] font-medium text-sse-ink">{kpi.nombre}</p>
          <p className="text-[11px] text-sse-muted mt-0.5">{kpi.id}</p>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className="text-[12px] text-sse-muted">{CATEGORIA_LABELS[kpi.categoria] ?? kpi.categoria}</span>
      </td>
      <td className="py-3 px-3">
        <code className="text-[10px] bg-sse-hover px-1.5 py-0.5 rounded text-sse-ink font-mono">
          {kpi.formula.length > 30 ? kpi.formula.slice(0, 30) + "…" : kpi.formula}
        </code>
      </td>
      <td className="py-3 px-3">
        <SemaforoBar kpi={kpi} />
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1">
          <TendenciaIcon tendencia={kpi.tendencia} />
          <span className="text-[11px] text-sse-muted">{kpi.frecuencia}</span>
        </div>
      </td>
      <td className="py-3 px-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {label}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        {canManage && kpi.lifecycle === "draft" && (
          <button
            onClick={handlePublish}
            disabled={busy}
            className="text-[11px] font-medium text-sse-primary hover:underline disabled:opacity-50"
          >
            Publicar
          </button>
        )}
      </td>
    </tr>
  );
}

export function WorkspaceAdminIndicators({ wsId }: { wsId: WorkspaceId }) {
  const { hasPermission } = usePermissions();
  const { data: kpis, loading, refetch } = useKPIs(wsId);
  const [filter, setFilter] = useState<ObjectLifecycle | "all">("all");

  const canManage = hasPermission("ws.indicators.manage");

  const filtered = (kpis ?? []).filter((k) => filter === "all" || k.lifecycle === filter);

  const counts = {
    all: kpis?.length ?? 0,
    draft: (kpis ?? []).filter((k) => k.lifecycle === "draft").length,
    published: (kpis ?? []).filter((k) => k.lifecycle === "published").length,
    archived: (kpis ?? []).filter((k) => k.lifecycle === "archived").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Diseñador de Indicadores</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            KPIs con fórmula, semáforo, frecuencia y destino de visualización.
          </p>
        </div>
        {canManage && (
          <button className="flex items-center gap-1.5 text-[12px] font-medium bg-sse-primary text-white px-3 py-1.5 rounded-md hover:bg-sse-primary/90 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo KPI
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        {(["all", "draft", "published", "archived"] as const).map((lc) => {
          const labels: Record<string, string> = { all: "Todos", draft: "Borrador", published: "Publicados", archived: "Archivados" };
          return (
            <button
              key={lc}
              onClick={() => setFilter(lc)}
              className={
                "px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors " +
                (filter === lc
                  ? "bg-sse-primary/10 text-sse-primary"
                  : "text-sse-muted hover:bg-sse-hover hover:text-sse-ink")
              }
            >
              {labels[lc]}
              <span className="ml-1.5 text-[10px] opacity-70">{counts[lc as keyof typeof counts]}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-sse-surface rounded-md border border-sse-border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-5 h-5 border-2 border-sse-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] text-sse-muted">No se encontraron indicadores.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border">
                {["Indicador", "Categoría", "Fórmula", "Valor / Meta", "Frecuencia", "Estado", ""].map((h) => (
                  <th key={h} className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide py-2.5 px-3 first:px-4 last:px-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((kpi) => (
                <KPIRow key={kpi.id} kpi={kpi} onAction={refetch} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* KPI designer info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { title: "Fórmula", desc: "Define la expresión de cálculo. El motor la evalúa contra las fuentes de datos configuradas." },
          { title: "Semáforo", desc: "Configura los rangos verde / amarillo / rojo. El sistema colorea automáticamente el valor actual." },
          { title: "Historial", desc: "Cada medición queda registrada con fecha, valor y color de semáforo para análisis de tendencias." },
        ].map((item) => (
          <div key={item.title} className="bg-sse-hover rounded-md border border-sse-border px-3 py-2.5">
            <p className="text-[12px] font-semibold text-sse-ink">{item.title}</p>
            <p className="text-[11px] text-sse-muted mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
