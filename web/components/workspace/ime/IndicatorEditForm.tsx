"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIMEIndicador, useIMEIndicadorActions, useIMECatalogosPorTipo } from "@/hooks/useIME";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { IMEIndicador } from "@/types/ime";

interface Props {
  wsId: string;
  indicadorId: string;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-sse-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function IndicatorEditForm({ wsId, indicadorId }: Props) {
  const router = useRouter();
  const { data: ind, isLoading } = useIMEIndicador(indicadorId);
  const { update }               = useIMEIndicadorActions();

  const { data: tipos }        = useIMECatalogosPorTipo("tipoIndicador");
  const { data: unidades }     = useIMECatalogosPorTipo("unidadMedida");
  const { data: frecuencias }  = useIMECatalogosPorTipo("frecuencia");
  const { data: procesos }     = useIMECatalogosPorTipo("proceso");
  const { data: pilares }      = useIMECatalogosPorTipo("pilarEstrategico");
  const { data: objetivos }    = useIMECatalogosPorTipo("objetivoEstrategico");

  const [form, setForm] = useState<Partial<IMEIndicador> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ind && !form) setForm({ ...ind });
  }, [ind, form]);

  function patch(updates: Partial<IMEIndicador>) {
    setForm((prev) => prev ? { ...prev, ...updates } : updates);
    setError(null);
  }

  function submit() {
    if (!form) return;
    if (!form.code?.trim() || !form.name?.trim()) {
      setError("Código y nombre son requeridos");
      return;
    }
    update.mutate(
      { id: indicadorId, patch: form },
      {
        onSuccess: () => router.push(`/ws/${wsId}/gestion-indicadores/${indicadorId}`),
        onError: (err) => setError(String(err instanceof Error ? err.message : err)),
      },
    );
  }

  if (isLoading || !form) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 rounded-md" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Editar Indicador</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">{ind?.code} — {ind?.name}</p>
      </div>

      <div className="bg-sse-surface border border-sse-border rounded-md p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Código" required>
            <Input value={form.code ?? ""} onChange={(e) => patch({ code: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Versión">
            <Input value={String(form.version ?? "")} onChange={(e) => patch({ version: e.target.value })} />
          </Field>
        </div>

        <Field label="Nombre" required>
          <Input value={form.name ?? ""} onChange={(e) => patch({ name: e.target.value })} maxLength={120} />
        </Field>

        <Field label="Descripción">
          <textarea
            value={String(form.description ?? "")}
            onChange={(e) => patch({ description: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo de Indicador">
            <Select
              value={String(form.indicatorType ?? "")}
              onValueChange={(v) => patch({ indicatorType: v })}
              options={[{ value: "", label: "Sin tipo" }, ...(tipos ?? []).map((t) => ({ value: t.nombre, label: t.nombre }))]}
            />
          </Field>
          <Field label="Año">
            <Input type="number" value={String(form.year ?? "")} onChange={(e) => patch({ year: e.target.value })} min={2020} max={2035} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Unidad de Medida" required>
            <Select
              value={String(form.measurementUnit ?? "")}
              onValueChange={(v) => patch({ measurementUnit: v })}
              options={[{ value: "", label: "Seleccionar…" }, ...(unidades ?? []).map((u) => ({ value: u.nombre, label: u.nombre }))]}
            />
          </Field>
          <Field label="Frecuencia" required>
            <Select
              value={String(form.frequency ?? "")}
              onValueChange={(v) => patch({ frequency: v })}
              options={[{ value: "", label: "Seleccionar…" }, ...(frecuencias ?? []).map((f) => ({ value: f.nombre, label: f.nombre }))]}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo de Cálculo">
            <Select
              value={String(form.calculationType ?? "promedio")}
              onValueChange={(v) => patch({ calculationType: v as IMEIndicador["calculationType"] })}
              options={[
                { value: "promedio", label: "Promedio" },
                { value: "suma",     label: "Suma" },
                { value: "ultimo",   label: "Último valor" },
                { value: "minimo",   label: "Mínimo" },
                { value: "maximo",   label: "Máximo" },
              ]}
            />
          </Field>
          <Field label="Polaridad">
            <Select
              value={String(form.polarity ?? "positiva")}
              onValueChange={(v) => patch({ polarity: v as IMEIndicador["polarity"] })}
              options={[
                { value: "positiva", label: "Positiva" },
                { value: "negativa", label: "Negativa" },
                { value: "neutra",   label: "Neutra" },
              ]}
            />
          </Field>
        </div>

        <Field label="Proceso" required>
          <Select
            value={String(form.processId ?? "")}
            onValueChange={(v) => patch({ processId: v })}
            options={[{ value: "", label: "Seleccionar…" }, ...(procesos ?? []).map((p) => ({ value: p.id, label: p.nombre }))]}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Valor Meta" required>
            <Input type="number" value={String(form.targetValue ?? "")} onChange={(e) => patch({ targetValue: e.target.value })} step="any" />
          </Field>
          <Field label="Umbral Advertencia">
            <Input type="number" value={String(form.warningThreshold ?? "")} onChange={(e) => patch({ warningThreshold: e.target.value })} step="any" />
          </Field>
          <Field label="Umbral Crítico">
            <Input type="number" value={String(form.criticalThreshold ?? "")} onChange={(e) => patch({ criticalThreshold: e.target.value })} step="any" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cargo Responsable">
            <Input value={String(form.responsiblePosition ?? "")} onChange={(e) => patch({ responsiblePosition: e.target.value })} />
          </Field>
          <Field label="Usuario Responsable">
            <Input value={String(form.responsibleUser ?? "")} onChange={(e) => patch({ responsibleUser: e.target.value })} />
          </Field>
        </div>

        <Field label="Observaciones">
          <textarea
            value={String(form.observations ?? "")}
            onChange={(e) => patch({ observations: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-md border border-sse-sem-red-border bg-sse-sem-red-bg px-3 py-2 text-[12px] text-sse-sem-red-fg">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button size="sm" onClick={submit} disabled={update.isPending}>
          {update.isPending ? "Guardando…" : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
