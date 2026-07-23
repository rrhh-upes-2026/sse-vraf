"use client";

import { useState } from "react";
import Link from "next/link";
import { useEMEEvidencias, useEMEEvidenciaActions } from "@/hooks/useEME";
import { Skeleton } from "@/components/ui/skeleton";
import type { EMEEvidence, EMEValidationStatus } from "@/types/eme";

interface Props {
  wsId: string;
}

export function ValidacionPanel({ wsId }: Props) {
  const { data: rawData, isLoading } = useEMEEvidencias({
    status: "En validación",
    _pageSize: 200,
  });

  const { validar } = useEMEEvidenciaActions();

  const [activeId, setActiveId]       = useState<string | null>(null);
  const [valStatus, setValStatus]     = useState<EMEValidationStatus>("aprobada");
  const [comments, setComments]       = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");

  const items: EMEEvidence[] = Array.isArray(rawData)
    ? rawData
    : (rawData as { items?: EMEEvidence[] })?.items ?? [];

  const handleValidar = async (id: string) => {
    setSubmitting(true);
    setError("");
    try {
      await validar.mutateAsync({ id, userId: "", validationStatus: valStatus, validationComments: comments });
      setActiveId(null);
      setComments("");
      setValStatus("aprobada");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al validar.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-md" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-sse-muted">
          No hay evidencias pendientes de validación.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((e: EMEEvidence) => (
            <div key={e.id} className="bg-sse-surface border border-sse-border rounded-md p-4">
              {/* Evidence header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/ws/${wsId}/eme-evidencias/${e.id}`}
                    className="text-[14px] font-semibold text-sse-ink hover:text-sse-primary transition-colors"
                  >
                    {e.title}
                  </Link>
                  <div className="flex gap-3 mt-1 text-[12px] text-sse-muted flex-wrap">
                    <span className="capitalize">{e.evidenceType?.replace(/-/g, " ")}</span>
                    <span>v{e.version}</span>
                    <span>Cargado por {e.uploadedBy}</span>
                    <span>{e.uploadedAt?.slice(0, 10)}</span>
                  </div>
                  {e.description && (
                    <p className="text-[12px] text-sse-muted mt-1 line-clamp-2">{e.description}</p>
                  )}
                  {e.storageReference && (
                    <p className="text-[11px] text-sse-muted mt-1 font-mono truncate">{e.storageReference}</p>
                  )}
                </div>
                <button
                  onClick={() => setActiveId(activeId === e.id ? null : e.id)}
                  className="shrink-0 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[12px] font-medium text-sse-ink hover:border-sse-primary/50 transition-colors"
                >
                  {activeId === e.id ? "Cancelar" : "Validar"}
                </button>
              </div>

              {/* Inline validation form */}
              {activeId === e.id && (
                <div className="border-t border-sse-border pt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-sse-muted mb-1">Resultado</label>
                      <select
                        value={valStatus}
                        onChange={(ev) => setValStatus(ev.target.value as EMEValidationStatus)}
                        className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
                      >
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-sse-muted mb-1">Comentarios de validación</label>
                    <textarea
                      rows={2}
                      value={comments}
                      onChange={(ev) => setComments(ev.target.value)}
                      className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
                      placeholder="Observaciones sobre la evidencia..."
                    />
                  </div>
                  {error && (
                    <p className="text-[12px] text-sse-sem-red-fg">{error}</p>
                  )}
                  <button
                    onClick={() => handleValidar(e.id)}
                    disabled={submitting}
                    className="rounded-md bg-sse-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-sse-primary/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Guardando..." : "Confirmar"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[12px] text-sse-muted">
        {items.length} evidencia{items.length !== 1 ? "s" : ""} en validación
      </p>
    </div>
  );
}
