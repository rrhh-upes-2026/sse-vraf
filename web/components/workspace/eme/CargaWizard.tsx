"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEMEEvidenciaActions, useEMECatalogos } from "@/hooks/useEME";
import { useAEEEjecuciones } from "@/hooks/useAEE";
import type { EMECreateParams } from "@/types/eme";

interface Props {
  wsId:        string;
  executionId?: string;
}

const STEPS = [
  "Ejecución",
  "Información",
  "Metadatos",
  "Clasificación",
  "Resumen",
];

const INITIAL: EMECreateParams = {
  executionId:          "",
  title:                "",
  description:          "",
  evidenceType:         "",
  storageProvider:      "local",
  originalFileName:     "",
  fileName:             "",
  extension:            "",
  mimeType:             "",
  fileSize:             "",
  isRequired:           false,
  isConfidential:       false,
  confidentialityLevel: "interna",
  expirationDate:       "",
  tags:                 [],
  notes:                "",
  uploadedBy:           "",
};

export function CargaWizard({ wsId, executionId: initialExecutionId }: Props) {
  const router = useRouter();
  const { create }              = useEMEEvidenciaActions();
  const { data: tiposData }     = useEMECatalogos("tipoEvidencia");
  const { data: provData }      = useEMECatalogos("proveedorAlmacenamiento");
  const { data: confData }      = useEMECatalogos("nivelConfidencialidad");
  const { data: ejecucionesRaw} = useAEEEjecuciones({ _pageSize: 500 });

  const tipos        = tiposData?.items   ?? [];
  const proveedores  = provData?.items    ?? [];
  const confNiveles  = confData?.items    ?? [];
  const ejecuciones  = Array.isArray(ejecucionesRaw) ? ejecucionesRaw : [];

  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState<EMECreateParams>({
    ...INITIAL,
    executionId: initialExecutionId ?? "",
  });
  const [tagInput, setTagInput] = useState("");
  const [error, setError]       = useState("");

  const set = <K extends keyof EMECreateParams>(k: K, v: EMECreateParams[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const selectedExecution = ejecuciones.find((e) => e.id === form.executionId);

  function addTag(t: string) {
    const cleaned = t.trim();
    if (!cleaned) return;
    const current = form.tags ?? [];
    if (!current.includes(cleaned)) {
      set("tags", [...current, cleaned]);
    }
    setTagInput("");
  }

  function removeTag(t: string) {
    set("tags", (form.tags ?? []).filter((x) => x !== t));
  }

  function validateStep(): string {
    switch (step) {
      case 0:
        if (!form.executionId) return "Selecciona una ejecución asociada.";
        return "";
      case 1:
        if (!form.title)        return "El título de la evidencia es requerido.";
        if (!form.evidenceType) return "Selecciona el tipo de evidencia.";
        if (!form.uploadedBy)   return "El responsable es requerido.";
        return "";
      case 2:
        return "";
      case 3:
        return "";
      default:
        return "";
    }
  }

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => { setError(""); setStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    try {
      await create.mutateAsync(form);
      router.push(`/ws/${wsId}/eme-repositorio`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar la evidencia.");
    }
  };

  const inputCls = "w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary";
  const labelCls = "block text-[12px] font-medium text-sse-muted mb-1";

  return (
    <div className="space-y-6 max-w-xl">
      {/* Step indicator */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full transition-colors ${
              i < step ? "bg-sse-primary" : i === step ? "bg-sse-primary/60" : "bg-sse-border"
            }`} />
            <span className={`text-[10px] ${i === step ? "text-sse-primary font-medium" : "text-sse-muted"}`}>
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-[16px] font-semibold text-sse-ink">
          Paso {step + 1}: {STEPS[step]}
        </h2>
      </div>

      {/* Step 0: Seleccionar ejecución */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Ejecución asociada *</label>
            <select
              value={form.executionId}
              onChange={(e) => set("executionId", e.target.value)}
              className={inputCls}
            >
              <option value="">Seleccionar ejecución...</option>
              {ejecuciones.map((e) => (
                <option key={e.id} value={e.id}>
                  #{e.executionNumber} — {e.executedBy} ({e.executionDate})
                </option>
              ))}
            </select>
          </div>
          {selectedExecution && (
            <div className="bg-sse-muted/5 rounded-md border border-sse-border p-3 text-[12px] space-y-1">
              <p><span className="text-sse-muted">Estado:</span> <span className="text-sse-ink">{selectedExecution.status}</span></p>
              <p><span className="text-sse-muted">Ejecutado por:</span> <span className="text-sse-ink">{selectedExecution.executedBy}</span></p>
              <p><span className="text-sse-muted">Fecha:</span> <span className="text-sse-ink font-mono">{selectedExecution.executionDate}</span></p>
              {selectedExecution.planId && (
                <p><span className="text-sse-muted">Plan:</span> <span className="text-sse-ink">{selectedExecution.planId}</span></p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Información */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Título *</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="Nombre descriptivo de la evidencia" />
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className={inputCls} placeholder="Describe el contenido y propósito de esta evidencia..." />
          </div>
          <div>
            <label className={labelCls}>Tipo de evidencia *</label>
            <select value={form.evidenceType} onChange={(e) => set("evidenceType", e.target.value)} className={inputCls}>
              <option value="">Seleccionar tipo...</option>
              {tipos.map((t) => <option key={t.id} value={t.valor}>{t.etiqueta}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Proveedor de almacenamiento</label>
            <select value={form.storageProvider ?? "local"} onChange={(e) => set("storageProvider", e.target.value)} className={inputCls}>
              {proveedores.map((p) => <option key={p.id} value={p.valor}>{p.etiqueta}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Responsable (ID o nombre) *</label>
            <input type="text" value={form.uploadedBy} onChange={(e) => set("uploadedBy", e.target.value)} className={inputCls} placeholder="ID o nombre del responsable" />
          </div>
        </div>
      )}

      {/* Step 2: Metadatos */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Nombre original del archivo</label>
            <input type="text" value={form.originalFileName ?? ""} onChange={(e) => set("originalFileName", e.target.value)} className={inputCls} placeholder="documento-capacitacion.pdf" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Extensión</label>
              <input type="text" value={form.extension ?? ""} onChange={(e) => set("extension", e.target.value)} className={inputCls} placeholder="pdf, docx, xlsx..." />
            </div>
            <div>
              <label className={labelCls}>Tamaño (bytes)</label>
              <input type="number" min={0} value={form.fileSize ?? ""} onChange={(e) => set("fileSize", e.target.value)} className={inputCls} placeholder="0" />
            </div>
          </div>
          <div>
            <label className={labelCls}>MIME Type</label>
            <input type="text" value={form.mimeType ?? ""} onChange={(e) => set("mimeType", e.target.value)} className={inputCls} placeholder="application/pdf" />
          </div>
          <div>
            <label className={labelCls}>Notas</label>
            <textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className={inputCls} placeholder="Observaciones adicionales sobre la evidencia..." />
          </div>
          <div>
            <label className={labelCls}>Fecha de vencimiento</label>
            <input type="date" value={form.expirationDate ?? ""} onChange={(e) => set("expirationDate", e.target.value)} className={inputCls} />
          </div>
        </div>
      )}

      {/* Step 3: Clasificación */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Nivel de confidencialidad</label>
            <select value={form.confidentialityLevel ?? "interna"} onChange={(e) => set("confidentialityLevel", e.target.value)} className={inputCls}>
              {confNiveles.map((c) => <option key={c.id} value={c.valor}>{c.etiqueta}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={Boolean(form.isRequired)} onChange={(e) => set("isRequired", e.target.checked)} className="w-4 h-4 rounded border-sse-border" />
              <span className="text-[13px] text-sse-ink">Esta evidencia es requerida por la ejecución</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={Boolean(form.isConfidential)} onChange={(e) => set("isConfidential", e.target.checked)} className="w-4 h-4 rounded border-sse-border" />
              <span className="text-[13px] text-sse-ink">Marcar como confidencial</span>
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>Etiquetas</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                className="flex-1 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
                placeholder="Escribir etiqueta y presionar Enter..."
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
              >
                Agregar
              </button>
            </div>
            {(form.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(form.tags ?? []).map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-sse-primary/10 text-sse-primary px-2 py-0.5 text-[11px]">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-sse-sem-red-fg">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Resumen */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-sse-surface border border-sse-border rounded-md p-4 space-y-2 text-[13px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div><span className="text-sse-muted">Ejecución:</span> <span className="text-sse-ink font-mono">{selectedExecution ? `#${selectedExecution.executionNumber}` : form.executionId}</span></div>
              <div><span className="text-sse-muted">Título:</span> <span className="text-sse-ink font-medium">{form.title}</span></div>
              <div><span className="text-sse-muted">Tipo:</span> <span className="text-sse-ink">{form.evidenceType?.replace(/-/g, " ")}</span></div>
              <div><span className="text-sse-muted">Proveedor:</span> <span className="text-sse-ink">{form.storageProvider}</span></div>
              <div><span className="text-sse-muted">Responsable:</span> <span className="text-sse-ink">{form.uploadedBy}</span></div>
              <div><span className="text-sse-muted">Versión inicial:</span> <span className="text-sse-ink font-mono">1.0</span></div>
              <div><span className="text-sse-muted">Confidencial.:</span> <span className="text-sse-ink">{form.confidentialityLevel}</span></div>
              <div><span className="text-sse-muted">Requerida:</span> <span className="text-sse-ink">{form.isRequired ? "Sí" : "No"}</span></div>
            </div>
            {(form.tags ?? []).length > 0 && (
              <div className="pt-2 border-t border-sse-border">
                <p className="text-sse-muted text-[11px] mb-1">Etiquetas</p>
                <div className="flex flex-wrap gap-1">
                  {(form.tags ?? []).map((t) => (
                    <span key={t} className="rounded-full bg-sse-primary/10 text-sse-primary px-2 py-0.5 text-[11px]">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {form.description && (
              <div className="pt-2 border-t border-sse-border">
                <p className="text-sse-muted text-[11px] mb-0.5">Descripción</p>
                <p className="text-sse-ink">{form.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-sse-sem-red-bg border border-sse-sem-red-fg/30 px-4 py-2 text-[13px] text-sse-sem-red-fg">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3 pt-2">
        <button
          onClick={prev}
          disabled={step === 0}
          className="rounded-md border border-sse-border bg-sse-surface px-4 py-2 text-[13px] font-medium text-sse-ink hover:border-sse-primary/50 transition-colors disabled:opacity-40"
        >
          Anterior
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="rounded-md bg-sse-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-sse-primary/90 transition-colors"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={create.isPending}
            className="rounded-md bg-sse-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-sse-primary/90 transition-colors disabled:opacity-50"
          >
            {create.isPending ? "Guardando..." : "Registrar evidencia"}
          </button>
        )}
      </div>
    </div>
  );
}
