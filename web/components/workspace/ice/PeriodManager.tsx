"use client";

import { useState } from "react";
import {
  useICEPeriods, useCreateICEPeriod, useUpdateICEPeriod,
  useOpenICEPeriod, useReviewICEPeriod, useCloseICEPeriod, useLockICEPeriod,
} from "@/hooks/useICE";
import type { ICEPeriod } from "@/types/ice";

const ESTADO_COLOR: Record<string, string> = {
  borrador:    "bg-sse-border/40 text-sse-muted",
  abierto:     "bg-green-100 text-green-700",
  en_revision: "bg-blue-100 text-blue-700",
  cerrado:     "bg-sse-border/40 text-sse-muted",
  bloqueado:   "bg-red-100 text-red-700",
};

const ESTADO_LABEL: Record<string, string> = {
  borrador:    "Borrador",
  abierto:     "Abierto",
  en_revision: "En revisión",
  cerrado:     "Cerrado",
  bloqueado:   "Bloqueado",
};

function PeriodCard({
  period,
  onTransition,
}: {
  period: ICEPeriod;
  onTransition: (action: string, id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const transitions: { label: string; action: string; color: string }[] = [];
  if (period.estado === "borrador")    transitions.push({ label: "Abrir",         action: "open",   color: "bg-green-600 text-white hover:bg-green-700" });
  if (period.estado === "abierto")     transitions.push({ label: "Poner en revisión", action: "review", color: "bg-blue-600 text-white hover:bg-blue-700" });
  if (period.estado === "en_revision") transitions.push(
    { label: "Cerrar",   action: "close", color: "bg-sse-ink text-white hover:bg-sse-ink/80" },
    { label: "Reabrir",  action: "open",  color: "border border-sse-border text-sse-ink hover:bg-sse-surface" },
  );
  if (period.estado === "cerrado")     transitions.push({ label: "Bloquear", action: "lock", color: "bg-red-600 text-white hover:bg-red-700" });

  return (
    <div className="rounded-lg border border-sse-border bg-white">
      <button
        className="w-full text-left p-4 flex items-center gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-sse-ink truncate">{period.nombre}</p>
            <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${ESTADO_COLOR[period.estado] ?? ""}`}>
              {ESTADO_LABEL[period.estado] ?? period.estado}
            </span>
          </div>
          <p className="text-[11px] text-sse-muted mt-0.5">{period.inicio} – {period.fin}</p>
        </div>
        <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-sse-muted transition-transform ${expanded ? "rotate-180" : ""}`}>
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-sse-border px-4 py-3 space-y-3">
          {period.descripcion && (
            <p className="text-[12px] text-sse-muted">{period.descripcion}</p>
          )}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p className="text-sse-muted">Creado por</p>
              <p className="text-sse-ink">{period.createdBy ?? "—"}</p>
            </div>
            <div>
              <p className="text-sse-muted">ID</p>
              <p className="text-sse-ink font-mono">{period.id}</p>
            </div>
          </div>
          {transitions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {transitions.map(t => (
                <button key={t.action + t.label} onClick={() => onTransition(t.action, period.id)}
                  className={`text-[11px] px-3 py-1.5 rounded-md font-medium ${t.color}`}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreatePeriodForm({ onCreated }: { onCreated: () => void }) {
  const create = useCreateICEPeriod();
  const [form, setForm] = useState({ nombre: "", inicio: "", fin: "", descripcion: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setForm({ nombre: "", inicio: "", fin: "", descripcion: "" });
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-sse-border bg-white p-4 space-y-3">
      <p className="text-[13px] font-semibold text-sse-ink">Nuevo período</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-sse-muted block mb-1">Nombre *</label>
          <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            placeholder="Ej: Enero–Junio 2026"
            className="w-full text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-sse-muted block mb-1">Descripción</label>
          <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            placeholder="Opcional"
            className="w-full text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-sse-muted block mb-1">Inicio *</label>
          <input required type="date" value={form.inicio} onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))}
            className="w-full text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-sse-muted block mb-1">Fin *</label>
          <input required type="date" value={form.fin} onChange={e => setForm(f => ({ ...f, fin: e.target.value }))}
            className="w-full text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={create.isPending}
          className="text-[12px] px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium disabled:opacity-60">
          {create.isPending ? "Creando…" : "Crear período"}
        </button>
      </div>
      {create.isError && <p className="text-[11px] text-red-600">Error al crear. Intente nuevamente.</p>}
    </form>
  );
}

export function PeriodManager({ wsId }: { wsId: string }) {
  const [showCreate, setShowCreate] = useState(false);
  const { data: allPeriods, isLoading } = useICEPeriods();

  const openPeriod    = useOpenICEPeriod();
  const reviewPeriod  = useReviewICEPeriod();
  const closePeriod   = useCloseICEPeriod();
  const lockPeriod    = useLockICEPeriod();

  const handleTransition = async (action: string, id: string) => {
    if (action === "open")   await openPeriod.mutateAsync(id);
    if (action === "review") await reviewPeriod.mutateAsync(id);
    if (action === "close")  await closePeriod.mutateAsync(id);
    if (action === "lock")   await lockPeriod.mutateAsync(id);
  };

  if (isLoading) {
    return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg border border-sse-border bg-sse-surface animate-pulse" />)}</div>;
  }

  const open       = allPeriods?.filter(p => p.estado === "abierto")     ?? [];
  const inReview   = allPeriods?.filter(p => p.estado === "en_revision") ?? [];
  const drafts     = allPeriods?.filter(p => p.estado === "borrador")    ?? [];
  const closed     = allPeriods?.filter(p => ["cerrado","bloqueado"].includes(p.estado)) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-sse-ink">Gestión de Períodos</h2>
        <button onClick={() => setShowCreate(s => !s)}
          className="text-[12px] px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium">
          {showCreate ? "Cancelar" : "+ Nuevo período"}
        </button>
      </div>

      {showCreate && <CreatePeriodForm onCreated={() => setShowCreate(false)} />}

      {open.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-2">Abiertos ({open.length})</h3>
          <div className="space-y-2">{open.map(p => <PeriodCard key={p.id} period={p} onTransition={handleTransition} />)}</div>
        </section>
      )}

      {inReview.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-2">En revisión ({inReview.length})</h3>
          <div className="space-y-2">{inReview.map(p => <PeriodCard key={p.id} period={p} onTransition={handleTransition} />)}</div>
        </section>
      )}

      {drafts.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-2">Borradores ({drafts.length})</h3>
          <div className="space-y-2">{drafts.map(p => <PeriodCard key={p.id} period={p} onTransition={handleTransition} />)}</div>
        </section>
      )}

      {closed.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-2">Cerrados / Bloqueados ({closed.length})</h3>
          <div className="space-y-2">{closed.map(p => <PeriodCard key={p.id} period={p} onTransition={handleTransition} />)}</div>
        </section>
      )}

      {!allPeriods?.length && !showCreate && (
        <div className="rounded-xl border border-sse-border bg-sse-surface p-8 text-center">
          <p className="text-[13px] text-sse-muted">No hay períodos creados. Crea el primero.</p>
        </div>
      )}
    </div>
  );
}
