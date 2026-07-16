"use client";

import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/utils";

interface WorkspaceReportsProps {
  wsId: WorkspaceId;
}

// ── static data ───────────────────────────────────────────────────────────────

interface ReportTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string; // SVG path d
  frecuencia: string;
  lastGenerated: string; // mock date
  color: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "mensual-procesos",
    nombre: "Informe mensual de procesos",
    descripcion: "Resumen ejecutivo del estado de todos los procesos activos, avance y semáforo.",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    frecuencia: "Mensual",
    lastGenerated: "2026-06-30",
    color: "#2E6BE6",
  },
  {
    id: "dashboard-ejecutivo",
    nombre: "Dashboard ejecutivo",
    descripcion: "Vista consolidada con KPIs principales, semáforo y tendencias por unidad.",
    icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
    frecuencia: "Semanal",
    lastGenerated: "2026-07-07",
    color: "#E5A100",
  },
  {
    id: "indicadores-gestion",
    nombre: "Indicadores de gestión",
    descripcion: "Reporte detallado de todos los KPIs, metas y tendencias del período.",
    icon: "M4 20a8 8 0 1 1 16 0M12 14l4-4",
    frecuencia: "Trimestral",
    lastGenerated: "2026-06-01",
    color: "#12A150",
  },
  {
    id: "auditoria-evidencias",
    nombre: "Auditoría de evidencias",
    descripcion: "Listado completo de evidencias pendientes, cargadas, validadas y rechazadas.",
    icon: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    frecuencia: "Mensual",
    lastGenerated: "2026-06-28",
    color: "#5B4FD0",
  },
  {
    id: "avance-actividades",
    nombre: "Avance de actividades",
    descripcion: "Estado y progreso de cada actividad agrupada por proceso y responsable.",
    icon: "M9 11l3 3 8-8M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9",
    frecuencia: "Quincenal",
    lastGenerated: "2026-07-01",
    color: "#0F8A8A",
  },
];

// ── card ──────────────────────────────────────────────────────────────────────

function ReportCard({
  template,
  canExport,
}: {
  template: ReportTemplate;
  canExport: boolean;
}) {
  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-3">
      {/* Icon + title */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${template.color}18` }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-5 h-5" style={{ color: template.color }}>
            <path strokeLinecap="round" strokeLinejoin="round" d={template.icon} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug">{template.nombre}</p>
          <p className="text-[12px] text-sse-muted mt-0.5 line-clamp-2">{template.descripcion}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="gray">{template.frecuencia}</Badge>
          <span className="text-[11px] text-sse-muted">
            Generado:{" "}
            {fmtDate(template.lastGenerated)}
          </span>
        </div>
        {canExport && (
          <Button size="sm" variant="secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
              className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Generar
          </Button>
        )}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function WorkspaceReports({ wsId }: WorkspaceReportsProps) {
  const { hasPermission } = usePermissions();
  const canExport = hasPermission("report.export");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Reportes</h1>
        <Badge variant="info">{REPORT_TEMPLATES.length} plantillas</Badge>
      </div>

      {/* Note */}
      <Card>
        <CardContent className="flex items-start gap-3 py-3.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-5 h-5 text-sse-primary shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-[13px] font-medium text-sse-ink">Generación automática</p>
            <p className="text-[12px] text-sse-muted mt-0.5">
              Los reportes se generan automáticamente y se almacenan en Google Drive.
              Al hacer clic en &quot;Generar&quot; se producirá una nueva versión bajo demanda.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REPORT_TEMPLATES.map((t) => (
          <ReportCard key={t.id} template={t} canExport={canExport} />
        ))}
      </div>

      {!canExport && (
        <p className="text-[12px] text-sse-muted">
          No tienes permiso para generar reportes. Contacta al administrador.
        </p>
      )}
    </div>
  );
}
