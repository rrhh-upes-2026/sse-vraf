"use client";

import { useState } from "react";
import {
  useFMIFormulas,
  useFMIUnitMeasures,
  useCreateFMIFormula,
  useUpdateFMIFormula,
  useDeleteFMIFormula,
} from "@/hooks/useFMI";
import type { FMIFormula, FMIFormulaVariableInput, FMIVarTipo, FMIStatus } from "@/types/fmi";

const VAR_TIPOS: FMIVarTipo[] = ["numero", "porcentaje", "moneda", "texto"];
const VAR_TIPO_LABEL: Record<FMIVarTipo, string> = {
  numero:     "Número",
  porcentaje: "Porcentaje",
  moneda:     "Moneda",
  texto:      "Texto",
};

interface FormState {
  codigo:             string;
  nombre:             string;
  descripcion:        string;
  unidadMedidaId:     string;
  formulaVisible:     string;
  formulaEjecutable:  string;
  variables:          FMIFormulaVariableInput[];
  estado:             FMIStatus;
}

const EMPTY_VAR: FMIFormulaVariableInput = { codigo: "", nombre: "", descripcion: "", tipo: "numero" };

const EMPTY: FormState = {
  codigo: "", nombre: "", descripcion: "", unidadMedidaId: "", formulaVisible: "", formulaEjecutable: "", variables: [], estado: "activo",
};

function VariableRow({
  variable, index, onChange, onRemove,
}: {
  variable: FMIFormulaVariableInput;
  index: number;
  onChange: (v: FMIFormulaVariableInput) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded border border-sse-border p-3 space-y-2 bg-sse-bg">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-teal-600 font-semibold">Variable {index + 1}</span>
        <button onClick={onRemove} className="text-[10px] text-red-500 hover:text-red-700">Eliminar</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] text-sse-muted mb-0.5">Código (en fórmula)</label>
          <input value={variable.codigo} onChange={(e) => onChange({ ...variable, codigo: e.target.value })}
            placeholder="v1"
            className="w-full text-[11px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink font-mono focus:outline-none focus:ring-1 focus:ring-teal-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] text-sse-muted mb-0.5">Nombre descriptivo</label>
          <input value={variable.nombre} onChange={(e) => onChange({ ...variable, nombre: e.target.value })}
            placeholder="Actividades Ejecutadas"
            className="w-full text-[11px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink focus:outline-none focus:ring-1 focus:ring-teal-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] text-sse-muted mb-0.5">Descripción</label>
          <input value={variable.descripcion ?? ""} onChange={(e) => onChange({ ...variable, descripcion: e.target.value })}
            placeholder="Número de actividades completadas en el período"
            className="w-full text-[11px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink focus:outline-none focus:ring-1 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-[10px] text-sse-muted mb-0.5">Tipo</label>
          <select value={variable.tipo} onChange={(e) => onChange({ ...variable, tipo: e.target.value as FMIVarTipo })}
            className="w-full text-[11px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink focus:outline-none">
            {VAR_TIPOS.map((t) => <option key={t} value={t}>{VAR_TIPO_LABEL[t]}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function FormulaModal({
  initial, title, onSave, onClose, saving, units,
}: {
  initial: FormState;
  title: string;
  onSave: (f: FormState) => void;
  onClose: () => void;
  saving: boolean;
  units: { id: string; codigo: string; nombre: string }[];
}) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  function addVariable() {
    setForm((p) => ({ ...p, variables: [...p.variables, { ...EMPTY_VAR, codigo: `v${p.variables.length + 1}`, orden: p.variables.length + 1 }] }));
  }
  function updateVariable(i: number, v: FMIFormulaVariableInput) {
    setForm((p) => { const vs = [...p.variables]; vs[i] = v; return { ...p, variables: vs }; });
  }
  function removeVariable(i: number) {
    setForm((p) => ({ ...p, variables: p.variables.filter((_, j) => j !== i) }));
  }

  const varCodes = form.variables.map((v) => v.codigo).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-sse-surface rounded-xl border border-sse-border w-full max-w-2xl my-4">
        <div className="px-6 py-4 border-b border-sse-border">
          <p className="text-[13px] font-semibold text-sse-ink">{title}</p>
        </div>
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Código *</label>
              <input value={form.codigo} onChange={set("codigo")} placeholder="FORM-001"
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" />
            </div>
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Unidad de Medida *</label>
              <select value={form.unidadMedidaId} onChange={set("unidadMedidaId")}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none">
                <option value="">— Seleccionar —</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.codigo} — {u.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Nombre *</label>
            <input value={form.nombre} onChange={set("nombre")} placeholder="Cumplimiento del Plan Estratégico de Actividades"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Descripción</label>
            <textarea rows={2} value={form.descripcion} onChange={set("descripcion")}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Fórmula legible (para mostrar al usuario)</label>
            <input value={form.formulaVisible} onChange={set("formulaVisible")}
              placeholder="Actividades Ejecutadas / Actividades Programadas × 100"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" />
          </div>

          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">
              Fórmula ejecutable
              {varCodes.length > 0 && <span className="text-teal-600 ml-1">— variables: {varCodes.join(", ")}</span>}
            </label>
            <input value={form.formulaEjecutable} onChange={set("formulaEjecutable")}
              placeholder="( v1 / v2 ) * 100"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" />
            <p className="text-[10px] text-sse-muted mt-0.5">Usa los códigos de las variables declaradas abajo. Operadores: + - * / ^ (). El motor calculará el resultado automáticamente.</p>
          </div>

          {/* Variables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-sse-ink">Variables</p>
              <button onClick={addVariable} className="text-[11px] text-teal-600 hover:text-teal-800 font-medium">+ Agregar variable</button>
            </div>
            {form.variables.length === 0 && (
              <p className="text-[11px] text-sse-muted">Sin variables — la fórmula se calculará con valor fijo, o agrega variables para que el usuario las ingrese.</p>
            )}
            {form.variables.map((v, i) => (
              <VariableRow key={i} variable={v} index={i} onChange={(upd) => updateVariable(i, upd)} onRemove={() => removeVariable(i)} />
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-sse-border flex gap-2 justify-end">
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

export function FMIFormulas({ wsId }: { wsId: string }) {
  void wsId;
  const [creating, setCreating]     = useState(false);
  const [editing, setEditing]       = useState<FMIFormula | null>(null);
  const [toDelete, setToDelete]     = useState<FMIFormula | null>(null);
  const [search, setSearch]         = useState("");

  const { data: formulas, isLoading }  = useFMIFormulas();
  const { data: unitMeasures = [] }    = useFMIUnitMeasures();
  const create  = useCreateFMIFormula();
  const update  = useUpdateFMIFormula();
  const remove  = useDeleteFMIFormula();

  const unitMap = Object.fromEntries(unitMeasures.map((u) => [u.id, u]));

  const filtered = (formulas ?? []).filter((f) =>
    !search || f.nombre.toLowerCase().includes(search.toLowerCase()) || f.codigo.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(f: FormState) {
    await create.mutateAsync({
      codigo: f.codigo, nombre: f.nombre, descripcion: f.descripcion,
      unidadMedidaId: f.unidadMedidaId, formulaVisible: f.formulaVisible,
      formulaEjecutable: f.formulaEjecutable, variables: f.variables,
    });
    setCreating(false);
  }

  async function handleUpdate(f: FormState) {
    if (!editing) return;
    await update.mutateAsync({
      id: editing.id, codigo: f.codigo, nombre: f.nombre, descripcion: f.descripcion,
      unidadMedidaId: f.unidadMedidaId, formulaVisible: f.formulaVisible,
      formulaEjecutable: f.formulaEjecutable, variables: f.variables, estado: f.estado,
    });
    setEditing(null);
  }

  async function handleDelete() {
    if (!toDelete) return;
    await remove.mutateAsync(toDelete.id);
    setToDelete(null);
  }

  function toFormState(f: FMIFormula): FormState {
    return {
      codigo: f.codigo, nombre: f.nombre, descripcion: f.descripcion,
      unidadMedidaId: f.unidadMedidaId, formulaVisible: f.formulaVisible,
      formulaEjecutable: f.formulaEjecutable, variables: f.variables ?? [], estado: f.estado,
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar fórmula…"
          className="text-[12px] border border-sse-border rounded px-3 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
        <button onClick={() => setCreating(true)} className="text-[12px] px-4 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 font-medium">
          + Nueva Fórmula
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-sse-border" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-[12px] text-sse-muted text-center py-8">Sin fórmulas registradas.</p>
          )}
          {filtered.map((f) => {
            const um = unitMap[f.unidadMedidaId];
            return (
              <div key={f.id} className="rounded-lg border border-sse-border bg-sse-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-50 rounded px-2 py-0.5">{f.codigo}</span>
                      {um && <span className="text-[10px] bg-sse-border text-sse-muted rounded px-2 py-0.5">{um.codigo} — {um.nombre}</span>}
                      <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${f.estado === "activo" ? "bg-green-100 text-green-700" : "bg-sse-border text-sse-muted"}`}>{f.estado}</span>
                    </div>
                    <p className="text-[12px] font-semibold text-sse-ink">{f.nombre}</p>
                    {f.formulaVisible && <p className="text-[11px] text-sse-muted font-mono mt-1">{f.formulaVisible}</p>}
                    {f.variables && f.variables.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {f.variables.map((v) => (
                          <span key={v.codigo} className="text-[10px] bg-teal-50 text-teal-700 rounded px-1.5 py-0.5 font-mono">
                            {v.codigo}: {v.nombre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => setEditing(f)} className="text-[10px] px-2 py-1 rounded border border-sse-border text-sse-ink hover:bg-sse-border">Editar</button>
                    <button onClick={() => setToDelete(f)} className="text-[10px] px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {creating && <FormulaModal initial={EMPTY} title="Nueva Fórmula" onSave={(f) => void handleCreate(f)} onClose={() => setCreating(false)} saving={create.isPending} units={unitMeasures} />}
      {editing  && <FormulaModal initial={toFormState(editing)} title="Editar Fórmula" onSave={(f) => void handleUpdate(f)} onClose={() => setEditing(null)} saving={update.isPending} units={unitMeasures} />}

      {toDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-sse-surface rounded-xl border border-sse-border p-6 w-80 space-y-4">
            <p className="text-[13px] font-semibold text-sse-ink">¿Eliminar fórmula?</p>
            <p className="text-[12px] text-sse-muted"><strong>{toDelete.nombre}</strong> y todas sus variables serán eliminadas.</p>
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
