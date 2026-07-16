"use client";

import Link from "next/link";
import { VRAF_WORKSPACE, STUDIO_TOOLS, type WorkspaceId } from "@/config/nav";
import { moduleRegistry } from "@/lib/sdk/registry";
import type { StudioTool } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/permissions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkspaceConfigProps {
  wsId: WorkspaceId;
}

// ── permission mapping ────────────────────────────────────────────────────────

// Map studio tool slug to the required permission
const STUDIO_PERMISSIONS: Record<string, Permission> = {
  "process-builder":   "processBuilder.access",
  "form-builder":      "formBuilder.access",
  "data-studio":       "dataStudio.access",
  "dashboard-builder": "studio.access",
  "report-builder":    "report.export",
};

// ── sub-components ────────────────────────────────────────────────────────────

function UnitInfoSection({ wsId }: { wsId: WorkspaceId }) {
  const allWorkspaces = [VRAF_WORKSPACE, ...moduleRegistry.getWorkspaceUnits()];
  const unit = allWorkspaces.find((u) => u.id === wsId);
  if (!unit) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la unidad</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Color swatch + name */}
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-md border border-sse-border shrink-0 flex items-center justify-center"
            style={{ backgroundColor: unit.bg }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
              className="w-6 h-6" style={{ color: unit.color }}>
              <path strokeLinecap="round" strokeLinejoin="round" d={unit.icon} />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-sse-ink">{unit.full}</p>
            <p className="text-[12px] text-sse-muted mt-0.5">{unit.short}</p>
          </div>
        </div>

        {/* Fields table */}
        <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[13px]">
          <span className="text-sse-muted font-medium">ID de workspace</span>
          <span className="font-mono text-sse-ink">{unit.id}</span>

          <span className="text-sse-muted font-medium">Nombre completo</span>
          <span className="text-sse-ink">{unit.full}</span>

          <span className="text-sse-muted font-medium">Color institucional</span>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm border border-sse-border inline-block"
              style={{ backgroundColor: unit.color }}
            />
            <span className="font-mono text-sse-ink text-[12px]">{unit.color}</span>
          </div>

          <span className="text-sse-muted font-medium">Color de fondo</span>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm border border-sse-border inline-block"
              style={{ backgroundColor: unit.bg }}
            />
            <span className="font-mono text-sse-ink text-[12px]">{unit.bg}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StudioToolCard({ tool, allowed }: { tool: StudioTool; allowed: boolean }) {
  const content = (
    <div
      className={
        "bg-sse-surface rounded-md border border-sse-border p-4 flex gap-3 transition-colors " +
        (allowed ? "hover:border-sse-primary/50 hover:shadow-sm cursor-pointer" : "opacity-50 cursor-not-allowed")
      }
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-md shrink-0 flex items-center justify-center"
        style={{ backgroundColor: `${tool.color}18` }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
          className="w-5 h-5" style={{ color: tool.color }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-sse-ink">{tool.label}</p>
          {!allowed && (
            <Badge variant="gray">Sin permiso</Badge>
          )}
        </div>
        <p className="text-[12px] text-sse-muted mt-0.5">{tool.description}</p>
      </div>

      {/* Arrow */}
      {allowed && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
          className="w-4 h-4 text-sse-muted shrink-0 self-center">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );

  if (!allowed) return <div>{content}</div>;

  return (
    <Link href={`/studio/${tool.slug}`} className="block">
      {content}
    </Link>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function WorkspaceConfig({ wsId }: WorkspaceConfigProps) {
  const { hasPermission, isLoaded } = usePermissions();

  // Determine which tools to show and whether they're accessible
  const toolsWithAccess = STUDIO_TOOLS.map((tool) => ({
    tool,
    allowed: isLoaded ? hasPermission(STUDIO_PERMISSIONS[tool.slug] ?? "studio.access") : false,
  }));

  // Show all tools but dim the inaccessible ones (users should know what exists)
  const hasAnyAccess = toolsWithAccess.some((t) => t.allowed);

  return (
    <div className="space-y-6">
      <h1 className="text-[17px] font-semibold text-sse-ink">Configuración</h1>

      {/* Unit info */}
      <UnitInfoSection wsId={wsId} />

      {/* Studio tools */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[15px] font-semibold text-sse-ink">Herramientas de configuración</h2>
            <p className="text-[12px] text-sse-muted mt-0.5">
              Acceso a Studio para configurar procesos, formularios y datos de esta unidad.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {toolsWithAccess.map(({ tool, allowed }) => (
            <StudioToolCard key={tool.id} tool={tool} allowed={allowed} />
          ))}
        </div>

        {isLoaded && !hasAnyAccess && (
          <p className="text-[12px] text-sse-muted mt-3">
            No tienes acceso a ninguna herramienta de configuración.
            Contacta al administrador para solicitar los permisos necesarios.
          </p>
        )}
      </div>
    </div>
  );
}
