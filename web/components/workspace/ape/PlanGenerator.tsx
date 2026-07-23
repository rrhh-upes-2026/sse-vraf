"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAPEGenerate } from "@/hooks/useAPE";
import { usePMEActividades } from "@/hooks/usePME";
import type { APEGenerateParams, APEPeriodicity, APEPriority, APEOccurrence } from "@/types/ape";

interface Props {
  wsId: string;
  activityId?: string;
}

const PERIODICITIES: APEPeriodicity[] = [
  "Única", "Diaria", "Semanal", "Quincenal", "Mensual",
  "Bimestral", "Trimestral", "Cuatrimestral", "Semestral", "Anual", "Personalizada",
];

const PRIORITIES: APEPriority[] = ["Alta", "Media", "Baja"];

const CURRENT_YEAR = new Date().getFullYear();

export function PlanGenerator({ wsId, activityId: initialActivityId }: Props) {
  const router = useRouter();
  const { generate, preview } = useAPEGenerate();
  const { data: actividades = [] } = usePMEActividades();

  const [params, setParams] = useState<APEGenerateParams>({
    activityId:  initialActivityId ?? "",
    year:        CURRENT_YEAR,
    periodicity: "Mensual",
    mode:        "nuevo",
    priority:    "Media",
  });
  const [customDates, setCustomDates] = useState("");
  const [previewData, setPreviewData] = useState<{ count: number; occurrences: APEOccurrence[] } | null>(null);
  const [previewError, setPreviewError] = useState("");

  const set = <K extends keyof APEGenerateParams>(k: K, v: APEGenerateParams[K]) =>
    setParams((p) => ({ ...p, [k]: v }));

  const handlePreview = async () => {
    setPreviewError("");
    setPreviewData(null);
    try {
      const result = await preview.mutateAsync({
        ...params,
        ...(params.periodicity === "Personalizada" && customDates ? { customDates } : {}),
      });
      setPreviewData(result);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Error al generar vista previa.");
    }
  };

  const handleGenerate = async () => {
    try {
      await generate.mutateAsync({
        ...params,
        ...(params.periodicity === "Personalizada" && customDates ? { customDates } : {}),
      });
      router.push(`/ws/${wsId}/ape-planes`);
    } catch {
      // error handled below
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-[16px] font-semibold text-sse-ink">Generación automática de planes</h2>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Genera registros de planificación a partir de una actividad PME.
        </p>
      </div>

      <div className="space-y-4 bg-sse-surface border border-sse-border rounded-md p-4">
        {/* Actividad */}
        <div>
          <label className="block text-[12px] font-medium text-sse-muted mb-1">Actividad PME *</label>
          <select
            value={params.activityId}
            onChange={(e) => set("activityId", e.target.value)}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
          >
            <option value="">Seleccionar actividad...</option>
            {actividades.map((a) => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>

        {/* Año */}
        <div>
          <label className="block text-[12px] font-medium text-sse-muted mb-1">Año *</label>
          <input
            type="number"
            min={2024}
            max={2040}
            value={params.year}
            onChange={(e) => set("year", parseInt(e.target.value, 10))}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
          />
        </div>

        {/* Periodicidad */}
        <div>
          <label className="block text-[12px] font-medium text-sse-muted mb-1">Periodicidad *</label>
          <select
            value={params.periodicity}
            onChange={(e) => set("periodicity", e.target.value as APEPeriodicity)}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
          >
            {PERIODICITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Custom dates (only for Personalizada) */}
        {params.periodicity === "Personalizada" && (
          <div>
            <label className="block text-[12px] font-medium text-sse-muted mb-1">
              Fechas personalizadas (JSON)
            </label>
            <textarea
              rows={3}
              placeholder='[{"startDate":"2026-01-15","endDate":"2026-01-20"}]'
              value={customDates}
              onChange={(e) => setCustomDates(e.target.value)}
              className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[12px] font-mono text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
            />
          </div>
        )}

        {/* Modo */}
        <div>
          <label className="block text-[12px] font-medium text-sse-muted mb-1">Modo de generación</label>
          <select
            value={params.mode}
            onChange={(e) => set("mode", e.target.value as APEGenerateParams["mode"])}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
          >
            <option value="nuevo">Nuevo — fallar si ya existen planes</option>
            <option value="regenerar">Regenerar — archivar existentes y crear nuevos</option>
            <option value="mantener">Mantener — agregar solo los que faltan</option>
            <option value="duplicar">Duplicar — crear en paralelo a los existentes</option>
          </select>
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-[12px] font-medium text-sse-muted mb-1">Prioridad</label>
          <select
            value={params.priority}
            onChange={(e) => set("priority", e.target.value as APEPriority)}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Título personalizado */}
        <div>
          <label className="block text-[12px] font-medium text-sse-muted mb-1">
            Título personalizado (opcional)
          </label>
          <input
            type="text"
            placeholder="Se genera automáticamente si se deja vacío"
            value={params.title ?? ""}
            onChange={(e) => set("title", e.target.value || undefined)}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
          />
        </div>
      </div>

      {/* Preview result */}
      {previewError && (
        <div className="rounded-md bg-sse-sem-red-bg border border-sse-sem-red-fg/30 px-4 py-3 text-[13px] text-sse-sem-red-fg">
          {previewError}
        </div>
      )}

      {previewData && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
            Vista previa — {previewData.count} planes a generar
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-sse-border">
                  <th className="px-2 py-1 text-left text-sse-muted font-medium">#</th>
                  <th className="px-2 py-1 text-left text-sse-muted font-medium">Inicio</th>
                  <th className="px-2 py-1 text-left text-sse-muted font-medium">Fin</th>
                  <th className="px-2 py-1 text-left text-sse-muted font-medium">Mes</th>
                  <th className="px-2 py-1 text-left text-sse-muted font-medium">Trimestre</th>
                </tr>
              </thead>
              <tbody>
                {previewData.occurrences.map((occ: APEOccurrence, i: number) => (
                  <tr key={i} className="border-b border-sse-border/50">
                    <td className="px-2 py-1 font-mono text-sse-muted">{occ.number}</td>
                    <td className="px-2 py-1 font-mono text-sse-ink">{occ.startDate}</td>
                    <td className="px-2 py-1 font-mono text-sse-ink">{occ.endDate}</td>
                    <td className="px-2 py-1 text-sse-muted">{occ.month}</td>
                    <td className="px-2 py-1 text-sse-muted">Q{occ.quarter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          disabled={!params.activityId || preview.isPending}
          className="rounded-md border border-sse-border bg-sse-surface px-4 py-2 text-[13px] font-medium text-sse-ink hover:border-sse-primary/50 transition-colors disabled:opacity-50"
        >
          {preview.isPending ? "Calculando..." : "Vista previa"}
        </button>
        <button
          onClick={handleGenerate}
          disabled={!params.activityId || generate.isPending}
          className="rounded-md bg-sse-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-sse-primary/90 transition-colors disabled:opacity-50"
        >
          {generate.isPending ? "Generando..." : "Generar planes"}
        </button>
      </div>

      {generate.error instanceof Error && (
        <p className="text-[13px] text-sse-sem-red-fg">{generate.error.message}</p>
      )}
    </div>
  );
}
