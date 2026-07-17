"use client";

import { useState, useEffect } from "react";
import type { RequestType } from "@/types/workspace-admin";
import type { WorkspaceId } from "@/config/nav";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import { Drawer, DrawerTabs, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { lifecycleBadge } from "@/hooks/useWorkspaceAdmin";

interface RequestDrawerProps {
  wsId: WorkspaceId;
  request: RequestType | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const TABS = [
  { id: "general", label: "General" },
  { id: "campos", label: "Campos" },
  { id: "aprobacion", label: "Aprobación" },
  { id: "notificaciones", label: "Notificaciones" },
];

const ROL_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "HEAD", label: "Head" },
  { value: "ANALYST", label: "Analista" },
  { value: "OPS", label: "Operador" },
  { value: "AUDIT", label: "Auditor" },
];

const CATEGORIA_OPTIONS = [
  { value: "RRHH", label: "Recursos Humanos" },
  { value: "Contabilidad", label: "Contabilidad" },
  { value: "Compras", label: "Compras" },
  { value: "Mantenimiento", label: "Mantenimiento" },
  { value: "Legal", label: "Legal" },
  { value: "Tecnología", label: "Tecnología" },
  { value: "General", label: "General" },
];

export function RequestDrawer({ wsId, request, open, onClose, onSaved }: RequestDrawerProps) {
  const isNew = !request;
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "General",
    slaDias: 5,
    responsableRol: "HEAD",
    notificaciones: {
      alCrear: true,
      alAprobar: true,
      alRechazar: true,
      alCerrar: false,
      alVencerSLA: true,
    },
  });

  useEffect(() => {
    if (request) {
      setForm({
        nombre: request.nombre,
        descripcion: request.descripcion,
        categoria: request.categoria,
        slaDias: request.slaDias,
        responsableRol: request.responsableRol,
        notificaciones: { ...request.notificaciones },
      });
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        categoria: "General",
        slaDias: 5,
        responsableRol: "HEAD",
        notificaciones: { alCrear: true, alAprobar: true, alRechazar: true, alCerrar: false, alVencerSLA: true },
      });
    }
    setTab("general");
    setSaved(false);
  }, [request, open]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setNotif(key: keyof typeof form.notificaciones, value: boolean) {
    setForm((prev) => ({ ...prev, notificaciones: { ...prev.notificaciones, [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        await WorkspaceAdminService.createRequestType(wsId, form);
      } else {
        await WorkspaceAdminService.updateRequestType(request!.id, form);
      }
      setSaved(true);
      setTimeout(() => { onSaved(); onClose(); }, 800);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!request) return;
    if (!confirm(`¿Publicar "${request.nombre}"?`)) return;
    await WorkspaceAdminService.publishRequestType(request.id);
    onSaved();
    onClose();
  }

  async function handleDuplicate() {
    if (!request) return;
    await WorkspaceAdminService.duplicateRequestType(request.id);
    onSaved();
    onClose();
  }

  const lc = request ? lifecycleBadge(request.lifecycle) : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? "Nuevo Tipo de Solicitud" : request!.nombre}
      subtitle={isNew ? `Workspace ${wsId.toUpperCase()}` : request!.id}
      width="lg"
      footer={
        <>
          {!isNew && request?.lifecycle === "draft" && (
            <Button variant="outline" size="sm" onClick={handlePublish}>Publicar</Button>
          )}
          {!isNew && (
            <Button variant="ghost" size="sm" onClick={handleDuplicate}>Duplicar</Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !form.nombre}>
            {saved ? "✓ Guardado" : saving ? "Guardando…" : isNew ? "Crear tipo" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      {request && (
        <div className="flex items-center gap-3 border-b border-sse-border bg-sse-shell-canvas px-6 py-2">
          <span className="text-[11px] font-medium" style={{ color: lc!.color }}>{lc!.label}</span>
          <span className="text-sse-muted">·</span>
          <span className="text-[11px] text-sse-muted">v{request.version}</span>
          <span className="text-sse-muted">·</span>
          <span className="text-[11px] text-sse-muted">{request.formFields.length} campos · {request.approvalSteps.length} aprobaciones</span>
        </div>
      )}

      <DrawerTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "general" && (
        <DrawerSection>
          <DrawerField label="Nombre" required>
            <input
              className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-sse-primary/30"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej. Solicitud de Contratación"
            />
          </DrawerField>
          <DrawerField label="Descripción">
            <Textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} rows={3} placeholder="Propósito de este tipo de solicitud…" />
          </DrawerField>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Categoría">
              <Select value={form.categoria} onValueChange={(v) => set("categoria", v)} options={CATEGORIA_OPTIONS} />
            </DrawerField>
            <DrawerField label="SLA (días hábiles)">
              <input
                type="number"
                min={1}
                max={90}
                className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink focus:outline-none focus:ring-2 focus:ring-sse-primary/30"
                value={form.slaDias}
                onChange={(e) => set("slaDias", Number(e.target.value))}
              />
            </DrawerField>
          </div>
          <DrawerField label="Rol responsable">
            <Select value={form.responsableRol} onValueChange={(v) => set("responsableRol", v)} options={ROL_OPTIONS} />
          </DrawerField>
        </DrawerSection>
      )}

      {tab === "campos" && (
        <DrawerSection title="Campos del formulario">
          {!request || request.formFields.length === 0 ? (
            <p className="text-[13px] text-sse-muted">Este tipo de solicitud no tiene campos configurados aún.</p>
          ) : (
            <div className="space-y-2">
              {request.formFields.map((f, i) => (
                <div key={f.id} className="flex items-center gap-3 rounded-md border border-sse-border p-3">
                  <span className="w-5 shrink-0 text-center text-[11px] font-mono text-sse-muted">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-sse-ink">{f.etiqueta}</p>
                    <p className="text-[11px] text-sse-muted capitalize">{f.tipo}{f.requerido ? " · Requerido" : ""}</p>
                  </div>
                  {f.opciones && f.opciones.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {f.opciones.slice(0, 3).map((op) => (
                        <span key={op} className="rounded bg-sse-shell-canvas px-1.5 py-0.5 text-[10px] text-sse-muted">{op}</span>
                      ))}
                      {f.opciones.length > 3 && (
                        <span className="rounded bg-sse-shell-canvas px-1.5 py-0.5 text-[10px] text-sse-muted">+{f.opciones.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DrawerSection>
      )}

      {tab === "aprobacion" && (
        <DrawerSection title="Flujo de aprobación">
          {!request || request.approvalSteps.length === 0 ? (
            <p className="text-[13px] text-sse-muted">Sin pasos de aprobación configurados.</p>
          ) : (
            <div className="space-y-3">
              {request.approvalSteps.map((step, i) => (
                <div key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex size-7 items-center justify-center rounded-full bg-sse-primary/10 text-[11px] font-bold text-sse-primary">
                      {i + 1}
                    </div>
                    {i < request.approvalSteps.length - 1 && (
                      <div className="mt-1 h-6 w-px bg-sse-border" />
                    )}
                  </div>
                  <div className="flex-1 rounded-md border border-sse-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium text-sse-ink">{step.nombre}</p>
                      <span className="rounded-full bg-sse-hover px-2 py-0.5 text-[10px] font-mono text-sse-muted">{step.tipo}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-sse-muted">
                      <span>Rol: <strong className="text-sse-ink">{step.responsableRol}</strong></span>
                      <span>SLA: {step.slaDias}d</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DrawerSection>
      )}

      {tab === "notificaciones" && (
        <DrawerSection title="Eventos de notificación">
          {([
            ["alCrear", "Al crear solicitud"],
            ["alAprobar", "Al aprobar"],
            ["alRechazar", "Al rechazar"],
            ["alCerrar", "Al cerrar"],
            ["alVencerSLA", "Al vencer SLA"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-md border border-sse-border p-3">
              <span className="text-[13px] text-sse-ink">{label}</span>
              <button
                onClick={() => setNotif(key, !form.notificaciones[key])}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${form.notificaciones[key] ? "bg-sse-primary" : "bg-sse-border"}`}
                role="switch"
                aria-checked={form.notificaciones[key]}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-white shadow transition duration-200 ${form.notificaciones[key] ? "translate-x-4" : "translate-x-0"}`}
                />
              </button>
            </div>
          ))}
        </DrawerSection>
      )}
    </Drawer>
  );
}
