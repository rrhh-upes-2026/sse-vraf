"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ContaRegistro } from "@/types/entities";
import { useRegistros } from "@/hooks/useContabilidad";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

type EstadoReg = ContaRegistro["estado"];
type TipoReg   = ContaRegistro["tipo"];

const ESTADO_VARIANT: Record<EstadoReg, BadgeVariant> = {
  borrador: "gray",
  aprobado: "success",
  anulado:  "danger",
};

const ESTADO_LABEL: Record<EstadoReg, string> = {
  borrador: "Borrador",
  aprobado: "Aprobado",
  anulado:  "Anulado",
};

const TIPO_VARIANT: Record<TipoReg, BadgeVariant> = {
  ingreso:       "success",
  egreso:        "danger",
  transferencia: "info",
  ajuste:        "warning",
};

const TIPO_LABEL: Record<TipoReg, string> = {
  ingreso:       "Ingreso",
  egreso:        "Egreso",
  transferencia: "Transferencia",
  ajuste:        "Ajuste",
};

const FILTROS: Array<{ value: EstadoReg | "todos"; label: string }> = [
  { value: "todos",    label: "Todos" },
  { value: "aprobado", label: "Aprobados" },
  { value: "borrador", label: "Borradores" },
];

function RegistroCard({ reg }: { reg: ContaRegistro }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {reg.numero && (
            <p className="text-[11px] font-mono text-sse-primary">{reg.numero}</p>
          )}
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{reg.descripcion}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant={TIPO_VARIANT[reg.tipo]} className="text-[10px]">{TIPO_LABEL[reg.tipo]}</Badge>
          <Badge variant={ESTADO_VARIANT[reg.estado]} className="text-[10px]">{ESTADO_LABEL[reg.estado]}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Monto</span>
        <span className="font-bold text-sse-ink text-right">${reg.monto.toLocaleString()} {reg.moneda}</span>
        <span className="text-sse-muted">Fecha asiento</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(reg.fechaAsiento)}</span>
        <span className="text-sse-muted">Período</span>
        <span className="font-medium text-sse-ink text-right font-mono">{reg.periodo}</span>
        {reg.centroCosto && (
          <>
            <span className="text-sse-muted">Centro costo</span>
            <span className="font-medium text-sse-ink text-right truncate">{reg.centroCosto}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 text-[11px] border-t border-sse-border pt-2">
        <span className="text-sse-muted truncate">Débito: <span className="text-sse-ink font-mono">{reg.cuentaDebito}</span></span>
        <span className="text-sse-muted truncate text-right">Crédito: <span className="text-sse-ink font-mono">{reg.cuentaCredito}</span></span>
      </div>
    </div>
  );
}

export function WorkspaceRegistros({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<EstadoReg | "todos">("todos");
  const { data: registros, isLoading } = useRegistros({ wsId });

  const filtered = (registros ?? []).filter((r) =>
    filtro === "todos" ? r.deletedAt == null : r.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Registros Contables</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">Asientos del libro diario — débito y crédito</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[170px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          title="Sin registros"
          description="No se encontraron registros contables con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => <RegistroCard key={r.id} reg={r} />)}
        </div>
      )}
    </div>
  );
}
