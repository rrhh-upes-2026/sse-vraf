"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useWorkspaceSettings, useAuditRecords } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { WorkspaceTemplate } from "@/types/workspace-admin";

function SettingRow({ label, value, editable = false }: { label: string; value: string; editable?: boolean }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 py-2.5 border-b border-sse-border last:border-0">
      <span className="text-[12px] text-sse-muted font-medium self-center">{label}</span>
      {editable ? (
        <input
          defaultValue={value}
          className="text-[13px] text-sse-ink bg-sse-surface border border-sse-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sse-primary/50"
        />
      ) : (
        <span className="text-[13px] text-sse-ink self-center">{value}</span>
      )}
    </div>
  );
}

function ColorField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 py-2.5 border-b border-sse-border">
      <span className="text-[12px] text-sse-muted font-medium self-center">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className="w-5 h-5 rounded border border-sse-border shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="text-[13px] font-mono text-sse-ink">{value}</span>
      </div>
    </div>
  );
}

function TemplateCard({ template, loading }: { template: WorkspaceTemplate | null; loading: boolean }) {
  if (loading) return (
    <div className="bg-sse-hover rounded-md border border-sse-border p-4 animate-pulse h-32" />
  );
  if (!template) return null;

  return (
    <div className="bg-sse-hover rounded-md border border-sse-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-sse-ink">{template.nombre}</p>
          <p className="text-[11px] text-sse-muted mt-0.5">{template.descripcion}</p>
        </div>
        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
          Listo
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[
          { label: "Procesos", value: template.blueprints },
          { label: "KPIs", value: template.kpis },
          { label: "Solicitudes", value: template.requestTypes },
          { label: "Automatizaciones", value: template.automations },
          { label: "Formularios", value: template.forms },
          { label: "Dashboards", value: template.dashboards },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-[14px] font-bold text-sse-ink tabular-nums">{item.value}</p>
            <p className="text-[10px] text-sse-muted">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button className="text-[11px] font-medium text-sse-primary hover:underline">
          Descargar JSON
        </button>
        <button className="text-[11px] text-sse-muted hover:text-sse-ink">
          Ver contenido
        </button>
        <span className="ml-auto text-[10px] text-sse-muted">
          Schema v{template.schemaVersion}
        </span>
      </div>
    </div>
  );
}

export function WorkspaceAdminConfig({ wsId }: { wsId: WorkspaceId }) {
  const { hasPermission } = usePermissions();
  const { data: settings, loading } = useWorkspaceSettings(wsId);
  const { data: audit } = useAuditRecords(wsId);
  const [template, setTemplate] = useState<WorkspaceTemplate | null>(null);
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);

  const canSettings = hasPermission("ws.settings.manage");
  const canTemplate = hasPermission("ws.template.export");
  const canAudit = hasPermission("ws.audit.view");

  const handleExport = async () => {
    setExporting(true);
    const result = await WorkspaceAdminService.exportTemplate(wsId);
    setTemplate(result);
    setExporting(false);
  };

  const handleSave = async () => {
    await WorkspaceAdminService.updateSettings(wsId, {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[17px] font-semibold text-sse-ink">Configuración del Workspace</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">
          Ajustes generales, exportación de plantilla y registro de auditoría.
        </p>
      </div>

      {/* Settings */}
      <div className="bg-sse-surface rounded-md border border-sse-border">
        <div className="px-4 py-3 border-b border-sse-border flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-sse-ink">Información del Workspace</h2>
          {canSettings && (
            <button
              onClick={handleSave}
              className={
                "text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors " +
                (saved
                  ? "bg-green-100 text-green-700"
                  : "bg-sse-primary text-white hover:bg-sse-primary/90")
              }
            >
              {saved ? "Guardado ✓" : "Guardar cambios"}
            </button>
          )}
        </div>
        <div className="px-4 py-2">
          {loading ? (
            <div className="space-y-2.5 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-sse-hover rounded animate-pulse" />
              ))}
            </div>
          ) : settings ? (
            <>
              <SettingRow label="Nombre completo" value={settings.nombre} editable={canSettings} />
              <SettingRow label="Nombre corto" value={settings.nombreCorto} editable={canSettings} />
              <SettingRow label="ID de workspace" value={settings.wsId} />
              <SettingRow label="Descripción" value={settings.descripcion ?? ""} editable={canSettings} />
              <ColorField label="Color institucional" value={settings.color} />
              <ColorField label="Color de fondo" value={settings.colorFondo} />
              <SettingRow label="SLA por defecto" value={`${settings.slaDiasDefault} días`} editable={canSettings} />
              <SettingRow label="Zona horaria" value={settings.zonaHoraria} />
              <SettingRow label="Última actualización" value={new Date(settings.updatedAt).toLocaleDateString("es-SV")} />
            </>
          ) : (
            <p className="text-[12px] text-sse-muted py-4">No se pudo cargar la configuración.</p>
          )}
        </div>
      </div>

      {/* Template Export */}
      {canTemplate && (
        <div className="bg-sse-surface rounded-md border border-sse-border">
          <div className="px-4 py-3 border-b border-sse-border">
            <h2 className="text-[13px] font-semibold text-sse-ink">Exportar como Plantilla</h2>
            <p className="text-[11px] text-sse-muted mt-0.5">
              Captura toda la configuración de este workspace para reutilizarla en futuras unidades.
            </p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <p className="text-[12px] text-sse-muted">
              La plantilla incluye: procesos, KPIs, tipos de solicitud, automatizaciones, formularios y dashboards.
              No incluye datos operativos ni usuarios.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 text-[12px] font-medium bg-sse-primary text-white px-4 py-2 rounded-md hover:bg-sse-primary/90 disabled:opacity-60 transition-colors"
            >
              {exporting ? (
                <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {exporting ? "Generando plantilla…" : "Generar Plantilla"}
            </button>

            {template && <TemplateCard template={template} loading={false} />}
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {canAudit && (
        <div className="bg-sse-surface rounded-md border border-sse-border">
          <div className="px-4 py-3 border-b border-sse-border flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-sse-ink">Registro de Auditoría</h2>
            <span className="text-[11px] text-sse-muted">INSERT-only · Inmutable</span>
          </div>
          <div className="divide-y divide-sse-border">
            {(audit ?? []).slice(0, 10).map((record) => (
              <div key={record.id} className="px-4 py-3 grid grid-cols-[auto_1fr_auto] gap-4 text-[12px]">
                <span className="font-mono text-sse-muted text-[10px] self-center">{record.id}</span>
                <div>
                  <span className="font-medium text-sse-ink">{record.action}</span>
                  <span className="text-sse-muted"> · {record.entityType} {record.entityId}</span>
                  <p className="text-sse-muted text-[11px]">{record.performedBy}</p>
                </div>
                <span className="text-sse-muted text-[11px] self-center whitespace-nowrap">
                  {new Date(record.performedAt).toLocaleDateString("es-SV", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
