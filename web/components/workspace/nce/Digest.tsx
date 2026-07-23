"use client";

import { useState } from "react";
import { useNCEDigests, useGenerateNCEDigest } from "@/hooks/useNCE";
import type { NCEDigestFrequency, NCEDigestStatus } from "@/types/nce";

const STATUS_COLOR: Record<NCEDigestStatus, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  generado:  "bg-blue-100 text-blue-700",
  entregado: "bg-green-100 text-green-700",
  fallido:   "bg-red-100 text-red-700",
};

const FREQ_LABELS: Record<NCEDigestFrequency, string> = {
  diario:    "Diario",
  semanal:   "Semanal",
  quincenal: "Quincenal",
};

function fmtDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function NCEDigest({ wsId }: { wsId: string }) {
  void wsId;
  const [statusFilter, setStatusFilter] = useState<NCEDigestStatus | "">("");
  const [freqFilter, setFreqFilter]     = useState<NCEDigestFrequency | "">("");
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [genFreq, setGenFreq]           = useState<NCEDigestFrequency>("diario");

  const params = {
    status:    statusFilter || undefined,
    frequency: freqFilter   || undefined,
  };

  const { data = [], isLoading } = useNCEDigests(params);
  const generate = useGenerateNCEDigest();

  function handleGenerate() {
    generate.mutate({
      recipientId:    "USR-VRAF-001",
      frequency:      genFreq,
    });
  }

  return (
    <div className="space-y-4">
      {/* Generate panel */}
      <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-[11px] text-sse-muted mb-1">Frecuencia del digest</label>
          <select
            value={genFreq}
            onChange={(e) => setGenFreq(e.target.value as NCEDigestFrequency)}
            className="text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
          >
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generate.isPending}
          className="text-[12px] px-4 py-1.5 rounded bg-[#0369A1] text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {generate.isPending ? "Generando…" : "Generar Digest"}
        </button>
        {generate.isSuccess && (
          <span className="text-[12px] text-green-600">Digest generado</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as NCEDigestStatus | "")}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="generado">Generado</option>
          <option value="entregado">Entregado</option>
          <option value="fallido">Fallido</option>
        </select>
        <select
          value={freqFilter}
          onChange={(e) => setFreqFilter(e.target.value as NCEDigestFrequency | "")}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
        >
          <option value="">Todas las frecuencias</option>
          <option value="diario">Diario</option>
          <option value="semanal">Semanal</option>
          <option value="quincenal">Quincenal</option>
        </select>
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-sse-border" />
          ))}
        </div>
      )}

      {!isLoading && data.length === 0 && (
        <p className="text-center text-[13px] text-sse-muted py-8">No hay digests generados</p>
      )}

      <ul className="space-y-2">
        {data.map((d) => {
          const isOpen = expandedId === d.id;
          const summary = d.summary as Record<string, unknown>;
          return (
            <li key={d.id} className="rounded-lg border border-sse-border bg-sse-surface overflow-hidden">
              <button
                onClick={() => setExpandedId(isOpen ? null : d.id)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-sse-border/30 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${STATUS_COLOR[d.status]}`}>
                      {d.status}
                    </span>
                    <span className="text-[11px] text-sse-muted">
                      {FREQ_LABELS[d.frequency]}
                    </span>
                    <span className="text-[11px] font-semibold text-sse-ink">
                      {d.notificationCount} notificaciones
                    </span>
                  </div>
                  <p className="text-[11px] text-sse-muted">
                    Período: {d.periodStart} → {d.periodEnd} · Destinatario: {d.recipientEmail}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-sse-muted">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-sse-border pt-3 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Total",    value: summary.total    ?? d.notificationCount },
                      { label: "Urgentes", value: summary.urgent   ?? "—" },
                      { label: "Alta",     value: summary.alta     ?? "—" },
                      { label: "Sin leer", value: summary.unread   ?? "—" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded bg-sse-border/30 px-3 py-2">
                        <p className="text-[10px] text-sse-muted">{kpi.label}</p>
                        <p className="text-[18px] font-bold text-sse-ink">{String(kpi.value)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-sse-muted space-y-0.5">
                    <p>ID: <code className="font-mono">{d.id}</code></p>
                    <p>Generado: {fmtDate(d.generatedAt)}</p>
                    <p>Entregado: {fmtDate(d.deliveredAt)}</p>
                    <p>Creado: {fmtDate(d.createdAt)}</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
