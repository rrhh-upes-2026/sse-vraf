"use client";

/**
 * PanelPaso — renders the appropriate action panel for each of the 27 steps
 * of PRO-TH-001. Steps without their own form show an informational panel.
 */

import type { PasoDefinicion } from "./ProcesoTimeline";
import type { ProcesoContratacion } from "@/types/contratacion";
import { FormRequisicion } from "./FormRequisicion";

const TIPO_COLOR: Record<string, string> = {
  P: "#2E6BE6",
  H: "#0F8A8A",
  D: "#E5A100",
  V: "#5B4FD0",
  A: "#12A150",
};

const TIPO_LABEL: Record<string, string> = {
  P: "Proceso",
  H: "Tarea",
  D: "Decisión",
  V: "Verificación",
  A: "Aprobación",
};

// ── Contenido por etapa ───────────────────────────────────────────────────────

function contenidoPorPaso(
  paso: PasoDefinicion,
  proceso: ProcesoContratacion,
  wsId: string,
  esActual: boolean,
) {
  // Paso 8: Formulario de Requisición de Personal
  if (paso.numero === 8) {
    return (
      <FormRequisicion
        procesoId={proceso.id}
        requisicionId={proceso.requisicionId}
        wsId={wsId}
        soloLectura={!esActual}
      />
    );
  }

  // Resto de pasos — panel informativo con instrucciones institucionales
  return <PanelInformativo paso={paso} proceso={proceso} esActual={esActual} />;
}

// ── Panel informativo para pasos sin formulario propio ────────────────────────

function PanelInformativo({
  paso,
  proceso,
  esActual,
}: {
  paso: PasoDefinicion;
  proceso: ProcesoContratacion;
  esActual: boolean;
}) {
  const color = TIPO_COLOR[paso.tipo] ?? "#6b7280";

  return (
    <div style={{ padding: "28px 32px", maxWidth: 680 }}>
      {/* Instrucciones del responsable */}
      <div
        style={{
          background: color + "10",
          border: `1px solid ${color}30`,
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: color, letterSpacing: "0.05em", marginBottom: 8 }}>
          RESPONSABLE
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "white", marginBottom: 4 }}>
          {paso.responsable}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
          {paso.actividad}
        </div>
      </div>

      {/* Puntos de decisión */}
      {paso.esDecision && (
        <div
          style={{
            background: "rgba(229,160,0,0.08)",
            border: "1px solid rgba(229,160,0,0.25)",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#E5A100", letterSpacing: "0.05em", marginBottom: 12 }}>
            PUNTO DE DECISIÓN
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: "rgba(34,197,94,0.15)",
                  color: "#22c55e",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                SÍ
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{paso.opcionSi}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: "rgba(239,68,68,0.12)",
                  color: "#ef4444",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                NO
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{paso.opcionNo}</span>
            </div>
          </div>
        </div>
      )}

      {/* Referencia al proceso */}
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>
        Proceso: {proceso.codigo} — {proceso.nombrePuesto}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
        Unidad: {proceso.unidadFacultad}
      </div>

      {/* Aviso si no es el paso actual */}
      {!esActual && (
        <div
          style={{
            marginTop: 24,
            padding: "10px 16px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 8,
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Este paso no es el actual — se muestra en modo consulta.
        </div>
      )}
    </div>
  );
}

// ── Componente exportado ──────────────────────────────────────────────────────

interface PanelPasoProps {
  paso: PasoDefinicion;
  proceso: ProcesoContratacion;
  wsId: string;
  esActual: boolean;
}

export function PanelPaso({ paso, proceso, wsId, esActual }: PanelPasoProps) {
  const color = TIPO_COLOR[paso.tipo] ?? "#6b7280";

  return (
    <div>
      {/* Cabecera del paso */}
      <div
        style={{
          padding: "18px 32px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        {/* Número */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: esActual ? "#2E6BE6" : "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 700,
            color: esActual ? "white" : "rgba(255,255,255,0.3)",
          }}
        >
          {paso.numero}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "white",
              lineHeight: 1.35,
              marginBottom: 6,
            }}
          >
            {paso.actividad}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: 4,
                background: color + "20",
                color: color,
                letterSpacing: "0.04em",
              }}
            >
              {TIPO_LABEL[paso.tipo]}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{paso.responsable}</span>
            {esActual && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  background: "rgba(46,107,230,0.2)",
                  color: "#2E6BE6",
                  padding: "1px 6px",
                  borderRadius: 4,
                  letterSpacing: "0.05em",
                }}
              >
                PASO ACTUAL
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido del paso */}
      {contenidoPorPaso(paso, proceso, wsId, esActual)}
    </div>
  );
}
