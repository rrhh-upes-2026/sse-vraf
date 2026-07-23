"use client";

import { useState } from "react";
import {
  useFMIFrequencies,
  useCreateFMIFrequency,
  useUpdateFMIFrequency,
  useDeleteFMIFrequency,
} from "@/hooks/useFMI";
import type { FMIFrequency, FMIStatus } from "@/types/fmi";

interface FormState {
  codigo:      string;
  nombre:      string;
  descripcion: string;
  periodoDias: string;
  estado:      FMIStatus;
}

const EMPTY: FormState = { codigo: "", nombre: "", descripcion: "", periodoDias: "0", estado: "activo" };

function FreqModal({
  initial, title, onSave, onClose, saving,
}: {
  initial: FormState;
  title: string;
  onSave: (f: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-sse-surface rounded-xl border border-sse-border w-full max-w-md space-y-4 p-6">
        <p className="text-[13px] font-semibold text-sse-ink">{title}</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Código *</label>
              <input value={form.codigo} onChange={set("codigo")} placeholder="TRIM"
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono uppercase" />
            </div>
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Período (días)</label>
              <input type="number" min="0" value={form.periodoDias} onChange={set("periodoDias")}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Nombre *</label>
            <input value={form.nombre} onChange={set("nombre")} placeholder="Trimestral"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Descripción</label>
            <input value={form.descripcion} onChange={set("descripcion")} placeholder="Cada 90 días"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="text-[12px] px-4 py-1.5 rounded border border-sse-border text-sse-ink hover:bg-sse-border">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.codigo || !form.nombre}
            className="text-[12px] px-5 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 font-medium">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FMIFrequencies({ wsId }: { wsId: string }) {
  void wsId;
  const [creating, setCreating] = useState(false);
  const [editing, setEditing]   = useState<FMIFrequency | null>(null);
  const [toDelete, setToDelete] = useState<FMIFrequency | null>(null);

  const { data: frequencies, isLoading } = useFMIFrequencies();
  const create  = useCreateFMIFrequency();
  const update  = useUpdateFMIFrequency();
  const remove  = useDeleteFMIFrequency();

  async function handleCreate(f: FormState) {
    await create.mutateAsync({ codigo: f.codigo, nombre: f.nombre, descripcion: f.descripcion, periodoDias: Number(f.periodoDias) });
    setCreating(false);
  }

  async function handleUpdate(f: FormState) {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, codigo: f.codigo, nombre: f.nombre, descripcion: f.descripcion, periodoDias: Number(f.periodoDias), estado: f.estado });
    setEditing(null);
  }

  async function handleDelete() {
    if (!toDelete) return;
    await remove.mutateAsync(toDelete.id);
    setToDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setCreating(true)} className="text-[12px] px-4 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 font-medium">
          + Nueva Frecuencia
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-sse-border" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sse-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-sse-border bg-sse-surface">
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Código</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Nombre</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium hidden md:table-cell">Descripción</th>
                <th className="text-right px-3 py-2 text-sse-muted font-medium">Período (días)</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium">Estado</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {(frequencies ?? []).length === 0 && (
                <tr><td colSpan={6} className="text-center text-sse-muted py-8">Sin frecuencias registradas.</td></tr>
              )}
              {(frequencies ?? []).map((f) => (
                <tr key={f.id} className="border-b border-sse-border hover:bg-sse-surface/50">
                  <td className="px-3 py-2.5 font-mono text-teal-700">{f.codigo}</td>
                  <td className="px-3 py-2.5 font-medium text-sse-ink">{f.nombre}</td>
                  <td className="px-3 py-2.5 text-sse-muted hidden md:table-cell">{f.descripcion || "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-sse-ink">
                    {Number(f.periodoDias) === 0 ? <span className="text-sse-muted">Eventual</span> : f.periodoDias}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${f.estado === "activo" ? "bg-green-100 text-green-700" : "bg-sse-border text-sse-muted"}`}>
                      {f.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setEditing(f)} className="text-[10px] px-2 py-1 rounded border border-sse-border text-sse-ink hover:bg-sse-border">Editar</button>
                      <button onClick={() => setToDelete(f)} className="text-[10px] px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <FreqModal initial={EMPTY} title="Nueva Frecuencia" onSave={(f) => void handleCreate(f)} onClose={() => setCreating(false)} saving={create.isPending} />}
      {editing  && <FreqModal initial={{ codigo: editing.codigo, nombre: editing.nombre, descripcion: editing.descripcion, periodoDias: String(editing.periodoDias), estado: editing.estado }} title="Editar Frecuencia" onSave={(f) => void handleUpdate(f)} onClose={() => setEditing(null)} saving={update.isPending} />}

      {toDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-sse-surface rounded-xl border border-sse-border p-6 w-80 space-y-4">
            <p className="text-[13px] font-semibold text-sse-ink">¿Eliminar frecuencia?</p>
            <p className="text-[12px] text-sse-muted"><strong>{toDelete.nombre}</strong> será eliminada.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setToDelete(null)} className="text-[12px] px-4 py-1.5 rounded border border-sse-border text-sse-ink hover:bg-sse-border">Cancelar</button>
              <button onClick={() => void handleDelete()} disabled={remove.isPending} className="text-[12px] px-4 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {remove.isPending ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
