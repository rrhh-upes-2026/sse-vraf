"use client";

import { useState, useEffect } from "react";
import type { ProcessBlueprint } from "@/types/workspace-admin";
import type { WorkspaceId } from "@/config/nav";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import { Drawer, DrawerTabs, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { lifecycleBadge } from "@/hooks/useWorkspaceAdmin";

interface ProcessDrawerProps {
  wsId: WorkspaceId;
  blueprint: ProcessBlueprint | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const TABS = [
  { id: "general", label: "General" },
  { id: "config", label: "Configuración" },
  { id: "permisos", label: "Permisos" },
  { id: "historial", label: "Historial" },
  { id: "auditoria", label: "Auditoría" },
];

const TIPO_OPTIONS = [
  { value: "estrategico", label: "Estratégico" },
  { value: "misional", label: "Misional" },
  { value: "apoyo", label: "Apoyo" },
  { value: "operativo", label: "Operativo" },
];

const PRIORIDAD_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

const FRECUENCIA_OPTIONS = [
  { value: "puntual", label: "Puntual" },
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "anual", label: "Anual" },
];

const ROL_OPTIONS = [
  { value: "HEAD", label: "Head" },
  { value: "ANALYST", label: "Analista" },
  { value: "OPS", label: "Operador" },
  { value: "AUDIT", label: "Auditor" },
  { value: "ADMIN", label: "Admin" },
];

export function ProcessDrawer({ wsId, blueprint, open, onClose, onSaved }: ProcessDrawerProps) {
  const isNew = !blueprint;
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "misional" as ProcessBlueprint["tipo"],
    objetivo: "",
    alcance: "",
    responsableRol: "HEAD",
    slaDias: 15,
    prioridad: "media" as ProcessBlueprint["prioridad"],
    frecuencia: "mensual" as ProcessBlueprint["frecuencia"],
  });

  useEffect(() => {
    if (blueprint) {
      setForm({
        nombre: blueprint.nombre,
        descripcion: blueprint.descripcion,
        tipo: blueprint.tipo,
        objetivo: blueprint.objetivo,
        alcance: blueprint.alcance,
        responsableRol: blueprint.responsableRol,
        slaDias: blueprint.slaDias,
        prioridad: blueprint.prioridad,
        frecuencia: blueprint.frecuencia,
      });
    } else {
      setForm({ nombre: "", descripcion: "", tipo: "misional", objetivo: "", alcance: "", responsableRol: "HEAD", slaDias: 15, prioridad: "media", frecuencia: "mensual" });
    }
    setTab("general");
    setSaved(false);
  }, [blueprint, open]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        await WorkspaceAdminService.createBlueprint(wsId, form);
      } else {
        await WorkspaceAdminService.updateBlueprint(blueprint!.id, form);
      }
      setSaved(true);
      setTimeout(() => { onSaved(); onClose(); }, 800);
    } finally {
      setSaving(false);
    }
  }

  const lc = blueprint ? lifecycleBadge(blueprint.lifecycle) : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? "Nuevo Proceso" : blueprint!.nombre}
      subtitle={isNew ? `Workspace ${wsId.toUpperCase()}` : blueprint!.id}
      width="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !form.nombre}>
            {saved ? "✓ Guardado" : saving ? "Guardando…" : isNew ? "Crear proceso" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      {/* Status bar */}
      {blueprint && (
        <div className="flex items-center gap-3 border-b border-sse-border bg-sse-shell-canvas px-6 py-2">
          <span className="text-[11px] font-medium" style={{ color: lc!.color }}>{lc!.label}</span>
          <span className="text-sse-muted">·</span>
          <span className="text-[11px] text-sse-muted">v{blueprint.version}</span>
          {blueprint.runtimeBlueprintId && (
            <>
              <span className="text-sse-muted">·</span>
              <span className="text-[11px] text-sse-muted">Runtime: {blueprint.runtimeBlueprintId}</span>
            </>
          )}
        </div>
      )}

      <DrawerTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "general" && (
        <DrawerSection>
          <DrawerField label="Nombre del proceso" required>
            <input
              className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-sse-primary/30"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej. Gestión de Contratación de Personal"
            />
          </DrawerField>
          <DrawerField label="Descripción">
            <Textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Describe el propósito general del proceso…" rows={3} />
          </DrawerField>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Tipo" required>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v as ProcessBlueprint["tipo"])} options={TIPO_OPTIONS} />
            </DrawerField>
            <DrawerField label="Prioridad">
              <Select value={form.prioridad} onValueChange={(v) => set("prioridad", v as ProcessBlueprint["prioridad"])} options={PRIORIDAD_OPTIONS} />
            </DrawerField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Responsable">
              <Select value={form.responsableRol} onValueChange={(v) => set("responsableRol", v)} options={ROL_OPTIONS} />
            </DrawerField>
            <DrawerField label="Frecuencia">
              <Select value={form.frecuencia} onValueChange={(v) => set("frecuencia", v as ProcessBlueprint["frecuencia"])} options={FRECUENCIA_OPTIONS} />
            </DrawerField>
          </div>
          <DrawerField label="SLA (días hábiles)">
            <input
              type="number"
              min={1}
              className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink focus:outline-none focus:ring-2 focus:ring-sse-primary/30"
              value={form.slaDias}
              onChange={(e) => set("slaDias", Number(e.target.value))}
            />
          </DrawerField>
        </DrawerSection>
      )}

      {tab === "config" && (
        <DrawerSection>
          <DrawerField label="Objetivo estratégico">
            <Textarea value={form.objetivo} onChange={(e) => set("objetivo", e.target.value)} placeholder="Objetivo que este proceso apoya…" rows={3} />
          </DrawerField>
          <DrawerField label="Alcance">
            <Textarea value={form.alcance} onChange={(e) => set("alcance", e.target.value)} placeholder="Desde… hasta… Incluye / excluye…" rows={3} />
          </DrawerField>
        </DrawerSection>
      )}

      {tab === "permisos" && (
        <DrawerSection title="Roles con acceso a este proceso">
          {ROL_OPTIONS.map((r) => (
            <div key={r.value} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-sse-shell-canvas">
              <span className="text-[13px] text-sse-ink">{r.label}</span>
              <span className="rounded-full bg-sse-pill-blue-bg px-2 py-0.5 text-[11px] font-medium text-sse-primary">Ver</span>
            </div>
          ))}
        </DrawerSection>
      )}

      {tab === "historial" && (
        <DrawerSection title="Versiones">
          {(blueprint?.history ?? []).length === 0 ? (
            <p className="text-[13px] text-sse-muted">Sin historial de versiones aún.</p>
          ) : (
            <div className="space-y-2">
              {blueprint!.history.map((h) => {
                const b = lifecycleBadge(h.lifecycle);
                return (
                  <div key={h.version} className="flex items-start gap-3 rounded-md border border-sse-border p-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sse-shell-canvas text-[11px] font-bold text-sse-muted">v{h.version}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium" style={{ color: b.color }}>{b.label}</span>
                        <span className="text-[11px] text-sse-muted">{h.changedBy}</span>
                      </div>
                      <p className="text-[12px] text-sse-muted">{h.summary}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-sse-muted">{new Date(h.changedAt).toLocaleDateString("es-SV")}</span>
                  </div>
                );
              })}
            </div>
          )}
        </DrawerSection>
      )}

      {tab === "auditoria" && (
        <DrawerSection title="Registro de cambios">
          <p className="text-[13px] text-sse-muted">Los registros de auditoría se consultan desde el módulo de Configuración → Auditoría.</p>
        </DrawerSection>
      )}
    </Drawer>
  );
}
