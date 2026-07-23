"use client";

import { useState } from "react";
import {
  useFMIRangeConfigs,
  useCreateFMIRangeConfig,
  useUpdateFMIRangeConfig,
  useDeleteFMIRangeConfig,
} from "@/hooks/useFMI";
import type { FMIRangeConfig, FMIPolaridad, FMIStatus, FMIRangeBound } from "@/types/fmi";

interface BoundForm { min: string; max: string }
interface FormState {
  nombre:      string;
  descripcion: string;
  polaridad:   FMIPolaridad;
  estado:      FMIStatus;
  excelente:   BoundForm;
  bueno:       BoundForm;
  aceptable:   BoundForm;
  critico:     BoundForm;
}

function parseBound(b: FMIRangeBound | undefined): BoundForm {
  if (!b) return { min: "", max: "" };
  return { min: String(b.min ?? ""), max: String(b.max ?? "") };
}

function boundToObj(b: BoundForm): FMIRangeBound {
  return { min: Number(b.min), max: Number(b.max) };
}

const EMPTY: FormState = {
  nombre: "", descripcion: "", polaridad: "positiva", estado: "activo",
  excelente: { min: "", max: "" }, bueno: { min: "", max: "" },
  aceptable: { min: "", max: "" }, critico:  { min: "", max: "" },
};

const LEVELS: { key: keyof Pick<FormState, "excelente" | "bueno" | "aceptable" | "critico">; label: string; color: string }[] = [
  { key: "excelente", label: "Excelente", color: "text-green-700 bg-green-50 border-green-200" },
  { key: "bueno",     label: "Bueno",     color: "text-teal-700 bg-teal-50 border-teal-200"   },
  { key: "aceptable", label: "Aceptable", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { key: "critico",   label: "Crítico",   color: "text-red-700 bg-red-50 border-red-200"       },
];

function RangeModal({
  initial, title, onSave, onClose, saving,
}: {
  initial: FormState;
  title: string;
  onSave: (f: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);

  function setField(k: keyof Pick<FormState, "nombre" | "descripcion" | "polaridad" | "estado">) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  function setBound(level: keyof Pick<FormState, "excelente" | "bueno" | "aceptable" | "critico">, bound: "min" | "max") {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [level]: { ...p[level], [bound]: e.target.value } }));
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-sse-surface rounded-xl border border-sse-border w-full max-w-lg space-y-4 p-6 max-h-[90vh] overflow-y-auto">
        <p className="text-[13px] font-semibold text-sse-ink">{title}</p>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Nombre *</label>
            <input value={form.nombre} onChange={setField("nombre")} placeholder="Rango para Eficiencia"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Descripción</label>
            <textarea rows={2} value={form.descripcion} onChange={setField("descripcion")}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Polaridad</label>
            <select value={form.polaridad} onChange={setField("polaridad")}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none">
              <option value="positiva">Positiva (mayor es mejor)</option>
              <option value="negativa">Negativa (menor es mejor)</option>
            </select>
          </div>

          <div className="pt-1">
            <p className="text-[11px] text-sse-muted font-medium mb-2">Límites por nivel</p>
            <div className="space-y-2">
              {LEVELS.map(({ key, label, color }) => (
                <div key={key} className={`rounded-lg border p-3 ${color}`}>
                  <p className="text-[11px] font-medium mb-2">{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] opacity-70 mb-0.5">Mínimo</label>
                      <input type="number" step="any" value={form[key].min} onChange={setBound(key, "min")}
                        className="w-full text-[12px] rounded border border-current/20 px-2 py-1 bg-white/60 text-inherit focus:outline-none focus:ring-1 focus:ring-current/40" />
                    </div>
                    <div>
                      <label className="block text-[10px] opacity-70 mb-0.5">Máximo</label>
                      <input type="number" step="any" value={form[key].max} onChange={setBound(key, "max")}
                        className="w-full text-[12px] rounded border border-current/20 px-2 py-1 bg-white/60 text-inherit focus:outline-none focus:ring-1 focus:ring-current/40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {initial.estado === "inactivo" && (
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Estado</label>
              <select value={form.estado} onChange={setField("estado")}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="text-[12px] px-4 py-1.5 rounded border border-sse-border text-sse-ink hover:bg-sse-border">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.nombre}
            className="text-[12px] px-5 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 font-medium">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LevelBadge({ level, bound }: { level: typeof LEVELS[number]; bound: FMIRangeBound | undefined }) {
  if (!bound) return <span className="text-sse-muted text-[10px]">—</span>;
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium border ${level.color}`}>
      {bound.min}–{bound.max}
    </span>
  );
}

export function FMIRanges({ wsId }: { wsId: string }) {
  void wsId;
  const [creating, setCreating] = useState(false);
  const [editing, setEditing]   = useState<FMIRangeConfig | null>(null);
  const [toDelete, setToDelete] = useState<FMIRangeConfig | null>(null);
  const [search, setSearch]     = useState("");

  const { data: ranges, isLoading } = useFMIRangeConfigs();
  const create = useCreateFMIRangeConfig();
  const update = useUpdateFMIRangeConfig();
  const remove = useDeleteFMIRangeConfig();

  const filtered = (ranges ?? []).filter((r) =>
    !search || r.nombre.toLowerCase().includes(search.toLowerCase())
  );

  function toPayload(f: FormState) {
    return {
      nombre: f.nombre,
      descripcion: f.descripcion,
      polaridad: f.polaridad,
      estado: f.estado,
      excelente: boundToObj(f.excelente),
      bueno:     boundToObj(f.bueno),
      aceptable: boundToObj(f.aceptable),
      critico:   boundToObj(f.critico),
    };
  }

  async function handleCreate(f: FormState) {
    await create.mutateAsync(toPayload(f));
    setCreating(false);
  }

  async function handleUpdate(f: FormState) {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, ...toPayload(f) });
    setEditing(null);
  }

  async function handleDelete() {
    if (!toDelete) return;
    await remove.mutateAsync(toDelete.id);
    setToDelete(null);
  }

  function toFormState(r: FMIRangeConfig): FormState {
    return {
      nombre:      r.nombre,
      descripcion: r.descripcion,
      polaridad:   r.polaridad,
      estado:      r.estado,
      excelente:   parseBound(r.excelente),
      bueno:       parseBound(r.bueno),
      aceptable:   parseBound(r.aceptable),
      critico:     parseBound(r.critico),
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar configuración…"
          className="text-[12px] border border-sse-border rounded px-3 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
        <button onClick={() => setCreating(true)} className="text-[12px] px-4 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 font-medium">
          + Nueva Configuración
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-sse-border" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sse-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-sse-border bg-sse-surface">
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Nombre</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium">Polaridad</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium hidden lg:table-cell">Excelente</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium hidden lg:table-cell">Bueno</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium hidden lg:table-cell">Aceptable</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium hidden lg:table-cell">Crítico</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium">Estado</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-sse-muted py-8">Sin configuraciones de rangos registradas.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-sse-border hover:bg-sse-surface/50">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-sse-ink">{r.nombre}</p>
                    {r.descripcion && <p className="text-sse-muted text-[10px] mt-0.5">{r.descripcion}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${r.polaridad === "positiva" ? "bg-teal-100 text-teal-700" : "bg-violet-100 text-violet-700"}`}>
                      {r.polaridad}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center hidden lg:table-cell"><LevelBadge level={LEVELS[0]} bound={r.excelente} /></td>
                  <td className="px-3 py-2.5 text-center hidden lg:table-cell"><LevelBadge level={LEVELS[1]} bound={r.bueno} /></td>
                  <td className="px-3 py-2.5 text-center hidden lg:table-cell"><LevelBadge level={LEVELS[2]} bound={r.aceptable} /></td>
                  <td className="px-3 py-2.5 text-center hidden lg:table-cell"><LevelBadge level={LEVELS[3]} bound={r.critico} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${r.estado === "activo" ? "bg-green-100 text-green-700" : "bg-sse-border text-sse-muted"}`}>
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setEditing(r)} className="text-[10px] px-2 py-1 rounded border border-sse-border text-sse-ink hover:bg-sse-border">Editar</button>
                      <button onClick={() => setToDelete(r)} className="text-[10px] px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <RangeModal initial={EMPTY} title="Nueva Configuración de Rangos" onSave={(f) => void handleCreate(f)} onClose={() => setCreating(false)} saving={create.isPending} />}
      {editing  && <RangeModal initial={toFormState(editing)} title="Editar Configuración de Rangos" onSave={(f) => void handleUpdate(f)} onClose={() => setEditing(null)} saving={update.isPending} />}

      {toDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-sse-surface rounded-xl border border-sse-border p-6 w-80 space-y-4">
            <p className="text-[13px] font-semibold text-sse-ink">¿Eliminar configuración de rangos?</p>
            <p className="text-[12px] text-sse-muted"><strong>{toDelete.nombre}</strong> será eliminada permanentemente.</p>
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
