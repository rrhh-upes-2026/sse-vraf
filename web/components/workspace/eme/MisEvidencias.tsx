"use client";

import Link from "next/link";
import { useState } from "react";
import { useEMEMisEvidencias } from "@/hooks/useEME";
import { Skeleton } from "@/components/ui/skeleton";
import type { EMEEvidence, EMEStatus } from "@/types/eme";

interface Props {
  wsId:    string;
  userId:  string;
}

const STATUS_COLORS: Record<EMEStatus, string> = {
  "Pendiente":     "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Cargada":       "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "En validación": "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Validada":      "bg-sse-sem-green-bg text-sse-sem-green-fg",
  "Rechazada":     "bg-sse-sem-red-bg text-sse-sem-red-fg",
  "Archivada":     "bg-sse-muted/10 text-sse-muted",
};

type SortKey = "fecha" | "titulo" | "estado" | "tipo";

export function MisEvidencias({ wsId, userId }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [statusFilter, setStatus] = useState<EMEStatus | "">("");

  const { data, isLoading } = useEMEMisEvidencias(userId, {
    ...(statusFilter ? { status: statusFilter } : {}),
  });

  const items: EMEEvidence[] = data?.items ?? [];

  const sorted = [...items].sort((a, b) => {
    switch (sortKey) {
      case "fecha":  return (b.uploadedAt || "").localeCompare(a.uploadedAt || "");
      case "titulo": return a.title.localeCompare(b.title);
      case "estado": return a.status.localeCompare(b.status);
      case "tipo":   return (a.evidenceType || "").localeCompare(b.evidenceType || "");
      default:       return 0;
    }
  });

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSortKey(k)}
      className={`px-3 py-1 rounded text-[12px] font-medium transition-colors ${
        sortKey === k
          ? "bg-sse-primary text-white"
          : "bg-sse-surface border border-sse-border text-sse-muted hover:text-sse-ink"
      }`}
    >
      {label}
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-md" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[12px] text-sse-muted">Ordenar:</span>
          <SortBtn k="fecha"  label="Fecha" />
          <SortBtn k="titulo" label="Título" />
          <SortBtn k="estado" label="Estado" />
          <SortBtn k="tipo"   label="Tipo" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value as EMEStatus | "")}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
        >
          <option value="">Todos los estados</option>
          {(["Pendiente", "Cargada", "En validación", "Validada", "Rechazada", "Archivada"] as EMEStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-sse-muted">
          No tienes evidencias registradas.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((e: EMEEvidence) => (
            <Link
              key={e.id}
              href={`/ws/${wsId}/eme-evidencias/${e.id}`}
              className="block bg-sse-surface border border-sse-border rounded-md p-4 hover:border-sse-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[e.status as EMEStatus] ?? "bg-sse-muted/10 text-sse-muted"}`}>
                      {e.status}
                    </span>
                    <span className="text-[11px] text-sse-muted font-mono">v{e.version}</span>
                    {(e.isConfidential === true || e.isConfidential === "true") && (
                      <span className="text-[11px] bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 px-1.5 py-0.5 rounded-full">
                        Confidencial
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-sse-ink leading-snug">{e.title}</p>
                  <div className="flex gap-3 mt-1 text-[11px] text-sse-muted flex-wrap">
                    <span>{e.evidenceType?.replace(/-/g, " ")}</span>
                    <span>{e.uploadedAt?.slice(0, 10)}</span>
                    {e.originalFileName && <span className="truncate max-w-[180px]">{e.originalFileName}</span>}
                  </div>
                </div>
                <div className="shrink-0">
                  {e.validationStatus === "rechazada" && (
                    <span className="text-[11px] text-sse-sem-red-fg font-medium">Rechazada</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-[12px] text-sse-muted">{sorted.length} evidencias</p>
    </div>
  );
}
