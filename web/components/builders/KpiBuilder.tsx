"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { BuilderShell, StatusBadge } from "@/components/builders/BuilderShell";
import {
  useBuilderList,
  useBuilderSave,
  useBuilderPublish,
  useBuilderDuplicate,
  useBuilderDelete,
} from "@/hooks/useBuilder";
import {
  KPIConfig,
  VariableFormula,
  UmbralKPI,
  BUILDER_REGISTRY,
} from "@/types/builders";

// ── Constants ──────────────────────────────────────────────────────────────────

const KPI_META = BUILDER_REGISTRY.find((m) => m.tipo === "kpi")!;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  fontSize: 12,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "rgba(255,255,255,0.45)",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function uid(): string {
  return `bldr-${Math.random().toString(36).slice(2, 9)}`;
}

function makeDefaultKPI(wsId: string): KPIConfig {
  const now = new Date().toISOString();
  return {
    id: uid(),
    wsId,
    nombre: "Nuevo KPI",
    descripcion: "",
    version: 1,
    status: "draft",
    tipo: "kpi",
    tipoKPI: "numero",
    formula: "",
    variables: [],
    unidad: "",
    valorObjetivo: 0,
    umbrales: {
      verde: { min: 80, max: 100 },
      amarillo: { min: 50, max: 79 },
      rojo: { min: 0, max: 49 },
    },
    frecuenciaCalculo: "mensual",
    historico: [],
    creadoPor: "",
    createdAt: now,
    updatedAt: now,
  };
}

function evaluateFormula(formula: string, variables: VariableFormula[]): string {
  if (!formula.trim()) return "";
  let expr = formula;
  for (const v of variables) {
    expr = expr.split(`{${v.nombre}}`).join("1");
  }
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)();
    if (typeof result === "number" && isFinite(result)) {
      return parseFloat(result.toFixed(4)).toString();
    }
    return String(result);
  } catch {
    return expr;
  }
}

function getThresholdColor(value: number, umbrales: UmbralKPI): string {
  if (value >= umbrales.verde.min && value <= umbrales.verde.max) return "#22c55e";
  if (value >= umbrales.amarillo.min && value <= umbrales.amarillo.max) return "#eab308";
  return "#ef4444";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "rgba(255,255,255,0.38)",
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {children}
    </div>
  );
}

function ThresholdBar({ umbrales }: { umbrales: UmbralKPI }) {
  const rojoSpan  = Math.max(umbrales.rojo.max  - umbrales.rojo.min, 0);
  const amarSpan  = Math.max(umbrales.amarillo.max - umbrales.amarillo.min, 0);
  const verdeSpan = Math.max(umbrales.verde.max - umbrales.verde.min, 0);
  const total = rojoSpan + amarSpan + verdeSpan || 100;
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  return (
    <div
      style={{
        width: "100%",
        height: 18,
        borderRadius: 9,
        overflow: "hidden",
        display: "flex",
        marginBottom: 16,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{ width: pct(rojoSpan), background: "#ef4444", minWidth: rojoSpan > 0 ? 4 : 0, transition: "width 0.25s" }}
        title={`Rojo: ${umbrales.rojo.min}–${umbrales.rojo.max}`}
      />
      <div
        style={{ width: pct(amarSpan), background: "#eab308", minWidth: amarSpan > 0 ? 4 : 0, transition: "width 0.25s" }}
        title={`Amarillo: ${umbrales.amarillo.min}–${umbrales.amarillo.max}`}
      />
      <div
        style={{ width: pct(verdeSpan), background: "#22c55e", minWidth: verdeSpan > 0 ? 4 : 0, transition: "width 0.25s" }}
        title={`Verde: ${umbrales.verde.min}–${umbrales.verde.max}`}
      />
    </div>
  );
}

function Sparkline({
  data,
  umbrales,
}: {
  data: KPIConfig["historico"];
  umbrales: UmbralKPI;
}) {
  const W = 340;
  const H = 80;
  const PAD = 8;

  if (!data.length) {
    return (
      <div
        style={{
          height: H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.2)",
          fontSize: 12,
          background: "rgba(255,255,255,0.02)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        Sin datos históricos
      </div>
    );
  }

  const vals = data.map((d) => d.valor);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const pts: [number, number][] = data.map((d, i) => {
    const x =
      data.length === 1
        ? W / 2
        : PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = PAD + ((maxV - d.valor) / range) * (H - PAD * 2);
    return [x, y];
  });

  const polyPoints = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const lastColor  = getThresholdColor(vals[vals.length - 1], umbrales);
  const fillPoints = [
    ...pts.map(([x, y]) => `${x},${y}`),
    `${W - PAD},${H - PAD}`,
    `${PAD},${H - PAD}`,
  ].join(" ");

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{
        display: "block",
        background: "rgba(255,255,255,0.02)",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <defs>
        <linearGradient id="kpi-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lastColor} stopOpacity={0.28} />
          <stop offset="100%" stopColor={lastColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill="url(#kpi-spark-fill)" />
      <polyline
        points={polyPoints}
        fill="none"
        stroke={lastColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={2.5}
          fill={getThresholdColor(data[i].valor, umbrales)}
        />
      ))}
    </svg>
  );
}

function UmbralDot({ value, umbrales }: { value: number; umbrales: UmbralKPI }) {
  const color = getThresholdColor(value, umbrales);
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 5px ${color}80`,
      }}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function KpiBuilder({ wsId }: { wsId: string }) {
  const { data: kpis, isLoading, refetch } = useBuilderList<KPIConfig>(wsId, "kpi");
  const saveMut    = useBuilderSave<KPIConfig>(wsId, "kpi");
  const publishMut = useBuilderPublish(wsId, "kpi");
  const dupMut     = useBuilderDuplicate(wsId, "kpi");
  const delMut     = useBuilderDelete(wsId, "kpi");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft]           = useState<KPIConfig | null>(null);
  const formulaRef                  = useRef<HTMLTextAreaElement>(null);
  const cursorPos                   = useRef<number>(0);

  // ── Selection / CRUD ────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (id: string | null) => {
      if (!id) { setSelectedId(null); setDraft(null); return; }
      const found = kpis?.find((k) => k.id === id);
      if (found) { setSelectedId(id); setDraft({ ...found }); }
    },
    [kpis]
  );

  const handleNew = useCallback(() => {
    const kpi = makeDefaultKPI(wsId);
    setSelectedId(kpi.id);
    setDraft(kpi);
  }, [wsId]);

  const handleSave = useCallback(async () => {
    if (!draft) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...rest } = draft;
    const saved = await saveMut.mutateAsync(rest);
    setDraft(saved);
    setSelectedId(saved.id);
  }, [draft, saveMut]);

  const handlePublish = useCallback(async () => {
    if (!draft) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...rest } = draft;
    const saved     = await saveMut.mutateAsync(rest);
    const published = await publishMut.mutateAsync(saved.id);
    setDraft(published as KPIConfig);
  }, [draft, saveMut, publishMut]);

  const handleDuplicate = useCallback(
    async (id: string) => { await dupMut.mutateAsync(id); refetch(); },
    [dupMut, refetch]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await delMut.mutateAsync(id);
      if (selectedId === id) { setSelectedId(null); setDraft(null); }
      refetch();
    },
    [delMut, selectedId, refetch]
  );

  // ── Draft mutations ──────────────────────────────────────────────────────────

  function patch<K extends keyof KPIConfig>(key: K, val: KPIConfig[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: val } : prev));
  }

  function patchUmbral(zone: keyof UmbralKPI, bound: "min" | "max", val: number) {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            umbrales: {
              ...prev.umbrales,
              [zone]: { ...prev.umbrales[zone], [bound]: val },
            },
          }
        : prev
    );
  }

  const addVariable = useCallback(() => {
    const id = uid();
    const newVar: VariableFormula = {
      id,
      nombre: `var_${id.slice(5)}`,
      descripcion: "",
      fuente: "manual",
      tipo: "numero",
    };
    setDraft((prev) =>
      prev ? { ...prev, variables: [...prev.variables, newVar] } : prev
    );
  }, []);

  const removeVariable = useCallback((id: string) => {
    setDraft((prev) =>
      prev ? { ...prev, variables: prev.variables.filter((v) => v.id !== id) } : prev
    );
  }, []);

  function patchVariable(id: string, p: Partial<VariableFormula>) {
    setDraft((prev) =>
      prev
        ? { ...prev, variables: prev.variables.map((v) => (v.id === id ? { ...v, ...p } : v)) }
        : prev
    );
  }

  function insertVariable(nombre: string) {
    if (!formulaRef.current || !draft) return;
    const token  = `{${nombre}}`;
    const pos    = cursorPos.current;
    const next   = draft.formula.slice(0, pos) + token + draft.formula.slice(pos);
    patch("formula", next);
    const newPos = pos + token.length;
    cursorPos.current = newPos;
    setTimeout(() => {
      formulaRef.current?.focus();
      formulaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  }

  const formulaPreview = useMemo(
    () => (draft ? evaluateFormula(draft.formula, draft.variables) : ""),
    [draft]
  );

  const isBusy = saveMut.isPending || publishMut.isPending;
  const items  = kpis ?? [];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <BuilderShell
      wsId={wsId}
      meta={KPI_META}
      items={items}
      selectedId={selectedId}
      onSelect={handleSelect}
      onNew={handleNew}
      isLoading={isLoading}
    >
      {draft ? (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>

          {/* ── Scrollable editor ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

            {/* ── A. Información básica ── */}
            <div style={{ marginBottom: 32 }}>
              <SectionTitle>A. Información básica</SectionTitle>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Nombre</label>
                <input
                  style={inputStyle}
                  value={draft.nombre}
                  onChange={(e) => patch("nombre", e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 68, resize: "vertical", lineHeight: 1.5 }}
                  value={draft.descripcion ?? ""}
                  onChange={(e) => patch("descripcion", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Tipo de KPI</label>
                  <select
                    style={inputStyle}
                    value={draft.tipoKPI}
                    onChange={(e) => patch("tipoKPI", e.target.value as KPIConfig["tipoKPI"])}
                  >
                    <option value="porcentaje">Porcentaje</option>
                    <option value="numero">Número</option>
                    <option value="tiempo">Tiempo</option>
                    <option value="ratio">Ratio</option>
                    <option value="moneda">Moneda</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Unidad (ej. %, días, USD)</label>
                  <input
                    style={inputStyle}
                    value={draft.unidad}
                    placeholder='"%", "días", "USD"'
                    onChange={(e) => patch("unidad", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Frecuencia de cálculo</label>
                <select
                  style={inputStyle}
                  value={draft.frecuenciaCalculo}
                  onChange={(e) =>
                    patch("frecuenciaCalculo", e.target.value as KPIConfig["frecuenciaCalculo"])
                  }
                >
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            {/* ── B. Fórmula ── */}
            <div style={{ marginBottom: 32 }}>
              <SectionTitle>B. Fórmula</SectionTitle>

              <label style={labelStyle}>Expresión</label>
              <textarea
                ref={formulaRef}
                style={{
                  ...inputStyle,
                  fontFamily: "monospace",
                  minHeight: 72,
                  resize: "vertical",
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}
                value={draft.formula}
                placeholder="ej. {aprobados} / {total} * 100"
                onChange={(e) => patch("formula", e.target.value)}
                onSelect={(e) => { cursorPos.current = (e.target as HTMLTextAreaElement).selectionStart; }}
                onKeyUp={(e)  => { cursorPos.current = (e.target as HTMLTextAreaElement).selectionStart; }}
                onClick={(e)  => { cursorPos.current = (e.target as HTMLTextAreaElement).selectionStart; }}
              />

              {/* Variables panel */}
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.07)",
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.38)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Variables
                  </span>
                  <button
                    onClick={addVariable}
                    style={{
                      fontSize: 11,
                      padding: "4px 12px",
                      background: "rgba(46,107,230,0.15)",
                      border: "1px solid rgba(46,107,230,0.35)",
                      borderRadius: 6,
                      color: "#93bbfd",
                      cursor: "pointer",
                    }}
                  >
                    + Agregar variable
                  </button>
                </div>

                {draft.variables.length === 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.2)",
                      textAlign: "center",
                      padding: "16px 0",
                    }}
                  >
                    Sin variables. Agrega una para usarla en la fórmula.
                  </div>
                )}

                {draft.variables.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.07)",
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    {/* Name row + action buttons */}
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 10 }}
                    >
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Nombre del token</label>
                        <input
                          style={inputStyle}
                          value={v.nombre}
                          onChange={(e) => patchVariable(v.id, { nombre: e.target.value })}
                        />
                      </div>
                      <button
                        onClick={() => insertVariable(v.nombre)}
                        title="Insertar en la fórmula en posición del cursor"
                        style={{
                          flexShrink: 0,
                          padding: "7px 10px",
                          background: "rgba(34,197,94,0.12)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          borderRadius: 6,
                          color: "#86efac",
                          fontSize: 11,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Insertar variable
                      </button>
                      <button
                        onClick={() => removeVariable(v.id)}
                        style={{
                          flexShrink: 0,
                          padding: "7px 10px",
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          borderRadius: 6,
                          color: "#fca5a5",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        Eliminar
                      </button>
                    </div>

                    {/* Detail row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={labelStyle}>Fuente</label>
                        <select
                          style={inputStyle}
                          value={v.fuente}
                          onChange={(e) =>
                            patchVariable(v.id, { fuente: e.target.value as VariableFormula["fuente"] })
                          }
                        >
                          <option value="proceso">Proceso</option>
                          <option value="formulario">Formulario</option>
                          <option value="catalogo">Catálogo</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Campo fuente</label>
                        <input
                          style={inputStyle}
                          value={v.campoFuente ?? ""}
                          placeholder="campo"
                          onChange={(e) => patchVariable(v.id, { campoFuente: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Tipo</label>
                        <select
                          style={inputStyle}
                          value={v.tipo}
                          onChange={(e) =>
                            patchVariable(v.id, { tipo: e.target.value as VariableFormula["tipo"] })
                          }
                        >
                          <option value="numero">Número</option>
                          <option value="conteo">Conteo</option>
                          <option value="suma">Suma</option>
                          <option value="promedio">Promedio</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formula preview */}
              <div
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderRadius: 7,
                  border: "1px solid rgba(255,255,255,0.07)",
                  padding: "8px 14px",
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.3)" }}>Vista previa: </span>
                <span style={{ color: "#86efac" }}>
                  {formulaPreview || (draft.formula ? draft.formula : "—")}
                </span>
              </div>
            </div>

            {/* ── C. Meta y umbrales ── */}
            <div style={{ marginBottom: 32 }}>
              <SectionTitle>C. Meta y umbrales</SectionTitle>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>
                  Valor objetivo{draft.unidad ? ` (${draft.unidad})` : ""}
                </label>
                <input
                  type="number"
                  style={inputStyle}
                  value={draft.valorObjetivo}
                  onChange={(e) => patch("valorObjetivo", Number(e.target.value))}
                />
              </div>

              <label style={{ ...labelStyle, marginBottom: 8 }}>Visualización de umbrales</label>
              <ThresholdBar umbrales={draft.umbrales} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {/* Verde */}
                <div
                  style={{
                    background: "rgba(34,197,94,0.05)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 11, color: "#86efac", fontWeight: 700, marginBottom: 10 }}>
                    Verde
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={labelStyle}>Mínimo</label>
                    <input type="number" style={inputStyle} value={draft.umbrales.verde.min}
                      onChange={(e) => patchUmbral("verde", "min", Number(e.target.value))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Máximo</label>
                    <input type="number" style={inputStyle} value={draft.umbrales.verde.max}
                      onChange={(e) => patchUmbral("verde", "max", Number(e.target.value))} />
                  </div>
                </div>

                {/* Amarillo */}
                <div
                  style={{
                    background: "rgba(234,179,8,0.05)",
                    border: "1px solid rgba(234,179,8,0.2)",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 11, color: "#fde047", fontWeight: 700, marginBottom: 10 }}>
                    Amarillo
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={labelStyle}>Mínimo</label>
                    <input type="number" style={inputStyle} value={draft.umbrales.amarillo.min}
                      onChange={(e) => patchUmbral("amarillo", "min", Number(e.target.value))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Máximo</label>
                    <input type="number" style={inputStyle} value={draft.umbrales.amarillo.max}
                      onChange={(e) => patchUmbral("amarillo", "max", Number(e.target.value))} />
                  </div>
                </div>

                {/* Rojo */}
                <div
                  style={{
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 11, color: "#fca5a5", fontWeight: 700, marginBottom: 10 }}>
                    Rojo
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={labelStyle}>Mínimo</label>
                    <input type="number" style={inputStyle} value={draft.umbrales.rojo.min}
                      onChange={(e) => patchUmbral("rojo", "min", Number(e.target.value))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Máximo</label>
                    <input type="number" style={inputStyle} value={draft.umbrales.rojo.max}
                      onChange={(e) => patchUmbral("rojo", "max", Number(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── D. Histórico (read-only) ── */}
            {draft.historico.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <SectionTitle>D. Histórico (solo lectura)</SectionTitle>

                <div style={{ marginBottom: 14 }}>
                  <Sparkline data={draft.historico} umbrales={draft.umbrales} />
                </div>

                <div
                  style={{
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.07)",
                    overflow: "hidden",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                        <th
                          style={{
                            padding: "8px 14px",
                            textAlign: "left",
                            color: "rgba(255,255,255,0.38)",
                            fontWeight: 600,
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Fecha
                        </th>
                        <th
                          style={{
                            padding: "8px 14px",
                            textAlign: "right",
                            color: "rgba(255,255,255,0.38)",
                            fontWeight: 600,
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Valor
                        </th>
                        <th
                          style={{
                            padding: "8px 14px",
                            textAlign: "center",
                            color: "rgba(255,255,255,0.38)",
                            fontWeight: 600,
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {draft.historico.map((h, i) => (
                        <tr
                          key={i}
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.04)",
                            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                          }}
                        >
                          <td style={{ padding: "8px 14px", color: "rgba(255,255,255,0.65)" }}>
                            {h.fecha}
                          </td>
                          <td
                            style={{
                              padding: "8px 14px",
                              textAlign: "right",
                              color: "white",
                              fontWeight: 500,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {h.valor}
                            {draft.unidad && (
                              <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 4, fontSize: 10 }}>
                                {draft.unidad}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "8px 14px", textAlign: "center" }}>
                            <UmbralDot value={h.valor} umbrales={draft.umbrales} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom action bar ── */}
          <div
            style={{
              flexShrink: 0,
              padding: "12px 28px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <StatusBadge status={draft.status} />
            <div style={{ flex: 1 }} />
            <button
              onClick={handleSave}
              disabled={isBusy}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                fontSize: 13,
                cursor: isBusy ? "not-allowed" : "pointer",
                opacity: saveMut.isPending ? 0.55 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {saveMut.isPending ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              onClick={handlePublish}
              disabled={isBusy}
              style={{
                padding: "8px 22px",
                borderRadius: 8,
                border: "none",
                background: KPI_META.color,
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: isBusy ? "not-allowed" : "pointer",
                opacity: publishMut.isPending ? 0.55 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {publishMut.isPending ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.2)",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 36, opacity: 0.35 }}>📊</div>
          <div style={{ fontSize: 14 }}>Selecciona un KPI o crea uno nuevo</div>
        </div>
      )}
    </BuilderShell>
  );
}
