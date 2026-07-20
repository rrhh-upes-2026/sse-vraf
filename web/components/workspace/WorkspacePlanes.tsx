"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { WorkspaceId } from "@/config/nav";
import type { PlanEstrategico, EstadoPlan } from "@/types/entities";
import { usePlanes, usePlanesActions } from "@/hooks/usePlanes";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

const ESTADO_VARIANT: Record<EstadoPlan, BadgeVariant> = {
  borrador:  "gray",
  revision:  "warning",
  aprobado:  "success",
  vigente:   "success",
  cerrado:   "default",
};

const ESTADO_LABEL: Record<EstadoPlan, string> = {
  borrador:  "Borrador",
  revision:  "En revisión",
  aprobado:  "Aprobado",
  vigente:   "Vigente",
  cerrado:   "Cerrado",
};

const TIPO_LABEL: Record<string, string> = {
  estrategico: "Estratégico",
  operativo:   "Operativo",
  mejora:      "Mejora",
  accion:      "Acción",
};

function avanceColor(pct: number): "success" | "warning" | "danger" {
  if (pct >= 70) return "success";
  if (pct >= 40) return "warning";
  return "danger";
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: PlanEstrategico }) {
  const estado = plan.estado as EstadoPlan;
  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-3 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2">
            {plan.nombre}
          </p>
          <p className="text-[11px] text-sse-muted mt-0.5">
            {TIPO_LABEL[plan.tipo] ?? plan.tipo}
          </p>
        </div>
        <Badge variant={ESTADO_VARIANT[estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[estado] ?? estado}
        </Badge>
      </div>

      {plan.descripcion && (
        <p className="text-[12px] text-sse-muted line-clamp-2">{plan.descripcion}</p>
      )}

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-sse-muted">Avance</span>
          <span className="text-[11px] font-semibold text-sse-ink">{plan.avancePct ?? 0}%</span>
        </div>
        <Progress value={plan.avancePct ?? 0} color={avanceColor(plan.avancePct ?? 0)} />
      </div>

      <div className="flex items-center justify-between text-[11px] text-sse-muted">
        <span>
          {plan.periodoInicio ? fmtShortDate(plan.periodoInicio) : "—"}
          {" — "}
          {plan.periodoFin ? fmtShortDate(plan.periodoFin) : "—"}
        </span>
      </div>
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

const ESTADOS: Array<{ value: EstadoPlan | "todos"; label: string }> = [
  { value: "todos",    label: "Todos" },
  { value: "vigente",  label: "Vigentes" },
  { value: "revision", label: "En revisión" },
  { value: "borrador", label: "Borradores" },
  { value: "cerrado",  label: "Cerrados" },
];

// ── Main component ────────────────────────────────────────────────────────────

interface WorkspacePlanesProps {
  wsId: WorkspaceId;
}

export function WorkspacePlanes({ wsId }: WorkspacePlanesProps) {
  const [estadoFilter, setEstadoFilter] = useState<EstadoPlan | "todos">("todos");

  const { data: planes, isLoading } = usePlanes({ wsId });

  const filtered = (planes ?? []).filter((p) =>
    estadoFilter === "todos" ? true : p.estado === estadoFilter,
  );

  const resumen = (planes ?? []).reduce(
    (acc, p) => {
      const e = p.estado as EstadoPlan;
      acc[e] = (acc[e] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<EstadoPlan, number>>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Planes Institucionales</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">
            Planes estratégicos, operativos y de mejora de la unidad
          </p>
        </div>
      </div>

      {/* Summary chips */}
      {!isLoading && planes && planes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(["vigente", "revision", "borrador", "cerrado"] as EstadoPlan[]).map((e) =>
            resumen[e] ? (
              <div key={e} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-sse-border bg-sse-surface text-[11px]">
                <span className="font-semibold text-sse-ink">{resumen[e]}</span>
                <span className="text-sse-muted">{ESTADO_LABEL[e]}</span>
              </div>
            ) : null,
          )}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex gap-1.5 flex-wrap">
        {ESTADOS.map((e) => (
          <button
            key={e.value}
            onClick={() => setEstadoFilter(e.value)}
            className={cn(
              "px-3 py-1 rounded-full text-[12px] font-medium border transition-colors",
              estadoFilter === e.value
                ? "bg-sse-primary text-white border-sse-primary"
                : "bg-sse-surface text-sse-muted border-sse-border hover:border-sse-primary/40",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} className="h-[200px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          title="Sin planes"
          description={
            estadoFilter === "todos"
              ? "Esta unidad no tiene planes registrados."
              : `No hay planes en estado "${ESTADO_LABEL[estadoFilter as EstadoPlan]}".`
          }
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
