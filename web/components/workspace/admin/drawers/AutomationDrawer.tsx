"use client";

import { useState, useEffect } from "react";
import type { WorkspaceAutomation, TriggerType, ActionType } from "@/types/workspace-admin";
import type { WorkspaceId } from "@/config/nav";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import { Drawer, DrawerTabs, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { lifecycleBadge } from "@/hooks/useWorkspaceAdmin";

interface AutomationDrawerProps {
  wsId: WorkspaceId;
  automation: WorkspaceAutomation | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const TABS = [
  { id: "general", label: "General" },
  { id: "trigger", label: "Disparador" },
  { id: "acciones", label: "Acciones" },
  { id: "ejecuciones", label: "Ejecuciones" },
];

const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: "process.created", label: "Proceso creado" },
  { value: "process.status_changed", label: "Proceso cambia estado" },
  { value: "process.completed", label: "Proceso completado" },
  { value: "indicator.threshold_crossed", label: "Indicador cruza umbral" },
  { value: "request.created", label: "Solicitud creada" },
  { value: "request.approved", label: "Solicitud aprobada" },
  { value: "evidence.uploaded", label: "Evidencia subida" },
  { value: "sla.warning", label: "SLA por vencer" },
  { value: "sla.breach", label: "SLA vencido" },
  { value: "date.reached", label: "Fecha alcanzada" },
  { value: "form.submitted", label: "Formulario enviado" },
  { value: "user.created", label: "Usuario creado" },
];

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: "send_notification", label: "Enviar notificación" },
  { value: "create_task", label: "Crear tarea" },
  { value: "update_field", label: "Actualizar campo" },
  { value: "change_status", label: "Cambiar estado" },
  { value: "assign_role", label: "Asignar rol" },
  { value: "generate_report", label: "Generar reporte" },
  { value: "create_audit_record", label: "Registrar en auditoría" },
];

export function AutomationDrawer({ wsId, automation, open, onClose, onSaved }: AutomationDrawerProps) {
  const isNew = !automation;
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    trigger: "process.created" as TriggerType,
    conditionLogic: "AND" as "AND" | "OR",
    active: false,
  });

  useEffect(() => {
    if (automation) {
      setForm({
        nombre: automation.nombre,
        descripcion: automation.descripcion,
        trigger: automation.trigger,
        conditionLogic: automation.conditionLogic,
        active: automation.active,
      });
    } else {
      setForm({ nombre: "", descripcion: "", trigger: "process.created", conditionLogic: "AND", active: false });
    }
    setTab("general");
    setSaved(false);
  }, [automation, open]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) await WorkspaceAdminService.createAutomation(wsId, form);
      else await WorkspaceAdminService.updateAutomation(automation!.id, form);
      setSaved(true);
      setTimeout(() => { onSaved(); onClose(); }, 800);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestRun() {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setTesting(false);
    alert("Test run completado — sin errores (mock)");
  }

  const lc = automation ? lifecycleBadge(automation.lifecycle) : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? "Nueva Automatización" : automation!.nombre}
      subtitle={isNew ? `Workspace ${wsId.toUpperCase()}` : automation!.id}
      width="lg"
      footer={
        <>
          {!isNew && (
            <Button variant="outline" size="sm" onClick={handleTestRun} disabled={testing}>
              {testing ? "Probando…" : "Test run"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !form.nombre}>
            {saved ? "✓ Guardado" : saving ? "Guardando…" : isNew ? "Crear automatización" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      {automation && (
        <div className="flex items-center gap-3 border-b border-sse-border bg-sse-shell-canvas px-6 py-2">
          <span className="text-[11px] font-medium" style={{ color: lc!.color }}>{lc!.label}</span>
          <span className="text-sse-muted">·</span>
          <span className="text-[11px] text-sse-muted">{automation.executionCount} ejecuciones</span>
          <span className="text-sse-muted">·</span>
          <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} label={form.active ? "Activa" : "Inactiva"} />
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
              placeholder="Ej. Notificar SLA por vencer"
            />
          </DrawerField>
          <DrawerField label="Descripción">
            <Textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} rows={3} placeholder="Qué hace esta automatización…" />
          </DrawerField>
          {isNew && (
            <DrawerField label="Estado inicial">
              <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} label="Activar al crear" />
            </DrawerField>
          )}
        </DrawerSection>
      )}

      {tab === "trigger" && (
        <DrawerSection title="Cuando ocurre">
          <DrawerField label="Disparador" required>
            <Select value={form.trigger} onValueChange={(v) => set("trigger", v as TriggerType)} options={TRIGGER_OPTIONS} />
          </DrawerField>
          <DrawerField label="Lógica de condiciones">
            <div className="flex gap-2">
              {(["AND", "OR"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => set("conditionLogic", l)}
                  className={`flex-1 rounded-sm border py-2 text-[12px] font-semibold transition-colors ${form.conditionLogic === l ? "border-sse-primary bg-sse-pill-blue-bg text-sse-primary" : "border-sse-border text-sse-muted hover:bg-sse-shell-canvas"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </DrawerField>

          {automation && automation.conditions.length > 0 && (
            <DrawerSection title="Condiciones actuales">
              {automation.conditions.map((c, i) => (
                <div key={i} className="mb-2 flex items-center gap-2 rounded-md bg-sse-shell-canvas p-2.5 text-[12px]">
                  <span className="font-mono text-sse-ink">{c.field}</span>
                  <span className="text-sse-muted">{c.operator.replace(/_/g, " ")}</span>
                  <span className="rounded bg-sse-pill-blue-bg px-1.5 py-0.5 font-medium text-sse-primary">{c.value}</span>
                </div>
              ))}
            </DrawerSection>
          )}
        </DrawerSection>
      )}

      {tab === "acciones" && (
        <DrawerSection title="Acciones disponibles">
          {ACTION_OPTIONS.map((a) => {
            const isConfigured = automation?.actions.some((act) => act.tipo === a.value);
            return (
              <div key={a.value} className="mb-2 flex items-center justify-between rounded-md border border-sse-border p-3">
                <div className="flex items-center gap-2">
                  <div className={`size-2 rounded-full ${isConfigured ? "bg-sse-primary" : "bg-sse-border"}`} />
                  <span className="text-[13px] text-sse-ink">{a.label}</span>
                </div>
                {isConfigured ? (
                  <span className="text-[11px] font-medium text-sse-primary">Configurada</span>
                ) : (
                  <span className="text-[11px] text-sse-muted">Sin configurar</span>
                )}
              </div>
            );
          })}
        </DrawerSection>
      )}

      {tab === "ejecuciones" && (
        <DrawerSection title="Ejecuciones recientes">
          {!automation || automation.recentExecutions.length === 0 ? (
            <p className="text-[13px] text-sse-muted">Sin ejecuciones registradas.</p>
          ) : (
            <div className="space-y-2">
              {automation.recentExecutions.map((e) => {
                const colors = { success: "#12A150", failed: "#E54D4D", partial: "#E5A100" };
                return (
                  <div key={e.id} className="flex items-start gap-3 rounded-md border border-sse-border p-3">
                    <div className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: colors[e.status] }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-sse-ink capitalize">{e.status}</span>
                        <span className="text-[11px] text-sse-muted">{e.actionsExecuted} acciones</span>
                      </div>
                      {e.errorMessage && <p className="mt-0.5 text-[11px] text-sse-sem-red-fg">{e.errorMessage}</p>}
                    </div>
                    <span className="shrink-0 text-[11px] text-sse-muted">{new Date(e.triggeredAt).toLocaleString("es-SV")}</span>
                  </div>
                );
              })}
            </div>
          )}
        </DrawerSection>
      )}
    </Drawer>
  );
}
