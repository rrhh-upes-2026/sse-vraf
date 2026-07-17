"use client";

/**
 * DocumentosPanel — documentos generados por un paso de PRO-TH-001,
 * con gestión de estado y historial de versiones.
 */

import { useState } from "react";

interface DocumentoGenerado {
  id: string;
  nombre: string;
  descripcion: string;
  automatico: boolean;
}

interface DocumentosPanelProps {
  procesoId: string;
  documentosGenerados: DocumentoGenerado[];
}

// ── Tipos de estado ───────────────────────────────────────────────────────────

type EstadoDocumento = "borrador" | "aprobado" | "firmado" | "archivado";

interface VersionEntry {
  version: number;
  estado: EstadoDocumento;
  fecha: string;
}

interface DocState {
  estado: EstadoDocumento;
  version: number;
  historial: VersionEntry[];
}

// ── Mapas de presentación ─────────────────────────────────────────────────────

const ESTADO_LABEL: Record<EstadoDocumento, string> = {
  borrador:  "Borrador",
  aprobado:  "Aprobado",
  firmado:   "Firmado",
  archivado: "Archivado",
};

const ESTADO_COLOR: Record<EstadoDocumento, string> = {
  borrador:  "#E5A100",
  aprobado:  "#2E6BE6",
  firmado:   "#22c55e",
  archivado: "rgba(255,255,255,0.35)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtFecha(iso: string): string {
  const d = new Date(iso);
  const meses = [
    "ene","feb","mar","abr","may","jun",
    "jul","ago","sep","oct","nov","dic",
  ];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function estadoInicial(): DocState {
  return {
    estado: "borrador",
    version: 1,
    historial: [
      {
        version: 1,
        estado: "borrador",
        fecha: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  };
}

// ── Acciones disponibles según estado ─────────────────────────────────────────

interface Accion {
  label: string;
  nextEstado: EstadoDocumento | null;
  color: string;
  textColor: string;
}

function accionesPorEstado(estado: EstadoDocumento): Accion[] {
  switch (estado) {
    case "borrador":
      return [
        {
          label:      "Ver borrador",
          nextEstado: null,
          color:      "rgba(255,255,255,0.06)",
          textColor:  "rgba(255,255,255,0.5)",
        },
        {
          label:      "Aprobar",
          nextEstado: "aprobado",
          color:      "rgba(46,107,230,0.15)",
          textColor:  "#2E6BE6",
        },
      ];
    case "aprobado":
      return [
        {
          label:      "Ver documento",
          nextEstado: null,
          color:      "rgba(255,255,255,0.06)",
          textColor:  "rgba(255,255,255,0.5)",
        },
        {
          label:      "Enviar para firma",
          nextEstado: "firmado",
          color:      "rgba(34,197,94,0.12)",
          textColor:  "#22c55e",
        },
      ];
    case "firmado":
      return [
        {
          label:      "Ver documento",
          nextEstado: null,
          color:      "rgba(255,255,255,0.06)",
          textColor:  "rgba(255,255,255,0.5)",
        },
        {
          label:      "Archivar",
          nextEstado: "archivado",
          color:      "rgba(255,255,255,0.07)",
          textColor:  "rgba(255,255,255,0.45)",
        },
      ];
    case "archivado":
      return [
        {
          label:      "Ver archivo",
          nextEstado: null,
          color:      "rgba(255,255,255,0.05)",
          textColor:  "rgba(255,255,255,0.35)",
        },
      ];
  }
}

// ── Tarjeta de documento ──────────────────────────────────────────────────────

function DocumentoCard({
  doc,
  docState,
  onTransicion,
}: {
  doc: DocumentoGenerado;
  docState: DocState;
  onTransicion: (id: string, next: EstadoDocumento) => void;
}) {
  const [expandirHistorial, setExpandirHistorial] = useState(false);
  const estadoColor = ESTADO_COLOR[docState.estado];
  const acciones    = accionesPorEstado(docState.estado);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "16px 18px",
        marginBottom: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        {/* Icono */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Nombre, badges y descripción */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
              {doc.nombre}
            </span>

            {/* Automático / Manual */}
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
                background: doc.automatico
                  ? "rgba(46,107,230,0.15)"
                  : "rgba(255,255,255,0.07)",
                color: doc.automatico ? "#2E6BE6" : "rgba(255,255,255,0.4)",
                letterSpacing: "0.05em",
              }}
            >
              {doc.automatico ? "AUTOMÁTICO" : "MANUAL"}
            </span>

            {/* Estado */}
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
                background: estadoColor + "22",
                color: estadoColor,
                letterSpacing: "0.04em",
              }}
            >
              {ESTADO_LABEL[docState.estado].toUpperCase()}
            </span>

            {/* Versión */}
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.05)",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              v{docState.version}
            </span>
          </div>

          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
            {doc.descripcion}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {acciones.map((a, i) => (
          <button
            key={i}
            onClick={() => { if (a.nextEstado) onTransicion(doc.id, a.nextEstado); }}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 6,
              background: a.color,
              color: a.textColor,
              border: "1px solid rgba(255,255,255,0.07)",
              cursor: a.nextEstado ? "pointer" : "default",
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Historial de versiones */}
      <div>
        <button
          onClick={() => setExpandirHistorial((v) => !v)}
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg
            width={10}
            height={10}
            viewBox="0 0 24 24"
            fill="none"
            style={{
              transform: expandirHistorial ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
            }}
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Historial ({docState.historial.length} entrada{docState.historial.length > 1 ? "s" : ""})
        </button>

        {expandirHistorial && (
          <div
            style={{
              marginTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 8,
            }}
          >
            {docState.historial.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "4px 0",
                }}
              >
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", minWidth: 20 }}>
                  v{h.version}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "1px 6px",
                    borderRadius: 3,
                    background: ESTADO_COLOR[h.estado] + "20",
                    color: ESTADO_COLOR[h.estado],
                  }}
                >
                  {ESTADO_LABEL[h.estado]}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                  {fmtFecha(h.fecha)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function DocumentosPanel({ procesoId: _procesoId, documentosGenerados }: DocumentosPanelProps) {
  const [docStates, setDocStates] = useState<Record<string, DocState>>(() =>
    Object.fromEntries(documentosGenerados.map((d) => [d.id, estadoInicial()]))
  );

  function handleTransicion(id: string, next: EstadoDocumento) {
    setDocStates((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: {
          estado:   next,
          version:  current.version,
          historial: [
            ...current.historial,
            { version: current.version, estado: next, fecha: new Date().toISOString() },
          ],
        },
      };
    });
  }

  const firmados   = Object.values(docStates).filter((s) => s.estado === "firmado" || s.estado === "archivado").length;
  const aprobados  = Object.values(docStates).filter((s) => s.estado === "aprobado").length;
  const borradores = Object.values(docStates).filter((s) => s.estado === "borrador").length;

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>
            Documentos generados
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {documentosGenerados.length} documento{documentosGenerados.length !== 1 ? "s" : ""} en este paso
          </div>
        </div>

        {/* Mini resumen de estados */}
        {documentosGenerados.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            {borradores > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(229,160,0,0.12)",
                  color: "#E5A100",
                }}
              >
                {borradores} borrador{borradores > 1 ? "es" : ""}
              </span>
            )}
            {aprobados > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(46,107,230,0.12)",
                  color: "#2E6BE6",
                }}
              >
                {aprobados} aprobado{aprobados > 1 ? "s" : ""}
              </span>
            )}
            {firmados > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(34,197,94,0.12)",
                  color: "#22c55e",
                }}
              >
                {firmados} firmado{firmados > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lista */}
      {documentosGenerados.length === 0 ? (
        <div
          style={{
            padding: "28px 0",
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          No hay documentos para este paso.
        </div>
      ) : (
        documentosGenerados.map((doc) => (
          <DocumentoCard
            key={doc.id}
            doc={doc}
            docState={docStates[doc.id] ?? estadoInicial()}
            onTransicion={handleTransicion}
          />
        ))
      )}
    </div>
  );
}
