"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIMEIndicadores, useIMEIndicadorActions, useIMECatalogosPorTipo } from "@/hooks/useIME";
import type { IMEIndicador } from "@/types/ime";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ACTIVE_VARIANT: Record<string, BadgeVariant> = {
  true:  "success",
  false: "gray",
};

function IndicadorRow({
  indicador,
  onActivar,
  onDesactivar,
  onDuplicar,
  onEdit,
  onDetail,
}: {
  indicador: IMEIndicador;
  onActivar: (id: string) => void;
  onDesactivar: (id: string) => void;
  onDuplicar: (id: string) => void;
  onEdit: (id: string) => void;
  onDetail: (id: string) => void;
}) {
  const isActive = indicador.active === "true";

  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-3.5 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-sse-muted bg-sse-bg border border-sse-border rounded px-1.5 py-0.5 shrink-0">
              {indicador.code}
            </span>
            <Badge variant={ACTIVE_VARIANT[String(isActive)]}>
              {isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <p
            className="text-[13px] font-semibold text-sse-ink mt-1.5 leading-snug line-clamp-2 cursor-pointer hover:text-sse-primary"
            onClick={() => onDetail(indicador.id)}
          >
            {indicador.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-sse-muted">
        <span>Frecuencia: <span className="text-sse-ink font-medium">{indicador.frequency || "—"}</span></span>
        <span>Unidad: <span className="text-sse-ink font-medium">{indicador.measurementUnit || "—"}</span></span>
        <span>Meta: <span className="text-sse-ink font-medium">{indicador.targetValue ?? "—"}</span></span>
        <span>Tipo: <span className="text-sse-ink font-medium">{indicador.indicatorType || "—"}</span></span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-sse-border">
        <span className="text-[11px] text-sse-muted">
          {indicador.updatedAt ? fmtShortDate(indicador.updatedAt) : "—"}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onDetail(indicador.id)}
            className="text-[11px] text-sse-muted hover:text-sse-primary px-1.5 py-0.5 rounded transition-colors"
          >
            Ver
          </button>
          <button
            onClick={() => onEdit(indicador.id)}
            className="text-[11px] text-sse-muted hover:text-sse-primary px-1.5 py-0.5 rounded transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDuplicar(indicador.id)}
            className="text-[11px] text-sse-muted hover:text-sse-primary px-1.5 py-0.5 rounded transition-colors"
          >
            Duplicar
          </button>
          {isActive ? (
            <button
              onClick={() => onDesactivar(indicador.id)}
              className="text-[11px] text-sse-muted hover:text-amber-600 px-1.5 py-0.5 rounded transition-colors"
            >
              Desactivar
            </button>
          ) : (
            <button
              onClick={() => onActivar(indicador.id)}
              className="text-[11px] text-sse-muted hover:text-green-600 px-1.5 py-0.5 rounded transition-colors"
            >
              Activar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  wsId: string;
}

export function WorkspaceGestionIndicadores({ wsId }: Props) {
  const router = useRouter();
  const [search, setSearch]         = useState("");
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("");
  const [filterFreq, setFilterFreq]     = useState("");

  const { data: frecuencias } = useIMECatalogosPorTipo("frecuencia");

  const { data: indicadores, isLoading } = useIMEIndicadores({
    ...(filterActive ? { active: filterActive } : {}),
    ...(filterFreq   ? { frequency: filterFreq } : {}),
  });

  const { activar, desactivar, duplicar } = useIMEIndicadorActions();

  const filtered = (indicadores ?? []).filter((ind) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ind.name.toLowerCase().includes(q) ||
      ind.code.toLowerCase().includes(q) ||
      (ind.description ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Indicadores Institucionales</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">
            {(indicadores ?? []).length} indicadores registrados
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => router.push(`/ws/${wsId}/gestion-indicadores/nuevo`)}
        >
          + Nuevo Indicador
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <Input
          placeholder="Buscar por nombre o código…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs text-[13px]"
        />
        <Select
          value={filterActive}
          onValueChange={(v) => setFilterActive(v as "" | "true" | "false")}
          options={[
            { value: "", label: "Estado: Todos" },
            { value: "true", label: "Activos" },
            { value: "false", label: "Inactivos" },
          ]}
          className="min-w-[120px]"
        />
        <Select
          value={filterFreq}
          onValueChange={setFilterFreq}
          options={[
            { value: "", label: "Frecuencia: Todas" },
            ...(frecuencias ?? []).map((f) => ({ value: f.nombre, label: f.nombre })),
          ]}
          className="min-w-[140px]"
        />
      </div>

      {/* List */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0,1,2,3,4,5].map((i) => <SkeletonCard key={i} className="h-[160px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"
          title="Sin indicadores"
          description={search ? "No hay indicadores que coincidan con la búsqueda." : "Cree el primer indicador institucional."}
          action={!search ? (
            <Button size="sm" onClick={() => router.push(`/ws/${wsId}/gestion-indicadores/nuevo`)}>
              + Nuevo Indicador
            </Button>
          ) : undefined}
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((ind) => (
            <IndicadorRow
              key={ind.id}
              indicador={ind}
              onActivar={(id) => activar.mutate({ id })}
              onDesactivar={(id) => desactivar.mutate({ id })}
              onDuplicar={(id) => duplicar.mutate({ id })}
              onEdit={(id) => router.push(`/ws/${wsId}/gestion-indicadores/${id}/editar`)}
              onDetail={(id) => router.push(`/ws/${wsId}/gestion-indicadores/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
