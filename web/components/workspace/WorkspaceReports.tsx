"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { fmtDate } from "@/lib/utils";

interface WorkspaceReportsProps {
  wsId: WorkspaceId;
}

// ── data model ────────────────────────────────────────────────────────────────

type ReportEstado = "listo" | "generando" | "error";

interface ReportTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  frecuencia: string;
  version: string;
  estado: ReportEstado;
  fechaGeneracion: string;
  usuarioGenerador: string;
  filtros: string;
  color: string;
}

const ESTADO_BADGE: Record<ReportEstado, BadgeVariant> = {
  listo:      "success",
  generando:  "warning",
  error:      "danger",
};

const ESTADO_LABEL: Record<ReportEstado, string> = {
  listo:     "Listo",
  generando: "Generando…",
  error:     "Error",
};

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "mensual-procesos",
    nombre: "Informe mensual de procesos",
    descripcion: "Resumen ejecutivo del estado de todos los procesos activos, avance y semáforo.",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    frecuencia: "Mensual",
    version: "v3",
    estado: "listo",
    fechaGeneracion: "2026-06-30T14:23:00Z",
    usuarioGenerador: "Ana García",
    filtros: "Unidad: RRHH · Período: junio 2026",
    color: "#2E6BE6",
  },
  {
    id: "dashboard-ejecutivo",
    nombre: "Dashboard ejecutivo",
    descripcion: "Vista consolidada con KPIs principales, semáforo y tendencias por unidad.",
    icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
    frecuencia: "Semanal",
    version: "v12",
    estado: "listo",
    fechaGeneracion: "2026-07-07T08:00:00Z",
    usuarioGenerador: "Sistema automático",
    filtros: "Todas las unidades · Semana 27/2026",
    color: "#E5A100",
  },
  {
    id: "indicadores-gestion",
    nombre: "Indicadores de gestión",
    descripcion: "Reporte detallado de todos los KPIs, metas y tendencias del período.",
    icon: "M4 20a8 8 0 1 1 16 0M12 14l4-4",
    frecuencia: "Trimestral",
    version: "v2",
    estado: "listo",
    fechaGeneracion: "2026-06-01T09:15:00Z",
    usuarioGenerador: "Carlos Mendoza",
    filtros: "Período: Q2 2026 · Categoría: todos",
    color: "#12A150",
  },
  {
    id: "auditoria-evidencias",
    nombre: "Auditoría de evidencias",
    descripcion: "Listado completo de evidencias pendientes, cargadas, validadas y rechazadas.",
    icon: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    frecuencia: "Mensual",
    version: "v1",
    estado: "listo",
    fechaGeneracion: "2026-06-28T16:45:00Z",
    usuarioGenerador: "Ana García",
    filtros: "Estado: todos · Unidad: RRHH",
    color: "#5B4FD0",
  },
  {
    id: "avance-actividades",
    nombre: "Avance de actividades",
    descripcion: "Estado y progreso de cada actividad agrupada por proceso y responsable.",
    icon: "M9 11l3 3 8-8M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9",
    frecuencia: "Quincenal",
    version: "v5",
    estado: "listo",
    fechaGeneracion: "2026-07-01T11:30:00Z",
    usuarioGenerador: "Sistema automático",
    filtros: "Procesos activos · Ordenado por responsable",
    color: "#0F8A8A",
  },
];

// ── report card ───────────────────────────────────────────────────────────────

function ReportCard({
  template,
  canExport,
  isGenerating,
  onGenerate,
}: {
  template: ReportTemplate;
  canExport: boolean;
  isGenerating: boolean;
  onGenerate: (id: string) => void;
}) {
  const estado = isGenerating ? "generando" : template.estado;

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-3">
      {/* Icon + title row */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${template.color}18` }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-5 h-5"
            style={{ color: template.color }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={template.icon} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-sse-ink leading-snug">
              {template.nombre}
            </p>
            <Badge variant={ESTADO_BADGE[estado]} className="text-[10px]">
              {ESTADO_LABEL[estado]}
            </Badge>
          </div>
          <p className="text-[12px] text-sse-muted mt-0.5 line-clamp-2">{template.descripcion}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center gap-2 text-sse-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-3.5 h-3.5 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            Generado el{" "}
            <span className="font-medium text-sse-ink">{fmtDate(template.fechaGeneracion)}</span>
            {" "}por{" "}
            <span className="font-medium text-sse-ink">{template.usuarioGenerador}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sse-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-3.5 h-3.5 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          <span className="truncate">{template.filtros}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-sse-border">
        <div className="flex items-center gap-2">
          <Badge variant="gray">{template.frecuencia}</Badge>
          <span className="text-[10px] font-mono text-sse-muted">{template.version}</span>
        </div>
        {canExport && (
          <Button
            size="sm"
            variant="secondary"
            disabled={isGenerating}
            onClick={() => onGenerate(template.id)}
          >
            {isGenerating ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-3.5 h-3.5 animate-spin"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Generando…
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Regenerar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function WorkspaceReports({ wsId: _wsId }: WorkspaceReportsProps) {
  const { hasPermission } = usePermissions();
  const canExport = hasPermission("report.export");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  function handleGenerate(id: string) {
    setGeneratingId(id);
    setTimeout(() => setGeneratingId(null), 3000);
  }

  const readyCount = REPORT_TEMPLATES.filter((t) => t.estado === "listo").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Reportes</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">
            Plantillas de reporte institucional con generación automática
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">{readyCount} listos</Badge>
          <Badge variant="info">{REPORT_TEMPLATES.length} total</Badge>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-md border border-sse-border bg-sse-surface p-3.5 flex items-start gap-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-5 h-5 text-sse-primary shrink-0 mt-0.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-[13px] font-medium text-sse-ink">Generación automática</p>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Los reportes se generan automáticamente según su frecuencia y se almacenan en Google Drive.
            Haz clic en <strong>Regenerar</strong> para producir una nueva versión bajo demanda con los datos actuales.
          </p>
        </div>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REPORT_TEMPLATES.map((t) => (
          <ReportCard
            key={t.id}
            template={t}
            canExport={canExport}
            isGenerating={generatingId === t.id}
            onGenerate={handleGenerate}
          />
        ))}
      </div>

      {!canExport && (
        <p className="text-[12px] text-sse-muted">
          No tienes permiso para regenerar reportes. Contacta al administrador.
        </p>
      )}
    </div>
  );
}
