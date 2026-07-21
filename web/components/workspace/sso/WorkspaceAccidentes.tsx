"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { SSOAccidente, SSOGravedad } from "@/types/entities";
import { useAccidentesSSO } from "@/hooks/useSSO";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const GRAVEDAD_VARIANT: Record<SSOGravedad, BadgeVariant> = {
  leve:     "info",
  moderado: "warning",
  grave:    "danger",
  fatal:    "danger",
};

const GRAVEDAD_LABEL: Record<SSOGravedad, string> = {
  leve:     "Leve",
  moderado: "Moderado",
  grave:    "Grave",
  fatal:    "Fatal",
};

const FILTROS = [
  { value: "todos",   label: "Todos" },
  { value: "leve",    label: "Leves" },
  { value: "moderado", label: "Moderados" },
  { value: "grave",   label: "Graves" },
];

function AccidenteCard({ item }: { item: SSOAccidente }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{item.descripcion}</p>
          <p className="text-[11px] text-sse-muted capitalize">{item.tipo} · {item.area}</p>
        </div>
        <Badge variant={GRAVEDAD_VARIANT[item.gravedad]} className="shrink-0 text-[10px]">
          {GRAVEDAD_LABEL[item.gravedad]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Empleado</span>
        <span className="font-medium text-sse-ink text-right truncate">{item.empleadoRef}</span>
        <span className="text-sse-muted">Fecha</span>
        <span className="font-medium text-sse-ink text-right">{item.fechaAccidente}</span>
        <span className="text-sse-muted">Lesión</span>
        <span className="font-medium text-sse-ink text-right truncate">{item.lesionTipo}</span>
        {item.diasIncapacidad != null && item.diasIncapacidad > 0 && (
          <>
            <span className="text-sse-muted">Días incapacidad</span>
            <span className="font-bold text-sse-sem-red-fg text-right">{item.diasIncapacidad}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function WorkspaceAccidentes({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: items, isLoading } = useAccidentesSSO({ wsId });

  const filtered = (items ?? []).filter((i) => {
    if (filtro === "todos") return i.deletedAt == null;
    return i.gravedad === filtro;
  });

  const totalDias = filtered.reduce((s, i) => s + (i.diasIncapacidad ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Accidentes de Trabajo</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Registro de accidentes laborales con días de incapacidad</p>
        </div>
        {filtered.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} accidentes</p>
            {totalDias > 0 && (
              <p className="text-[13px] font-bold text-sse-sem-red-fg">{totalDias} días perdidos</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTROS.map((f) => (
          <button key={f.value} onClick={() => setFiltro(f.value)}
            className={cn("px-3 py-1 rounded-full text-[12px] font-medium border transition-colors",
              filtro === f.value
                ? "bg-sse-primary text-white border-sse-primary"
                : "bg-sse-surface text-sse-muted border-sse-border hover:border-sse-primary/40")}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[160px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
          title="Sin accidentes registrados"
          description="No se encontraron accidentes con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <AccidenteCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
