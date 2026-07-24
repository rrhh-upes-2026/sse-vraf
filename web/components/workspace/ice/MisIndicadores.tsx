"use client";

import Link from "next/link";
import { useICEMyIndicators, useICEPeriods } from "@/hooks/useICE";
import type { ICEMyIndicatorItem } from "@/types/ice";

const STATUS_LABEL: Record<string, string> = {
  borrador:    "Borrador",
  enviada:     "Enviada",
  en_revision: "En revisión",
  aprobada:    "Aprobada",
  rechazada:   "Rechazada",
  cerrada:     "Cerrada",
};

const STATUS_COLOR: Record<string, string> = {
  borrador:    "bg-sse-border/40 text-sse-muted",
  enviada:     "bg-amber-100 text-amber-700",
  en_revision: "bg-blue-100 text-blue-700",
  aprobada:    "bg-green-100 text-green-700",
  rechazada:   "bg-red-100 text-red-700",
  cerrada:     "bg-sse-border/40 text-sse-muted",
};

function IndicatorRow({ item, wsId }: { item: ICEMyIndicatorItem; wsId: string }) {
  const status = item.captura?.status;
  return (
    <div className="rounded-lg border border-sse-border bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-sse-ink truncate">{item.indicator.nombre}</p>
            <p className="text-[11px] text-sse-muted mt-0.5">
              {item.indicator.codigo}
              {item.activePeriod ? <> · <span className="font-medium">{item.activePeriod.nombre}</span></> : " · Sin período activo"}
            </p>
          </div>
          {status ? (
            <span className={`shrink-0 text-[10px] font-medium rounded-full px-2.5 py-0.5 ${STATUS_COLOR[status] ?? ""}`}>
              {STATUS_LABEL[status] ?? status}
            </span>
          ) : (
            <span className="shrink-0 text-[10px] rounded-full px-2.5 py-0.5 bg-sse-border/40 text-sse-muted">Sin captura</span>
          )}
        </div>

        {item.captura && (
          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
            {item.captura.resultado !== null && item.captura.resultado !== undefined && (
              <div>
                <span className="text-sse-muted">Resultado</span>
                <p className="font-semibold text-sse-ink tabular-nums">{item.captura.resultado}</p>
              </div>
            )}
            {item.captura.meta !== null && item.captura.meta !== undefined && (
              <div>
                <span className="text-sse-muted">Meta</span>
                <p className="font-semibold text-sse-ink tabular-nums">{item.captura.meta}</p>
              </div>
            )}
            {item.captura.cumplimiento !== null && item.captura.cumplimiento !== undefined && (
              <div>
                <span className="text-sse-muted">Cumplimiento</span>
                <p className={`font-semibold tabular-nums ${item.captura.cumplimiento >= 100 ? "text-green-700" : item.captura.cumplimiento >= 80 ? "text-amber-700" : "text-red-700"}`}>
                  {item.captura.cumplimiento}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 shrink-0">
        {!item.captura && item.activePeriod && (
          <Link href={`/ws/${wsId}/ice-capturar?indicatorId=${item.indicator.id}&periodId=${item.activePeriod.id}`}
            className="text-[11px] px-3 py-1.5 rounded-md bg-sky-600 text-white hover:bg-sky-700 font-medium">
            Capturar
          </Link>
        )}
        {item.captura?.status === "borrador" && (
          <Link href={`/ws/${wsId}/ice-capturar?captureId=${item.captura.id}`}
            className="text-[11px] px-3 py-1.5 rounded-md border border-sse-border text-sse-ink hover:bg-sse-surface">
            Continuar
          </Link>
        )}
        {item.captura?.status === "rechazada" && (
          <Link href={`/ws/${wsId}/ice-capturar?captureId=${item.captura.id}`}
            className="text-[11px] px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100">
            Corregir
          </Link>
        )}
        {item.captura && (
          <Link href={`/ws/${wsId}/ice-historial?captureId=${item.captura.id}`}
            className="text-[11px] px-3 py-1.5 rounded-md border border-sse-border text-sse-muted hover:bg-sse-surface">
            Ver
          </Link>
        )}
      </div>
    </div>
  );
}

export function MisIndicadores({ wsId }: { wsId: string }) {
  const { data: items, isLoading, error } = useICEMyIndicators();
  const { data: openPeriods } = useICEPeriods({ estado: "abierto" });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border border-sse-border bg-white p-4 h-[72px] animate-pulse bg-sse-surface" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-[12px] text-red-700">
        Error al cargar indicadores. Intente nuevamente.
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="rounded-xl border border-sse-border bg-sse-surface p-8 text-center">
        <p className="text-[13px] text-sse-muted">No tienes indicadores asignados en el período activo.</p>
        {openPeriods && openPeriods.length === 0 && (
          <p className="text-[11px] text-sse-muted mt-2">No hay períodos abiertos actualmente.</p>
        )}
      </div>
    );
  }

  const pending   = items.filter(i => !i.captura || i.captura.status === "borrador" || i.captura.status === "rechazada");
  const submitted = items.filter(i => i.captura && !["borrador", "rechazada"].includes(i.captura.status));

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-2">
            Pendientes de captura ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map(item => <IndicatorRow key={item.indicator.id} item={item} wsId={wsId} />)}
          </div>
        </div>
      )}

      {submitted.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-2">
            Enviadas / En proceso ({submitted.length})
          </h3>
          <div className="space-y-2">
            {submitted.map(item => <IndicatorRow key={item.indicator.id} item={item} wsId={wsId} />)}
          </div>
        </div>
      )}
    </div>
  );
}
