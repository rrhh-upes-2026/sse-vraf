"use client";

import { useState } from "react";
import {
  useFMIUnitMeasures,
  useCreateFMIUnitMeasure,
  useUpdateFMIUnitMeasure,
  useDeleteFMIUnitMeasure,
} from "@/hooks/useFMI";
import type { FMIUnitMeasure, FMITipoUnidad, FMIStatus } from "@/types/fmi";

interface FormState {
  codigo: string;
  nombre: string;
  tipo:   FMITipoUnidad;
  estado: FMIStatus;
}

const EMPTY: FormState = { codigo: "", nombre: "", tipo: "cuantitativa", estado: "activo" };

function UMModal({
  initial, title, onSave, onClose, saving,
}: {
  initial: FormState;
  title: string;
  onSave: (f: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value as FormState[typeof k] }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-sse-surface rounded-xl border border-sse-border w-full max-w-sm space-y-4 p-6">
        <p className="text-[13px] font-semibold text-sse-ink">{title}</p>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Código *</label>
            <input value={form.codigo} onChange={set("codigo")} placeholder="PCT"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono uppercase" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Nombre *</label>
            <input value={form.nombre} onChange={set("nombre")} placeholder="Porcentaje (%)"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Tipo</label>
            <select value={form.tipo} onChange={set("tipo")}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none">
              <option value="cuantitativa">Cuantitativa</option>
              <option value="cualitativa">Cualitativa</option>
            </select>
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

export function FMIUnitMeasures({ wsId }: { wsId: string }) {
  void wsId;
  const [creating, setCreating]     = useState(false);
  const [editing, setEditing]       = useState<FMIUnitMeasure | null>(null);
  const [toDelete, setToDelete]     = useState<FMIUnitMeasure | null>(null);
  const [filterTipo, setFilterTipo] = useState<"" | FMITipoUnidad>("");
  const [search, setSearch]         = useState("");

  const { data: units, isLoading } = useFMIUnitMeasures(filterTipo ? { tipo: filterTipo } : undefined);
  const create = useCreateFMIUnitMeasure();
  const update = useUpdateFMIUnitMeasure();
  const remove = useDeleteFMIUnitMeasure();

  const filtered = (units ?? []).filter((u) =>
    !search || u.nombre.toLowerCase().includes(search.toLowerCase()) || u.codigo.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(f: FormState) {
    await create.mutateAsync({ codigo: f.codigo, nombre: f.nombre, tipo: f.tipo });
    setCreating(false);
  }

  async function handleUpdate(f: FormState) {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, codigo: f.codigo, nombre: f.nombre, tipo: f.tipo, estado: f.estado });
    setEditing(null);
  }

  async function handleDelete() {
    if (!toDelete) return;
    await remove.mutateAsync(toDelete.id);
    setToDelete(null);
  }

  const cuantCount = (units ?? []).filter((u) => u.tipo === "cuantitativa").length;
  const cualCount  = (units ?? []).filter((u) => u.tipo === "cualitativa").length;

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex gap-2">
        <span className="text-[11px] rounded-full px-3 py-1 bg-teal-100 text-teal-700 font-medium">
          {cuantCount} cuantitativas
        </span>
        <span className="text-[11px] rounded-full px-3 py-1 bg-violet-100 text-violet-700 font-medium">
          {cualCount} cualitativas
        </span>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar unidad…"
            className="text-[12px] border border-sse-border rounded px-3 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 w-48" />
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as "" | FMITipoUnidad)}
            className="text-[12px] border border-sse-border rounded px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none">
            <option value="">Todos los tipos</option>
            <option value="cuantitativa">Cuantitativa</option>
            <option value="cualitativa">Cualitativa</option>
          </select>
        </div>
        <button onClick={() => setCreating(true)} className="text-[12px] px-4 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 font-medium">
          + Nueva Unidad
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 rounded-lg bg-sse-border" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sse-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-sse-border bg-sse-surface">
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Código</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Nombre</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium">Tipo</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium">Estado</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-sse-muted py-8">Sin unidades registradas.</td></tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-sse-border hover:bg-sse-surface/50">
                  <td className="px-3 py-2 font-mono text-teal-700 text-[11px]">{u.codigo}</td>
                  <td className="px-3 py-2 text-sse-ink">{u.nombre}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${u.tipo === "cuantitativa" ? "bg-teal-100 text-teal-700" : "bg-violet-100 text-violet-700"}`}>
                      {u.tipo}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${u.estado === "activo" ? "bg-green-100 text-green-700" : "bg-sse-border text-sse-muted"}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setEditing(u)} className="text-[10px] px-2 py-1 rounded border border-sse-border text-sse-ink hover:bg-sse-border">Editar</button>
                      <button onClick={() => setToDelete(u)} className="text-[10px] px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <UMModal initial={EMPTY} title="Nueva Unidad de Medida" onSave={(f) => void handleCreate(f)} onClose={() => setCreating(false)} saving={create.isPending} />}
      {editing  && <UMModal initial={{ codigo: editing.codigo, nombre: editing.nombre, tipo: editing.tipo, estado: editing.estado }} title="Editar Unidad de Medida" onSave={(f) => void handleUpdate(f)} onClose={() => setEditing(null)} saving={update.isPending} />}

      {toDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-sse-surface rounded-xl border border-sse-border p-6 w-80 space-y-4">
            <p className="text-[13px] font-semibold text-sse-ink">¿Eliminar unidad de medida?</p>
            <p className="text-[12px] text-sse-muted"><strong>{toDelete.nombre}</strong> ({toDelete.codigo}) será eliminada.</p>
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
