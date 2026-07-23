"use client";

import { useState } from "react";
import {
  useFMIObjectives,
  useCreateFMIObjective,
  useUpdateFMIObjective,
  useDeleteFMIObjective,
} from "@/hooks/useFMI";
import type { FMIObjective, FMIStatus } from "@/types/fmi";

interface FormState {
  codigo:      string;
  nombre:      string;
  descripcion: string;
  orden:       string;
  estado:      FMIStatus;
}

const EMPTY: FormState = { codigo: "", nombre: "", descripcion: "", orden: "", estado: "activo" };

function ObjectiveModal({
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
              <input value={form.codigo} onChange={set("codigo")} placeholder="OBJ-01"
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" />
            </div>
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Orden</label>
              <input type="number" value={form.orden} onChange={set("orden")} placeholder="1"
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Nombre *</label>
            <input value={form.nombre} onChange={set("nombre")} placeholder="Excelencia Académica"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Descripción</label>
            <textarea rows={3} value={form.descripcion} onChange={set("descripcion")}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          {initial.estado !== "activo" || form.estado !== "activo" ? (
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Estado</label>
              <select value={form.estado} onChange={set("estado")}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          ) : null}
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

export function FMIObjectives({ wsId }: { wsId: string }) {
  void wsId;
  const [creating, setCreating]       = useState(false);
  const [editing, setEditing]         = useState<FMIObjective | null>(null);
  const [toDelete, setToDelete]       = useState<FMIObjective | null>(null);
  const [search, setSearch]           = useState("");

  const { data: objectives, isLoading } = useFMIObjectives();
  const create  = useCreateFMIObjective();
  const update  = useUpdateFMIObjective();
  const remove  = useDeleteFMIObjective();

  const filtered = (objectives ?? []).filter((o) =>
    !search || o.nombre.toLowerCase().includes(search.toLowerCase()) || o.codigo.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(f: FormState) {
    await create.mutateAsync({ codigo: f.codigo, nombre: f.nombre, descripcion: f.descripcion, orden: Number(f.orden) || undefined });
    setCreating(false);
  }

  async function handleUpdate(f: FormState) {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, codigo: f.codigo, nombre: f.nombre, descripcion: f.descripcion, orden: Number(f.orden) || undefined, estado: f.estado });
    setEditing(null);
  }

  async function handleDelete() {
    if (!toDelete) return;
    await remove.mutateAsync(toDelete.id);
    setToDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por código o nombre…"
          className="text-[12px] border border-sse-border rounded px-3 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
        <button onClick={() => setCreating(true)} className="text-[12px] px-4 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 font-medium">
          + Nuevo Objetivo
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-sse-border" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sse-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-sse-border bg-sse-surface">
                <th className="text-left px-3 py-2 text-sse-muted font-medium w-8">#</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Código</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Nombre</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium hidden md:table-cell">Descripción</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium">Estado</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-sse-muted py-8">Sin objetivos registrados.</td></tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-sse-border hover:bg-sse-surface/50">
                  <td className="px-3 py-2.5 text-sse-muted tabular-nums">{o.orden}</td>
                  <td className="px-3 py-2.5 font-mono text-teal-700">{o.codigo}</td>
                  <td className="px-3 py-2.5 font-medium text-sse-ink">{o.nombre}</td>
                  <td className="px-3 py-2.5 text-sse-muted hidden md:table-cell max-w-xs truncate">{o.descripcion || "—"}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${o.estado === "activo" ? "bg-green-100 text-green-700" : "bg-sse-border text-sse-muted"}`}>
                      {o.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setEditing(o)} className="text-[10px] px-2 py-1 rounded border border-sse-border text-sse-ink hover:bg-sse-border">Editar</button>
                      <button onClick={() => setToDelete(o)} className="text-[10px] px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <ObjectiveModal initial={EMPTY} title="Nuevo Objetivo" onSave={(f) => void handleCreate(f)} onClose={() => setCreating(false)} saving={create.isPending} />}
      {editing  && <ObjectiveModal initial={{ codigo: editing.codigo, nombre: editing.nombre, descripcion: editing.descripcion, orden: String(editing.orden), estado: editing.estado }} title="Editar Objetivo" onSave={(f) => void handleUpdate(f)} onClose={() => setEditing(null)} saving={update.isPending} />}

      {toDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-sse-surface rounded-xl border border-sse-border p-6 w-80 space-y-4">
            <p className="text-[13px] font-semibold text-sse-ink">¿Eliminar objetivo?</p>
            <p className="text-[12px] text-sse-muted"><strong>{toDelete.nombre}</strong> será eliminado permanentemente.</p>
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
