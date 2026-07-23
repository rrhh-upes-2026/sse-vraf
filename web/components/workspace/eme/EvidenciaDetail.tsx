"use client";

import { useState } from "react";
import Link from "next/link";
import { useEMEEvidencia, useEMEEvidenciaActions, useEMEHistorial } from "@/hooks/useEME";
import { Skeleton } from "@/components/ui/skeleton";
import type { EMEStatus, EMEValidationStatus } from "@/types/eme";
import { EME_VALID_TRANSITIONS } from "@/types/eme";

interface Props {
  wsId: string;
  id:   string;
}

const STATUS_COLORS: Record<EMEStatus, string> = {
  "Pendiente":     "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Cargada":       "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "En validación": "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Validada":      "bg-sse-sem-green-bg text-sse-sem-green-fg",
  "Rechazada":     "bg-sse-sem-red-bg text-sse-sem-red-fg",
  "Archivada":     "bg-sse-muted/10 text-sse-muted",
};

const CONF_LABELS: Record<string, string> = {
  publica: "Pública", interna: "Interna", confidencial: "Confidencial", restringida: "Restringida",
};

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  const display = typeof value === "boolean" ? (value ? "Sí" : "No") : String(value);
  return (
    <div>
      <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">{label}</p>
      <p className="text-[13px] text-sse-ink mt-0.5">{display}</p>
    </div>
  );
}

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export function EvidenciaDetail({ wsId, id }: Props) {
  const { data: evidencia, isLoading } = useEMEEvidencia(id);
  const { data: historial = [] }       = useEMEHistorial(id);
  const { cambiarEstado, validar, archivar } = useEMEEvidenciaActions();
  const [changing, setChanging]        = useState(false);
  const [showValidate, setShowValidate]= useState(false);
  const [validationStatus, setValStatus] = useState<EMEValidationStatus>("aprobada");
  const [validationComments, setValComments] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-md" />
      </div>
    );
  }

  if (!evidencia) {
    return (
      <div className="text-center py-12 text-sse-muted">
        <p className="text-[14px]">Evidencia no encontrada.</p>
        <Link href={`/ws/${wsId}/eme-repositorio`} className="text-sse-primary text-[13px] mt-2 inline-block">
          Volver al repositorio
        </Link>
      </div>
    );
  }

  const transitions = EME_VALID_TRANSITIONS[evidencia.status] ?? [];
  const isArchived  = Boolean(evidencia.deletedAt) || evidencia.status === "Archivada";
  const tags        = parseTags(evidencia.tags);

  const handleTransition = async (newStatus: EMEStatus) => {
    setChanging(true);
    try {
      await cambiarEstado.mutateAsync({ id, status: newStatus });
    } finally {
      setChanging(false);
    }
  };

  const handleArchivar = async () => {
    if (!confirm("¿Archivar esta evidencia? Esta acción no se puede deshacer.")) return;
    setChanging(true);
    try {
      await archivar.mutateAsync({ id });
    } finally {
      setChanging(false);
    }
  };

  const handleValidar = async () => {
    setChanging(true);
    try {
      await validar.mutateAsync({ id, userId: "", validationStatus, validationComments });
      setShowValidate(false);
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1">
            <Link href={`/ws/${wsId}/eme-repositorio`} className="text-[12px] text-sse-muted hover:text-sse-ink">
              ← Repositorio
            </Link>
          </div>
          <h1 className="text-[18px] font-semibold text-sse-ink">{evidencia.title}</h1>
          <p className="text-[12px] text-sse-muted mt-0.5 font-mono">
            v{evidencia.version} · {evidencia.originalFileName || evidencia.fileName}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isArchived && (
            <span className="text-[11px] bg-sse-muted/10 text-sse-muted px-2 py-0.5 rounded-full">Archivada</span>
          )}
          {(evidencia.isConfidential === true || evidencia.isConfidential === "true") && (
            <span className="text-[11px] bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 px-2 py-0.5 rounded-full">
              {CONF_LABELS[evidencia.confidentialityLevel] ?? evidencia.confidentialityLevel}
            </span>
          )}
          <span className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium ${STATUS_COLORS[evidencia.status as EMEStatus]}`}>
            {evidencia.status}
          </span>
        </div>
      </div>

      {/* Main fields */}
      <div className="bg-sse-surface border border-sse-border rounded-md p-4 grid grid-cols-2 gap-4">
        <Field label="Tipo de evidencia"  value={evidencia.evidenceType?.replace(/-/g, " ")} />
        <Field label="Proveedor"          value={evidencia.storageProvider} />
        <Field label="Responsable"        value={evidencia.uploadedBy} />
        <Field label="Fecha de carga"     value={evidencia.uploadedAt?.slice(0, 10)} />
        <Field label="Ejecución"          value={evidencia.executionId} />
        <Field label="Plan"               value={evidencia.planId} />
        <Field label="Proceso"            value={evidencia.processId} />
        <Field label="Unidad"             value={evidencia.organizationalUnitId} />
        <Field label="Tamaño"             value={evidencia.fileSize ? `${Number(evidencia.fileSize).toLocaleString()} bytes` : undefined} />
        <Field label="Extensión"          value={evidencia.extension} />
        <Field label="MIME Type"          value={evidencia.mimeType} />
        <Field label="Vencimiento"        value={evidencia.expirationDate} />
        <Field label="Requerida"          value={evidencia.isRequired === true || evidencia.isRequired === "true"} />
        {evidencia.description && (
          <div className="col-span-2">
            <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">Descripción</p>
            <p className="text-[13px] text-sse-ink mt-0.5">{evidencia.description}</p>
          </div>
        )}
        {evidencia.storageReference && (
          <div className="col-span-2">
            <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">Referencia de almacenamiento</p>
            <p className="text-[12px] text-sse-ink mt-0.5 font-mono break-all">{evidencia.storageReference}</p>
          </div>
        )}
        {tags.length > 0 && (
          <div className="col-span-2">
            <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-1">Etiquetas</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-sse-primary/10 text-sse-primary px-2 py-0.5 text-[11px]">{t}</span>
              ))}
            </div>
          </div>
        )}
        {evidencia.notes && (
          <div className="col-span-2">
            <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">Notas</p>
            <p className="text-[13px] text-sse-ink mt-0.5">{evidencia.notes}</p>
          </div>
        )}
      </div>

      {/* Validation info */}
      {(evidencia.validatedBy || evidencia.validationComments) && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">Validación</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Validado por"  value={evidencia.validatedBy} />
            <Field label="Fecha"         value={evidencia.validatedAt?.slice(0, 10)} />
            <Field label="Resultado"     value={evidencia.validationStatus} />
            {evidencia.validationComments && (
              <div className="col-span-2">
                <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">Comentarios</p>
                <p className="text-[13px] text-sse-ink mt-0.5">{evidencia.validationComments}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {!isArchived && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">Acciones</p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((s) => (
              <button
                key={s}
                onClick={() => handleTransition(s as EMEStatus)}
                disabled={changing}
                className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[12px] font-medium text-sse-ink hover:border-sse-primary/50 transition-colors disabled:opacity-50"
              >
                → {s}
              </button>
            ))}
            {evidencia.status === "En validación" && (
              <button
                onClick={() => setShowValidate(!showValidate)}
                disabled={changing}
                className="rounded-md border border-violet-300 bg-sse-surface px-3 py-1.5 text-[12px] font-medium text-violet-700 hover:bg-violet-50 transition-colors disabled:opacity-50"
              >
                Validar / Rechazar
              </button>
            )}
            {!evidencia.deletedAt && evidencia.status !== "Archivada" && (
              <button
                onClick={handleArchivar}
                disabled={changing}
                className="rounded-md border border-sse-sem-red-fg/30 bg-sse-surface px-3 py-1.5 text-[12px] font-medium text-sse-sem-red-fg hover:bg-sse-sem-red-bg transition-colors disabled:opacity-50"
              >
                Archivar
              </button>
            )}
          </div>

          {/* Inline validation form */}
          {showValidate && (
            <div className="mt-4 space-y-3 border-t border-sse-border pt-4">
              <div>
                <label className="block text-[12px] font-medium text-sse-muted mb-1">Resultado de validación</label>
                <select
                  value={validationStatus}
                  onChange={(e) => setValStatus(e.target.value as EMEValidationStatus)}
                  className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
                >
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-sse-muted mb-1">Comentarios</label>
                <textarea
                  rows={3}
                  value={validationComments}
                  onChange={(e) => setValComments(e.target.value)}
                  className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
                  placeholder="Observaciones de la validación..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleValidar}
                  disabled={changing}
                  className="rounded-md bg-sse-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-sse-primary/90 transition-colors disabled:opacity-50"
                >
                  Confirmar
                </button>
                <button onClick={() => setShowValidate(false)} className="rounded-md border border-sse-border px-4 py-2 text-[13px] text-sse-muted hover:text-sse-ink transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      {Array.isArray(historial) && historial.length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
            Historial de cambios
          </p>
          <div className="space-y-2">
            {historial.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-[12px] py-1 border-b border-sse-border/50 last:border-0">
                <span className="font-mono text-sse-muted shrink-0">{h.createdAt?.slice(0, 10)}</span>
                <span className="font-medium text-sse-ink capitalize">{h.accion}</span>
                {h.estadoAnterior && h.estadoNuevo && (
                  <span className="text-sse-muted">{h.estadoAnterior} → {h.estadoNuevo}</span>
                )}
                {h.versionAnterior && h.versionNueva && (
                  <span className="text-sse-muted">v{h.versionAnterior} → v{h.versionNueva}</span>
                )}
                <span className="text-sse-muted">{h.usuario}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit */}
      <div className="text-[11px] text-sse-muted space-y-0.5">
        {evidencia.createdAt && <p>Creado: {evidencia.createdAt.slice(0, 10)} {evidencia.createdBy && `por ${evidencia.createdBy}`}</p>}
        {evidencia.updatedAt && <p>Actualizado: {evidencia.updatedAt.slice(0, 10)} {evidencia.updatedBy && `por ${evidencia.updatedBy}`}</p>}
      </div>
    </div>
  );
}
