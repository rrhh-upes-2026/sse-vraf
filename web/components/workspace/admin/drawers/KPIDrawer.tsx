"use client";

import { useState, useEffect } from "react";
import type { WorkspaceKPI } from "@/types/workspace-admin";
import type { WorkspaceId } from "@/config/nav";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import { Drawer, DrawerTabs, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { lifecycleBadge } from "@/hooks/useWorkspaceAdmin";

interface KPIDrawerProps {
  wsId: WorkspaceId;
  kpi: WorkspaceKPI | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const TABS = [
  { id: "general", label: "General" },
  { id: "formula", label: "Fórmula" },
  { id: "semaforo", label: "Semáforo" },
  { id: "historial", label: "Historial" },
];

const CAT_OPTIONS = [
  { value: "gestion", label: "Gestión" },
  { value: "desempeno", label: "Desempeño" },
  { value: "calidad", label: "Calidad" },
  { value: "eficiencia", label: "Eficiencia" },
  { value: "satisfaccion", label: "Satisfacción" },
];

const FREQ_OPTIONS = [
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

const VIZ_OPTIONS = [
  { value: "gauge", label: "Gauge" },
  { value: "line", label: "Línea" },
  { value: "bar", label: "Barras" },
  { value: "number", label: "Número" },
  { value: "table", label: "Tabla" },
  { value: "pie", label: "Torta" },
];

const ROL_OPTIONS = [
  { value: "HEAD", label: "Head" },
  { value: "ANALYST", label: "Analista" },
  { value: "OPS", label: "Operador" },
];

export function KPIDrawer({ wsId, kpi, open, onClose, onSaved }: KPIDrawerProps) {
  const isNew = !kpi;
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "gestion" as WorkspaceKPI["categoria"],
    formula: "",
    unidadMedida: "",
    meta: 100,
    tolerancia: 10,
    frecuencia: "mensual" as WorkspaceKPI["frecuencia"],
    fuenteDatos: "",
    responsableRol: "ANALYST",
    visualizacion: "gauge" as WorkspaceKPI["visualizacion"],
    dashboardDestino: "Dashboard Principal",
    semaforoVerde: { min: 80, max: 100 },
    semaforoAmarillo: { min: 60, max: 79 },
    semaforoRojo: { min: 0, max: 59 },
  });

  useEffect(() => {
    if (kpi) {
      setForm({
        nombre: kpi.nombre,
        descripcion: kpi.descripcion,
        categoria: kpi.categoria,
        formula: kpi.formula,
        unidadMedida: kpi.unidadMedida,
        meta: kpi.meta,
        tolerancia: kpi.tolerancia,
        frecuencia: kpi.frecuencia,
        fuenteDatos: kpi.fuenteDatos,
        responsableRol: kpi.responsableRol,
        visualizacion: kpi.visualizacion,
        dashboardDestino: kpi.dashboardDestino,
        semaforoVerde: kpi.semaforo.verde,
        semaforoAmarillo: kpi.semaforo.amarillo,
        semaforoRojo: kpi.semaforo.rojo,
      });
    }
    setTab("general");
    setSaved(false);
  }, [kpi, open]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = {
        ...form,
        semaforo: { verde: form.semaforoVerde, amarillo: form.semaforoAmarillo, rojo: form.semaforoRojo },
      };
      if (isNew) await WorkspaceAdminService.createKPI(wsId, data);
      else await WorkspaceAdminService.updateKPI(kpi!.id, data);
      setSaved(true);
      setTimeout(() => { onSaved(); onClose(); }, 800);
    } finally {
      setSaving(false);
    }
  }

  const lc = kpi ? lifecycleBadge(kpi.lifecycle) : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? "Nuevo KPI" : kpi!.nombre}
      subtitle={isNew ? `Workspace ${wsId.toUpperCase()}` : kpi!.id}
      width="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !form.nombre}>
            {saved ? "✓ Guardado" : saving ? "Guardando…" : isNew ? "Crear KPI" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      {kpi && (
        <div className="flex items-center gap-3 border-b border-sse-border bg-sse-shell-canvas px-6 py-2">
          <span className="text-[11px] font-medium" style={{ color: lc!.color }}>{lc!.label}</span>
          <span className="text-sse-muted">·</span>
          <span className="text-[11px] text-sse-muted">v{kpi.version}</span>
          {kpi.valorActual !== undefined && (
            <>
              <span className="text-sse-muted">·</span>
              <span className="text-[11px] text-sse-muted">Actual: {kpi.valorActual} {kpi.unidadMedida}</span>
            </>
          )}
        </div>
      )}
      <DrawerTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "general" && (
        <DrawerSection>
          <DrawerField label="Nombre del KPI" required>
            <input
              className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-sse-primary/30"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej. Tasa de Rotación de Personal"
            />
          </DrawerField>
          <DrawerField label="Descripción">
            <Textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} rows={2} placeholder="Qué mide este indicador…" />
          </DrawerField>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Categoría">
              <Select value={form.categoria} onValueChange={(v) => set("categoria", v as WorkspaceKPI["categoria"])} options={CAT_OPTIONS} />
            </DrawerField>
            <DrawerField label="Frecuencia">
              <Select value={form.frecuencia} onValueChange={(v) => set("frecuencia", v as WorkspaceKPI["frecuencia"])} options={FREQ_OPTIONS} />
            </DrawerField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Meta">
              <input type="number" className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink focus:outline-none focus:ring-2 focus:ring-sse-primary/30" value={form.meta} onChange={(e) => set("meta", Number(e.target.value))} />
            </DrawerField>
            <DrawerField label="Unidad de medida">
              <input className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-sse-primary/30" value={form.unidadMedida} onChange={(e) => set("unidadMedida", e.target.value)} placeholder="%, días, unidades…" />
            </DrawerField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Responsable">
              <Select value={form.responsableRol} onValueChange={(v) => set("responsableRol", v)} options={ROL_OPTIONS} />
            </DrawerField>
            <DrawerField label="Visualización">
              <Select value={form.visualizacion} onValueChange={(v) => set("visualizacion", v as WorkspaceKPI["visualizacion"])} options={VIZ_OPTIONS} />
            </DrawerField>
          </div>
          <DrawerField label="Fuente de datos">
            <input className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-sse-primary/30" value={form.fuenteDatos} onChange={(e) => set("fuenteDatos", e.target.value)} placeholder="Sistema, hoja de cálculo…" />
          </DrawerField>
        </DrawerSection>
      )}

      {tab === "formula" && (
        <DrawerSection title="Definición de la fórmula">
          <DrawerField label="Fórmula de cálculo" required>
            <Textarea
              value={form.formula}
              onChange={(e) => set("formula", e.target.value)}
              rows={4}
              className="font-mono text-[12px]"
              placeholder="Ej. COUNT(contrataciones_mes) / COUNT(plazas_abiertas) * 100"
            />
          </DrawerField>
          <DrawerField label="Tolerancia (%)">
            <input type="number" min={0} max={100} className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink focus:outline-none focus:ring-2 focus:ring-sse-primary/30" value={form.tolerancia} onChange={(e) => set("tolerancia", Number(e.target.value))} />
          </DrawerField>
          <DrawerField label="Dashboard destino">
            <input className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-sse-primary/30" value={form.dashboardDestino} onChange={(e) => set("dashboardDestino", e.target.value)} />
          </DrawerField>
        </DrawerSection>
      )}

      {tab === "semaforo" && (
        <DrawerSection title="Rangos del semáforo">
          {[
            { key: "semaforoVerde" as const, label: "Verde (cumplimiento)", color: "#12A150", bg: "#F0FBF4" },
            { key: "semaforoAmarillo" as const, label: "Amarillo (atención)", color: "#E5A100", bg: "#FFFBF0" },
            { key: "semaforoRojo" as const, label: "Rojo (crítico)", color: "#E54D4D", bg: "#FFF0F0" },
          ].map(({ key, label, color, bg }) => (
            <div key={key} className="mb-4 rounded-lg p-4" style={{ backgroundColor: bg }}>
              <p className="mb-3 text-[12px] font-semibold" style={{ color }}>{label}</p>
              <div className="grid grid-cols-2 gap-3">
                <DrawerField label="Mínimo">
                  <input type="number" className="w-full rounded-sm border bg-white px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-2" style={{ borderColor: color + "40" }} value={form[key].min} onChange={(e) => set(key, { ...form[key], min: Number(e.target.value) })} />
                </DrawerField>
                <DrawerField label="Máximo">
                  <input type="number" className="w-full rounded-sm border bg-white px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-2" style={{ borderColor: color + "40" }} value={form[key].max} onChange={(e) => set(key, { ...form[key], max: Number(e.target.value) })} />
                </DrawerField>
              </div>
            </div>
          ))}
        </DrawerSection>
      )}

      {tab === "historial" && (
        <DrawerSection title="Valores históricos">
          {!kpi || kpi.historico.length === 0 ? (
            <p className="text-[13px] text-sse-muted">Sin datos históricos aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-sse-border">
                    <th className="pb-2 text-left font-medium text-sse-muted">Fecha</th>
                    <th className="pb-2 text-right font-medium text-sse-muted">Valor</th>
                    <th className="pb-2 text-center font-medium text-sse-muted">Semáforo</th>
                  </tr>
                </thead>
                <tbody>
                  {kpi.historico.slice().reverse().map((h, i) => {
                    const colors = { verde: "#12A150", amarillo: "#E5A100", rojo: "#E54D4D" };
                    return (
                      <tr key={i} className="border-b border-sse-border/50">
                        <td className="py-1.5 text-sse-muted">{new Date(h.fecha).toLocaleDateString("es-SV")}</td>
                        <td className="py-1.5 text-right font-medium text-sse-ink">{h.valor}</td>
                        <td className="py-1.5 text-center">
                          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: colors[h.semaforo] }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DrawerSection>
      )}
    </Drawer>
  );
}
