"use client";

import { useState } from "react";
import { BuilderShell } from "./BuilderShell";
import { BUILDER_REGISTRY } from "@/types/builders";
import type { DashboardConfig, WidgetConfig, TipoWidget } from "@/types/builders";
import { useBuilderList, useBuilderSave, useBuilderPublish } from "@/hooks/useBuilder";

const META = BUILDER_REGISTRY.find((b) => b.tipo === "dashboard")!;

const labelStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 4, fontSize: 11,
  color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em",
};
const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6, padding: "7px 10px", fontSize: 13, color: "white",
  outline: "none", width: "100%", boxSizing: "border-box",
};

function uid() { return `w${Math.random().toString(36).slice(2, 8)}`; }

const WIDGET_TYPES: { tipo: TipoWidget; label: string; icono: string; defaultAncho: number }[] = [
  { tipo: "kpi_card",      label: "Tarjeta KPI",       icono: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", defaultAncho: 3 },
  { tipo: "grafico_barra", label: "Barras",             icono: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", defaultAncho: 6 },
  { tipo: "grafico_linea", label: "Líneas",             icono: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16", defaultAncho: 6 },
  { tipo: "grafico_pastel",label: "Pastel",             icono: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z", defaultAncho: 4 },
  { tipo: "tabla",         label: "Tabla",              icono: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", defaultAncho: 12 },
  { tipo: "calendario",    label: "Calendario",         icono: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", defaultAncho: 8 },
  { tipo: "timeline",      label: "Línea de tiempo",    icono: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", defaultAncho: 12 },
  { tipo: "alerta",        label: "Panel de alertas",   icono: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z", defaultAncho: 6 },
  { tipo: "texto",         label: "Texto libre",        icono: "M4 6h16M4 10h16M4 14h10", defaultAncho: 6 },
  { tipo: "imagen",        label: "Imagen",             icono: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", defaultAncho: 4 },
];

function newWidget(tipo: TipoWidget, idx: number): WidgetConfig {
  const wt = WIDGET_TYPES.find(w => w.tipo === tipo)!;
  return {
    id: uid(),
    tipo,
    titulo: wt.label,
    posicion: { col: (idx % 2) * 6, row: Math.floor(idx / 2) * 4, ancho: wt.defaultAncho, alto: 4 },
    config: {},
  };
}

function newDashboard(wsId: string): Omit<DashboardConfig, "id" | "createdAt" | "updatedAt"> {
  return {
    tipo: "dashboard",
    wsId,
    nombre: "Nuevo Dashboard",
    version: 1,
    status: "draft",
    creadoPor: "admin",
    widgets: [],
    columnas: 12,
    rolesVisibles: ["admin"],
  };
}

function WidgetPreview({ widget }: { widget: WidgetConfig }) {
  const wt = WIDGET_TYPES.find(w => w.tipo === widget.tipo);
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8, padding: "10px 12px", height: "100%", boxSizing: "border-box", minHeight: 70,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <path d={wt?.icono} stroke={META.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{widget.titulo}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 32, color: "rgba(255,255,255,0.12)", fontSize: 10 }}>
        {wt?.label}
      </div>
    </div>
  );
}

function DashboardCanvas({ config: initial, wsId, onClose }: { config: DashboardConfig; wsId: string; onClose: () => void }) {
  const [config, setConfig] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"canvas" | "settings">("canvas");
  const save = useBuilderSave<DashboardConfig>(wsId, "dashboard");
  const publish = useBuilderPublish(wsId, "dashboard");

  const addWidget = (tipo: TipoWidget) => {
    const w = newWidget(tipo, config.widgets.length);
    setConfig(c => ({ ...c, widgets: [...c.widgets, w] }));
    setSelectedId(w.id);
  };

  const updateWidget = (id: string, w: WidgetConfig) =>
    setConfig(c => ({ ...c, widgets: c.widgets.map(x => x.id === id ? w : x) }));

  const deleteWidget = (id: string) => {
    setConfig(c => ({ ...c, widgets: c.widgets.filter(x => x.id !== id) }));
    setSelectedId(null);
  };

  const selectedWidget = config.widgets.find(w => w.id === selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <input value={config.nombre} onChange={e => setConfig(c => ({ ...c, nombre: e.target.value }))}
          style={{ fontSize: 14, fontWeight: 700, color: "white", background: "transparent", border: "none", outline: "none", flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {(["canvas", "settings"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
              background: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
              border: `1px solid ${tab === t ? "rgba(255,255,255,0.15)" : "transparent"}`,
              color: tab === t ? "white" : "rgba(255,255,255,0.4)",
            }}>{t === "canvas" ? "Diseño" : "Configuración"}</button>
          ))}
        </div>
        <button onClick={onClose} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>Cerrar</button>
        <button onClick={() => save.mutate(config as Parameters<typeof save.mutate>[0])} style={{ fontSize: 11, color: "white", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>{save.isPending ? "…" : "Guardar"}</button>
        <button onClick={() => config.id && publish.mutate(config.id)} style={{ fontSize: 11, color: "white", background: META.color, border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>Publicar</button>
      </div>

      {tab === "canvas" ? (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Grid canvas */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {config.widgets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                Agrega widgets desde el panel derecho
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 8 }}>
                {config.widgets.map(w => (
                  <div key={w.id}
                    style={{
                      gridColumn: `span ${Math.min(w.posicion.ancho, 12)}`,
                      outline: w.id === selectedId ? `2px solid ${META.color}` : "none",
                      borderRadius: 8, cursor: "pointer",
                    }}
                    onClick={() => setSelectedId(w.id === selectedId ? null : w.id)}
                  >
                    <WidgetPreview widget={w} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar: palette or editor */}
          <div style={{ width: 220, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.07)", overflowY: "auto" }}>
            {selectedWidget ? (
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>PROPIEDADES</div>
                <label style={{ ...labelStyle, marginBottom: 10 }}>
                  Título
                  <input value={selectedWidget.titulo}
                    onChange={e => updateWidget(selectedWidget.id, { ...selectedWidget, titulo: e.target.value })}
                    style={inputStyle} />
                </label>
                <label style={{ ...labelStyle, marginBottom: 10 }}>
                  Ancho (1–12 columnas)
                  <input type="number" min={1} max={12} value={selectedWidget.posicion.ancho}
                    onChange={e => updateWidget(selectedWidget.id, {
                      ...selectedWidget,
                      posicion: { ...selectedWidget.posicion, ancho: +e.target.value },
                    })} style={inputStyle} />
                </label>
                <label style={{ ...labelStyle, marginBottom: 10 }}>
                  Alto (filas)
                  <input type="number" min={1} max={12} value={selectedWidget.posicion.alto}
                    onChange={e => updateWidget(selectedWidget.id, {
                      ...selectedWidget,
                      posicion: { ...selectedWidget.posicion, alto: +e.target.value },
                    })} style={inputStyle} />
                </label>
                <label style={{ ...labelStyle, marginBottom: 14 }}>
                  Fuente de datos
                  <input
                    value={String(selectedWidget.config.fuente || "")}
                    onChange={e => updateWidget(selectedWidget.id, {
                      ...selectedWidget,
                      config: { ...selectedWidget.config, fuente: e.target.value },
                    })}
                    style={inputStyle} placeholder="kpi:id o proceso:campo" />
                </label>
                <button onClick={() => deleteWidget(selectedWidget.id)} style={{
                  width: "100%", fontSize: 11, color: "#ef4444", background: "transparent",
                  border: "1px solid #ef444430", borderRadius: 6, padding: "5px", cursor: "pointer",
                }}>Eliminar widget</button>
              </div>
            ) : (
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>AGREGAR WIDGET</div>
                {WIDGET_TYPES.map(wt => (
                  <button key={wt.tipo} onClick={() => addWidget(wt.tipo)} style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                    padding: "7px 8px", marginBottom: 4, background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, cursor: "pointer",
                  }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <path d={wt.icono} stroke={META.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{wt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 500 }}>
            <label style={labelStyle}>
              Roles visibles (separados por coma)
              <input
                value={config.rolesVisibles.join(", ")}
                onChange={e => setConfig(c => ({ ...c, rolesVisibles: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                style={inputStyle} placeholder="admin, director, rrhh" />
            </label>
            <label style={labelStyle}>
              Número de columnas
              <input type="number" min={4} max={24} value={config.columnas}
                onChange={e => setConfig(c => ({ ...c, columnas: +e.target.value }))} style={inputStyle} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardBuilder({ wsId }: { wsId: string }) {
  const { data: items = [], isLoading } = useBuilderList<DashboardConfig>(wsId, "dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const save = useBuilderSave<DashboardConfig>(wsId, "dashboard");

  const selected = items.find(i => i.id === selectedId) ?? null;

  const handleNew = () => {
    save.mutate(newDashboard(wsId) as Parameters<typeof save.mutate>[0], {
      onSuccess: (saved) => setSelectedId(saved.id),
    });
  };

  return (
    <BuilderShell wsId={wsId} meta={META} items={items} selectedId={selectedId}
      onSelect={setSelectedId} onNew={handleNew} isLoading={isLoading}>
      {selected ? (
        <DashboardCanvas key={selected.id} config={selected} wsId={wsId} onClose={() => setSelectedId(null)} />
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
          Selecciona un dashboard o crea uno nuevo
        </div>
      )}
    </BuilderShell>
  );
}
