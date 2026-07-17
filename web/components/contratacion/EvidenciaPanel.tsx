"use client";

/**
 * EvidenciaPanel — lista de evidencias requeridas para un paso de PRO-TH-001,
 * con simulación de carga de archivos y path de Google Drive.
 */

import { useState, useRef } from "react";

interface EvidenciaRequerida {
  id: string;
  nombre: string;
  descripcion: string;
  obligatoria: boolean;
  tiposAceptados: string[];
}

interface EvidenciaPanelProps {
  procesoId: string;
  paso: number;
  evidenciasRequeridas: EvidenciaRequerida[];
  soloLectura?: boolean;
}

// ── Helper: ruta simulada de Google Drive ─────────────────────────────────────

function buildDrivePath(procesoId: string, filename: string): string {
  const year = new Date().getFullYear();
  return `RRHH/Contratacion/${year}/${procesoId}/Evidencias/${filename}`;
}

// ── Ítem de evidencia ─────────────────────────────────────────────────────────

function EvidenciaItem({
  evidencia,
  procesoId,
  archivoSubido,
  soloLectura,
  onSubir,
}: {
  evidencia: EvidenciaRequerida;
  procesoId: string;
  archivoSubido: string | null;
  soloLectura: boolean;
  onSubir: (id: string, filename: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onSubir(evidencia.id, file.name);
    // Reset so the same file can be re-selected if needed
    if (inputRef.current) inputRef.current.value = "";
  }

  const drivePath = archivoSubido ? buildDrivePath(procesoId, archivoSubido) : null;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${archivoSubido ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 10,
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Icono de documento */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: archivoSubido
              ? "rgba(34,197,94,0.1)"
              : "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {archivoSubido ? (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6 9 17l-5-5"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {/* Contenido principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Nombre + badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
              {evidencia.nombre}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
                background: evidencia.obligatoria
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(255,255,255,0.07)",
                color: evidencia.obligatoria ? "#ef4444" : "rgba(255,255,255,0.4)",
                letterSpacing: "0.05em",
              }}
            >
              {evidencia.obligatoria ? "OBLIGATORIA" : "OPCIONAL"}
            </span>
          </div>

          {/* Descripción */}
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.45,
              marginBottom: 8,
            }}
          >
            {evidencia.descripcion}
          </div>

          {/* Tipos aceptados */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Acepta:</span>
            {evidencia.tiposAceptados.map((tipo) => (
              <span
                key={tipo}
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                {tipo.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Estado de carga */}
          {archivoSubido && drivePath ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6 9 17l-5-5"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>Subido</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  — {archivoSubido}
                </span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.25)",
                  fontFamily: "monospace",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 4,
                  padding: "4px 8px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={drivePath}
              >
                {drivePath}
              </div>
            </div>
          ) : (
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 4,
                background: "rgba(229,160,0,0.12)",
                color: "#E5A100",
              }}
            >
              Pendiente
            </span>
          )}
        </div>

        {/* Botón de carga */}
        {!soloLectura && (
          <div style={{ flexShrink: 0 }}>
            <input
              ref={inputRef}
              type="file"
              style={{ display: "none" }}
              accept={evidencia.tiposAceptados.map((t) => `.${t}`).join(",")}
              onChange={handleChange}
            />
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 6,
                background: archivoSubido
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(46,107,230,0.12)",
                color: archivoSubido ? "rgba(255,255,255,0.35)" : "#2E6BE6",
                border: `1px solid ${archivoSubido ? "rgba(255,255,255,0.07)" : "rgba(46,107,230,0.25)"}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                whiteSpace: "nowrap",
              }}
            >
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {archivoSubido ? "Reemplazar" : "Subir"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EvidenciaPanel({
  procesoId,
  paso,
  evidenciasRequeridas,
  soloLectura = false,
}: EvidenciaPanelProps) {
  const [archivosSubidos, setArchivosSubidos] = useState<Record<string, string>>({});

  function handleSubir(id: string, filename: string) {
    setArchivosSubidos((prev) => ({ ...prev, [id]: filename }));
  }

  const total                = evidenciasRequeridas.length;
  const subidas              = Object.keys(archivosSubidos).length;
  const obligatorias         = evidenciasRequeridas.filter((e) => e.obligatoria);
  const obligatoriasSubidas  = obligatorias.filter((e) => archivosSubidos[e.id]).length;
  const todoCompleto         = subidas === total && total > 0;

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>
            Evidencias requeridas
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Paso {paso}
            {" · "}
            <span style={{ color: subidas > 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.4)" }}>
              {subidas}/{total} archivos subidos
            </span>
            {obligatorias.length > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  color:
                    obligatoriasSubidas === obligatorias.length ? "#22c55e" : "#E5A100",
                }}
              >
                · {obligatoriasSubidas}/{obligatorias.length} obligatorias
              </span>
            )}
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 6,
            background: todoCompleto
              ? "rgba(34,197,94,0.12)"
              : "rgba(229,160,0,0.1)",
            color: todoCompleto ? "#22c55e" : "#E5A100",
            flexShrink: 0,
          }}
        >
          {todoCompleto
            ? "Completo"
            : total - subidas === 0
              ? "Completo"
              : `${total - subidas} pendiente${total - subidas > 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Lista de evidencias */}
      {evidenciasRequeridas.length === 0 ? (
        <div
          style={{
            padding: "28px 0",
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          No hay evidencias requeridas para este paso.
        </div>
      ) : (
        evidenciasRequeridas.map((ev) => (
          <EvidenciaItem
            key={ev.id}
            evidencia={ev}
            procesoId={procesoId}
            archivoSubido={archivosSubidos[ev.id] ?? null}
            soloLectura={soloLectura}
            onSubir={handleSubir}
          />
        ))
      )}

      {/* Nota modo solo lectura */}
      {soloLectura && (
        <div
          style={{
            marginTop: 12,
            padding: "8px 14px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 6,
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Modo solo lectura — no se pueden cargar nuevos archivos.
        </div>
      )}
    </div>
  );
}
