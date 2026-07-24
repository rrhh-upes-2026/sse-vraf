"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateIDEIndicator, useUpdateIDEIndicator,
  useValidateIDEIndicator, useIDEVariables,
} from "@/hooks/useIDE";
import {
  useFMIObjectives, useFMIDimensions, useFMIUnitMeasures,
  useFMIFrequencies, useFMIPolarities, useFMIFormulas, useFMIRangeConfigs,
} from "@/hooks/useFMI";
import type { FMIStatus } from "@/types/fmi";
import { useISPUsers } from "@/hooks/useISP";
import type { ISPUserStatus } from "@/types/isp";
import type { IndicatorDefinition, IDECreateParams, IDEValidationError } from "@/types/ide";

interface FormState {
  codigo:        string;
  nombre:        string;
  descripcion:   string;
  objetivoId:    string;
  dimensionId:   string;
  unitMeasureId: string;
  frequencyId:   string;
  formulaId:     string;
  polarityId:    string;
  rangeConfigId: string;
  responsibleId: string;
  unidadId:      string;
  meta:          string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  observaciones: string;
}

const EMPTY: FormState = {
  codigo: "", nombre: "", descripcion: "",
  objetivoId: "", dimensionId: "",
  unitMeasureId: "", frequencyId: "", formulaId: "", polarityId: "", rangeConfigId: "",
  responsibleId: "", unidadId: "",
  meta: "", vigenciaDesde: "", vigenciaHasta: "", observaciones: "",
};

function fieldError(errors: IDEValidationError[], field: string) {
  return errors.find((e) => e.field === field)?.message;
}

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] text-red-600 mt-0.5">{msg}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
      <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}

function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] text-sse-muted mb-0.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      <FieldErr msg={error} />
    </div>
  );
}

const INPUT = "w-full text-[12px] border border-sse-border rounded px-2.5 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-amber-500";
const SELECT = `${INPUT} cursor-pointer`;

export function IDEIndicatorForm({ wsId, initialData }: { wsId: string; initialData?: IndicatorDefinition }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState<FormState>(() => {
    if (!initialData) return EMPTY;
    return {
      codigo:        initialData.codigo ?? "",
      nombre:        initialData.nombre ?? "",
      descripcion:   initialData.descripcion ?? "",
      objetivoId:    initialData.objetivoId ?? "",
      dimensionId:   initialData.dimensionId ?? "",
      unitMeasureId: initialData.unitMeasureId ?? "",
      frequencyId:   initialData.frequencyId ?? "",
      formulaId:     initialData.formulaId ?? "",
      polarityId:    initialData.polarityId ?? "",
      rangeConfigId: initialData.rangeConfigId ?? "",
      responsibleId: initialData.responsibleId ?? "",
      unidadId:      initialData.unidadId ?? "",
      meta:          initialData.meta != null ? String(initialData.meta) : "",
      vigenciaDesde: initialData.vigenciaDesde ?? "",
      vigenciaHasta: initialData.vigenciaHasta ?? "",
      observaciones: initialData.observaciones ?? "",
    };
  });

  const [errors, setErrors] = useState<IDEValidationError[]>([]);
  const [saveError, setSaveError] = useState("");

  const ACTIVO: FMIStatus = "activo";
  // FMI catalogs
  const { data: objectives  } = useFMIObjectives({ estado: ACTIVO });
  const { data: dimensions  } = useFMIDimensions({ estado: ACTIVO });
  const { data: unitMeasures } = useFMIUnitMeasures();
  const { data: frequencies } = useFMIFrequencies({ estado: ACTIVO });
  const { data: polarities  } = useFMIPolarities();
  const { data: formulas    } = useFMIFormulas({ estado: ACTIVO });
  const { data: rangeConfigs } = useFMIRangeConfigs({ estado: ACTIVO });

  // ISP users for responsible
  const { data: ispUsers } = useISPUsers({ status: "activo" as ISPUserStatus });

  // Variables from selected formula
  const { data: variables } = useIDEVariables(form.formulaId);

  // Mutations
  const validate = useValidateIDEIndicator();
  const create   = useCreateIDEIndicator();
  const update   = useUpdateIDEIndicator();

  const isPending = create.isPending || update.isPending;

  // Reset errors when form changes
  useEffect(() => { if (errors.length > 0) setErrors([]); }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toParams(): IDECreateParams {
    return {
      codigo:        form.codigo.trim(),
      nombre:        form.nombre.trim(),
      descripcion:   form.descripcion.trim() || undefined,
      objetivoId:    form.objetivoId || undefined,
      dimensionId:   form.dimensionId || undefined,
      unitMeasureId: form.unitMeasureId || undefined,
      frequencyId:   form.frequencyId || undefined,
      formulaId:     form.formulaId || undefined,
      polarityId:    form.polarityId || undefined,
      rangeConfigId: form.rangeConfigId || undefined,
      responsibleId: form.responsibleId || undefined,
      unidadId:      form.unidadId || undefined,
      meta:          form.meta !== "" ? Number(form.meta) : undefined,
      vigenciaDesde: form.vigenciaDesde || undefined,
      vigenciaHasta: form.vigenciaHasta || undefined,
      observaciones: form.observaciones.trim() || undefined,
    };
  }

  async function handleSave() {
    setSaveError("");
    const params = toParams();

    const vResult = await validate.mutateAsync({
      ...params,
      excludeId: isEdit ? initialData!.id : undefined,
    } as Parameters<typeof validate.mutateAsync>[0]);

    if (!vResult.valid) {
      setErrors(vResult.errors);
      return;
    }

    try {
      if (isEdit) {
        await update.mutateAsync({ id: initialData!.id, ...params });
      } else {
        await create.mutateAsync(params);
      }
      router.push(`/ws/${wsId}/ide-listado`);
    } catch {
      setSaveError("Ocurrió un error al guardar. Intenta de nuevo.");
    }
  }

  // Preview panel values (resolved from loaded catalogs)
  const selObjective   = (objectives   ?? []).find((o) => o.id === form.objetivoId);
  const selDimension   = (dimensions   ?? []).find((d) => d.id === form.dimensionId);
  const selUnitMeasure = (unitMeasures ?? []).find((u) => u.id === form.unitMeasureId);
  const selFrequency   = (frequencies  ?? []).find((f) => f.id === form.frequencyId);
  const selFormula     = (formulas     ?? []).find((f) => f.id === form.formulaId);
  const selPolarity    = (polarities   ?? []).find((p) => p.id === form.polarityId);
  const selRangeConfig = (rangeConfigs ?? []).find((r) => r.id === form.rangeConfigId);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
      {/* ── Form ── */}
      <div className="space-y-4">
        <Section title="Identificación básica">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Código único" required error={fieldError(errors, "codigo")}>
              <input value={form.codigo} onChange={(e) => set("codigo", e.target.value)}
                placeholder="IND-001"
                className={`${INPUT} font-mono uppercase`} />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Nombre del indicador" required error={fieldError(errors, "nombre")}>
                <input value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
                  placeholder="Tasa de cumplimiento de actividades"
                  className={INPUT} />
              </FormField>
            </div>
          </div>
          <FormField label="Descripción">
            <textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Describe brevemente qué mide este indicador y su propósito institucional."
              rows={3}
              className={`${INPUT} resize-none`} />
          </FormField>
        </Section>

        <Section title="Clasificación estratégica">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Objetivo estratégico" error={fieldError(errors, "objetivoId")}>
              <select value={form.objetivoId} onChange={(e) => set("objetivoId", e.target.value)} className={SELECT}>
                <option value="">— Seleccionar objetivo —</option>
                {(objectives ?? []).map((o) => (
                  <option key={o.id} value={o.id}>{o.codigo} — {o.nombre}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Dimensión" error={fieldError(errors, "dimensionId")}>
              <select value={form.dimensionId} onChange={(e) => set("dimensionId", e.target.value)} className={SELECT}>
                <option value="">— Seleccionar dimensión —</option>
                {(dimensions ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.codigo} — {d.nombre}</option>
                ))}
              </select>
            </FormField>
          </div>
        </Section>

        <Section title="Motor de fórmulas y medición">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Fórmula (FormulaEngine)" required error={fieldError(errors, "formulaId")}>
              <select value={form.formulaId} onChange={(e) => set("formulaId", e.target.value)} className={SELECT}>
                <option value="">— Seleccionar fórmula —</option>
                {(formulas ?? []).map((f) => (
                  <option key={f.id} value={f.id}>{f.codigo} — {f.nombre}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Unidad de medida" error={fieldError(errors, "unitMeasureId")}>
              <select value={form.unitMeasureId} onChange={(e) => set("unitMeasureId", e.target.value)} className={SELECT}>
                <option value="">— Seleccionar unidad —</option>
                {(unitMeasures ?? []).map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre} ({u.tipo})</option>
                ))}
              </select>
            </FormField>
            <FormField label="Polaridad" error={fieldError(errors, "polarityId")}>
              <select value={form.polarityId} onChange={(e) => set("polarityId", e.target.value)} className={SELECT}>
                <option value="">— Seleccionar polaridad —</option>
                {(polarities ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Configuración de rangos" error={fieldError(errors, "rangeConfigId")}>
              <select value={form.rangeConfigId} onChange={(e) => set("rangeConfigId", e.target.value)} className={SELECT}>
                <option value="">— Seleccionar rangos —</option>
                {(rangeConfigs ?? []).map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Frecuencia de medición" error={fieldError(errors, "frequencyId")}>
              <select value={form.frequencyId} onChange={(e) => set("frequencyId", e.target.value)} className={SELECT}>
                <option value="">— Seleccionar frecuencia —</option>
                {(frequencies ?? []).map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Variables resolved from FormulaEngine */}
          {form.formulaId && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-[10px] font-semibold text-amber-700 mb-2">
                Variables de la fórmula <span className="font-normal">(resueltas automáticamente por VariableResolver)</span>
              </p>
              {!variables ? (
                <div className="animate-pulse h-5 rounded bg-amber-100 w-48" />
              ) : variables.length === 0 ? (
                <p className="text-[11px] text-amber-600 italic">Esta fórmula no tiene variables registradas.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {variables.map((v) => (
                    <span key={v.codigo} className="inline-flex items-center gap-1 rounded border border-amber-200 bg-white px-2 py-0.5 text-[10px]">
                      <span className="font-mono font-semibold text-amber-700">{v.codigo}</span>
                      <span className="text-amber-600">{v.nombre}</span>
                    </span>
                  ))}
                </div>
              )}
              {selFormula && (
                <p className="text-[10px] font-mono text-amber-800 mt-2 bg-amber-100 rounded px-2 py-1">
                  {selFormula.formulaVisible}
                </p>
              )}
            </div>
          )}
        </Section>

        <Section title="Responsabilidad institucional">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Responsable" error={fieldError(errors, "responsibleId")}>
              <select value={form.responsibleId} onChange={(e) => set("responsibleId", e.target.value)} className={SELECT}>
                <option value="">— Seleccionar responsable —</option>
                {(ispUsers ?? []).map((u: { id: string; fullName: string; email: string }) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Unidad organizacional" error={fieldError(errors, "unidadId")}>
              <input value={form.unidadId} onChange={(e) => set("unidadId", e.target.value)}
                placeholder="ID de la unidad"
                className={INPUT} />
            </FormField>
          </div>
        </Section>

        <Section title="Meta y vigencia">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Meta" error={fieldError(errors, "meta")}>
              <input type="number" step="any" value={form.meta}
                onChange={(e) => set("meta", e.target.value)}
                placeholder="Ej: 80"
                className={INPUT} />
            </FormField>
            <FormField label="Vigencia desde">
              <input type="date" value={form.vigenciaDesde}
                onChange={(e) => set("vigenciaDesde", e.target.value)}
                className={INPUT} />
            </FormField>
            <FormField label="Vigencia hasta">
              <input type="date" value={form.vigenciaHasta}
                onChange={(e) => set("vigenciaHasta", e.target.value)}
                className={INPUT} />
            </FormField>
          </div>
          <FormField label="Observaciones">
            <textarea value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)}
              placeholder="Notas adicionales, limitaciones, contexto de medición…"
              rows={2}
              className={`${INPUT} resize-none`} />
          </FormField>
        </Section>

        {/* Validation error summary */}
        {errors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-[11px] font-semibold text-red-700 mb-1">Se encontraron {errors.length} error{errors.length > 1 ? "es" : ""}</p>
            <ul className="space-y-0.5">
              {errors.map((e, i) => (
                <li key={i} className="text-[11px] text-red-600">• {e.message}</li>
              ))}
            </ul>
          </div>
        )}

        {saveError && (
          <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{saveError}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => void handleSave()}
            disabled={isPending}
            className="text-[12px] px-6 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 font-medium">
            {isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear indicador"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
            className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface disabled:opacity-50">
            Cancelar
          </button>
        </div>
      </div>

      {/* ── Live preview panel ── */}
      <div className="space-y-3 xl:sticky xl:top-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-3">Vista previa</p>

          {form.codigo || form.nombre ? (
            <div className="space-y-2">
              {form.codigo && (
                <p className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 rounded px-2 py-0.5 inline-block">
                  {form.codigo.toUpperCase()}
                </p>
              )}
              {form.nombre && (
                <p className="text-[13px] font-semibold text-amber-900 leading-snug">{form.nombre}</p>
              )}
              {form.descripcion && (
                <p className="text-[11px] text-amber-700">{form.descripcion}</p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-amber-600 italic">Completa el código y nombre para ver la vista previa.</p>
          )}

          {/* Resolved catalog values */}
          <div className="mt-3 space-y-1.5">
            {selObjective && <PreviewRow label="Objetivo" value={`${selObjective.codigo} — ${selObjective.nombre}`} />}
            {selDimension && <PreviewRow label="Dimensión" value={`${selDimension.codigo} — ${selDimension.nombre}`} />}
            {selFormula && (
              <>
                <PreviewRow label="Fórmula" value={selFormula.nombre} />
                <PreviewRow label="Expresión" value={selFormula.formulaVisible} mono />
              </>
            )}
            {selUnitMeasure && <PreviewRow label="Unidad" value={`${selUnitMeasure.nombre} (${selUnitMeasure.tipo})`} />}
            {selFrequency && <PreviewRow label="Frecuencia" value={selFrequency.nombre} />}
            {selPolarity && <PreviewRow label="Polaridad" value={selPolarity.nombre} />}
            {selRangeConfig && <PreviewRow label="Rangos" value={selRangeConfig.nombre} />}
            {form.meta !== "" && <PreviewRow label="Meta" value={form.meta} />}
          </div>

          {/* Variables preview */}
          {variables && variables.length > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-[10px] text-amber-600 mb-1.5">Variables ({variables.length})</p>
              <div className="space-y-1">
                {variables.map((v) => (
                  <div key={v.codigo} className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-800">{v.codigo}</span>
                    <span className="text-[10px] text-amber-700">{v.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required fields checklist */}
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-[10px] text-amber-600 mb-1.5">Campos requeridos</p>
            <div className="space-y-0.5">
              <CheckItem done={!!form.codigo} label="Código" />
              <CheckItem done={!!form.nombre} label="Nombre" />
              <CheckItem done={!!form.formulaId} label="Fórmula" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-sse-border bg-sse-surface p-3 text-[10px] text-sse-muted space-y-1">
          <p>El indicador se guardará como <strong className="text-sse-ink">Borrador</strong>.</p>
          <p>Para publicarlo, usa el menú de acciones desde el listado.</p>
          <p>Cada cambio guarda un snapshot de versión automáticamente.</p>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex gap-2 text-[10px]">
      <span className="text-amber-600 shrink-0 w-20">{label}</span>
      <span className={`text-amber-900 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span className={done ? "text-green-600" : "text-amber-300"}>
        {done ? "✓" : "○"}
      </span>
      <span className={done ? "text-amber-800" : "text-amber-500"}>{label}</span>
    </div>
  );
}
