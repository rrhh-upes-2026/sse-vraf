"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BUILDER_REGISTRY,
  type ProcedureConfig,
  type ProcessConfig,
  type PasoMapeado,
} from "@/types/builders";
import { BuilderShell, StatusBadge } from "@/components/builders/BuilderShell";
import {
  useBuilderList,
  useBuilderSave,
  useBuilderPublish,
  useBuilderDuplicate,
} from "@/hooks/useBuilder";
import { BuilderSDK } from "@/services/builder-sdk";

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  fontSize: 12,
  outline: "none",
  boxSizing: "border-box" as const,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "rgba(255,255,255,0.4)",
  textTransform: "uppercase" as const,
  marginBottom: 6,
};

function btnStyle(accent: string, outline?: boolean): React.CSSProperties {
  return {
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    border: outline ? `1px solid ${accent}` : "none",
    background: outline ? "transparent" : accent,
    color: outline ? accent : "white",
  };
}

const dangerBtnStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.25)",
  borderRadius: 5,
  padding: "3px 7px",
  cursor: "pointer",
  color: "#ef4444",
  fontSize: 11,
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "16px",
  marginBottom: 16,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `x${Math.random().toString(36).slice(2, 9)}`;
}

function emptyProcedure(wsId: string): ProcedureConfig {
  const now = new Date().toISOString();
  return {
    id: uid(),
    wsId,
    nombre: "Nuevo procedimiento",
    descripcion: "",
    version: 1,
    status: "draft",
    tipo: "procedure",
    versionInstitucional: "1.0",
    vigente: true,
    pasosMapeados: [],
    creadoPor: "usuario",
    createdAt: now,
    updatedAt: now,
  };
}

function emptyPaso(numeroPaso: number): PasoMapeado {
  return {
    id: uid(),
    numeroPaso,
    titulo: "",
    etapaProcesoId: undefined,
    observaciones: "",
  };
}

// ── Procedure editor ──────────────────────────────────────────────────────────

function ProcedureEditor({
  initial,
  wsId,
  onSaved,
}: {
  initial: ProcedureConfig;
  wsId: string;
  onSaved: (p: ProcedureConfig) => void;
}) {
  const ACCENT = "#5B4FD0";
  const [config, setConfig] = useState<ProcedureConfig>(initial);

  const saveMut = useBuilderSave<ProcedureConfig>(wsId, "procedure");
  const publishMut = useBuilderPublish(wsId, "procedure");
  const duplicateMut = useBuilderDuplicate(wsId, "procedure");

  // Load all processes for the process selector
  const { data: procesos = [] } = useQuery<ProcessConfig[]>({
    queryKey: ["builders", wsId, "process"],
    queryFn: () => BuilderSDK.getProcessList(wsId),
  });

  // Etapas of the currently linked process
  const linkedProcess = procesos.find((p) => p.id === config.procesoId) ?? null;
  const etapasDisponibles = linkedProcess?.etapas ?? [];

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const saved = await saveMut.mutateAsync(config);
    setConfig(saved);
    onSaved(saved);
  };

  const handlePublish = async () => {
    const published = await publishMut.mutateAsync(config.id);
    setConfig(published as ProcedureConfig);
    onSaved(published as ProcedureConfig);
  };

  const handleDuplicate = async () => {
    await duplicateMut.mutateAsync(config.id);
  };

  const handleUpload = () => {
    // Simulated upload — sets a mock filename
    const mockNames = [
      "PRO-TH-001-v2.pdf",
      "procedimiento-contratacion.pdf",
      "DOC-OFICIAL-2026.pdf",
    ];
    const name = mockNames[Math.floor(Math.random() * mockNames.length)];
    setConfig((c) => ({
      ...c,
      documentoOficialNombre: name,
      documentoOficialUrl: `/docs/${name}`,
    }));
  };

  const addPaso = () => {
    setConfig((c) => ({
      ...c,
      pasosMapeados: [...c.pasosMapeados, emptyPaso(c.pasosMapeados.length + 1)],
    }));
  };

  const updatePaso = (idx: number, updated: PasoMapeado) => {
    setConfig((c) => {
      const pasosMapeados = [...c.pasosMapeados];
      pasosMapeados[idx] = updated;
      return { ...c, pasosMapeados };
    });
  };

  const deletePaso = (idx: number) => {
    setConfig((c) => ({
      ...c,
      pasosMapeados: c.pasosMapeados
        .filter((_, i) => i !== idx)
        .map((p, i) => ({ ...p, numeroPaso: i + 1 })),
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            style={{
              ...inputStyle,
              flex: 1,
              fontSize: 18,
              fontWeight: 700,
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 0,
              padding: "4px 0",
            }}
            value={config.nombre}
            onChange={(e) => setConfig((c) => ({ ...c, nombre: e.target.value }))}
            placeholder="Nombre del procedimiento"
          />
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.06)",
              padding: "2px 8px",
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            v{config.version}
          </span>
          <StatusBadge status={config.status} />
          <button
            style={btnStyle(ACCENT, true)}
            onClick={handleSave}
            disabled={saveMut.isPending}
          >
            {saveMut.isPending ? "Guardando…" : "Guardar"}
          </button>
          <button
            style={btnStyle(ACCENT)}
            onClick={handlePublish}
            disabled={publishMut.isPending || config.status === "published"}
          >
            Publicar
          </button>
        </div>

        {/* Quick meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...sectionLabelStyle, marginBottom: 0 }}>
              Versión institucional
            </span>
            <input
              style={{ ...inputStyle, width: 100 }}
              value={config.versionInstitucional}
              onChange={(e) =>
                setConfig((c) => ({ ...c, versionInstitucional: e.target.value }))
              }
              placeholder="1.0"
            />
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: config.vigente ? "#22c55e" : "rgba(255,255,255,0.35)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={config.vigente}
              onChange={(e) =>
                setConfig((c) => ({ ...c, vigente: e.target.checked }))
              }
            />
            Vigente
          </label>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {/* ── Documento oficial ── */}
        <div style={cardStyle}>
          <div style={{ ...sectionLabelStyle, marginBottom: 12 }}>
            Documento oficial
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {config.documentoOficialNombre ? (
                <>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      stroke={ACCENT}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ fontSize: 12, color: "white" }}>
                    {config.documentoOficialNombre}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  Ningún documento cargado
                </span>
              )}
            </div>
            <button style={btnStyle(ACCENT, true)} onClick={handleUpload}>
              {config.documentoOficialNombre ? "Reemplazar" : "Cargar documento"}
            </button>
            {config.documentoOficialNombre && (
              <button
                style={dangerBtnStyle}
                onClick={() =>
                  setConfig((c) => ({
                    ...c,
                    documentoOficialNombre: undefined,
                    documentoOficialUrl: undefined,
                  }))
                }
              >
                ✕
              </button>
            )}
          </div>

          {/* Process selector */}
          <div>
            <div style={{ ...sectionLabelStyle, marginBottom: 6 }}>
              Proceso vinculado
            </div>
            <select
              style={inputStyle}
              value={config.procesoId ?? ""}
              onChange={(e) => {
                const val = e.target.value || undefined;
                setConfig((c) => ({
                  ...c,
                  procesoId: val,
                  // Clear etapa references when process changes
                  pasosMapeados: c.pasosMapeados.map((p) => ({
                    ...p,
                    etapaProcesoId: undefined,
                  })),
                }));
              }}
            >
              <option value="">— Sin proceso vinculado —</option>
              {procesos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (v{p.version})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Pasos mapeados ── */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ ...sectionLabelStyle, marginBottom: 0 }}>
              Pasos mapeados
            </div>
            <button style={btnStyle(ACCENT, true)} onClick={addPaso}>
              + Agregar paso
            </button>
          </div>

          {config.pasosMapeados.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "rgba(255,255,255,0.25)",
                fontSize: 12,
              }}
            >
              No hay pasos mapeados. Agrega el primero.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr>
                    {["N°", "Título del paso", "Etapa del proceso", "Observaciones", ""].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "6px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            color: "rgba(255,255,255,0.35)",
                            borderBottom: "1px solid rgba(255,255,255,0.07)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {config.pasosMapeados.map((paso, idx) => (
                    <tr
                      key={paso.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {/* N° */}
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "rgba(255,255,255,0.5)",
                          fontWeight: 700,
                          width: 36,
                        }}
                      >
                        {paso.numeroPaso}
                      </td>

                      {/* Título */}
                      <td style={{ padding: "6px 8px", minWidth: 180 }}>
                        <input
                          style={inputStyle}
                          value={paso.titulo}
                          placeholder="Título del paso"
                          onChange={(e) =>
                            updatePaso(idx, { ...paso, titulo: e.target.value })
                          }
                        />
                      </td>

                      {/* Etapa */}
                      <td style={{ padding: "6px 8px", minWidth: 180 }}>
                        <select
                          style={inputStyle}
                          value={paso.etapaProcesoId ?? ""}
                          disabled={etapasDisponibles.length === 0}
                          onChange={(e) =>
                            updatePaso(idx, {
                              ...paso,
                              etapaProcesoId: e.target.value || undefined,
                            })
                          }
                        >
                          <option value="">
                            {etapasDisponibles.length === 0
                              ? "— Vincula un proceso —"
                              : "— Sin etapa —"}
                          </option>
                          {etapasDisponibles.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.orden}. {e.nombre}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Observaciones */}
                      <td style={{ padding: "6px 8px", minWidth: 160 }}>
                        <input
                          style={inputStyle}
                          value={paso.observaciones ?? ""}
                          placeholder="Observaciones opcionales"
                          onChange={(e) =>
                            updatePaso(idx, {
                              ...paso,
                              observaciones: e.target.value,
                            })
                          }
                        />
                      </td>

                      {/* Delete */}
                      <td style={{ padding: "6px 8px", width: 36, textAlign: "center" }}>
                        <button
                          style={dangerBtnStyle}
                          onClick={() => deletePaso(idx)}
                          title="Eliminar paso"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bottom toolbar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "10px 20px",
          display: "flex",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <button
          style={btnStyle(ACCENT)}
          onClick={handlePublish}
          disabled={publishMut.isPending || config.status === "published"}
        >
          {publishMut.isPending ? "Publicando…" : "Publicar"}
        </button>
        <button
          style={btnStyle("#5B4FD0", true)}
          onClick={handleDuplicate}
          disabled={duplicateMut.isPending}
        >
          {duplicateMut.isPending ? "Duplicando…" : "Duplicar"}
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ProcedureBuilder({ wsId }: { wsId: string }) {
  const meta = BUILDER_REGISTRY.find((b) => b.tipo === "procedure")!;
  const { data: items = [], isLoading } = useBuilderList<ProcedureConfig>(wsId, "procedure");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localNew, setLocalNew] = useState<ProcedureConfig | null>(null);

  const selectedItem =
    localNew ??
    (selectedId ? (items.find((i) => i.id === selectedId) ?? null) : null);

  const handleNew = () => {
    setLocalNew(emptyProcedure(wsId));
    setSelectedId(null);
  };

  const handleSaved = (saved: ProcedureConfig) => {
    setLocalNew(null);
    setSelectedId(saved.id);
  };

  return (
    <BuilderShell
      wsId={wsId}
      meta={meta}
      items={items}
      selectedId={localNew ? null : selectedId}
      onSelect={(id) => {
        setLocalNew(null);
        setSelectedId(id);
      }}
      onNew={handleNew}
      isLoading={isLoading}
    >
      {selectedItem ? (
        <ProcedureEditor
          key={selectedItem.id}
          initial={selectedItem}
          wsId={wsId}
          onSaved={handleSaved}
        />
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <path
              d={meta.icono}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p style={{ fontSize: 14, margin: 0 }}>
            Selecciona un procedimiento o crea uno nuevo
          </p>
        </div>
      )}
    </BuilderShell>
  );
}
