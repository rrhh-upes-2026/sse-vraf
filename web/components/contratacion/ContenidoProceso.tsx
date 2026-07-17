"use client";

import { useState } from "react";
import Link from "next/link";
import { useProcesoContratacion } from "@/hooks/useContratacion";
import { ProcesoTimeline, PASOS_PRO_TH_001 } from "./ProcesoTimeline";
import { StepExecutor } from "./StepExecutor";
import { AuditTrailPanel } from "./AuditTrailPanel";
import { calcularCompletitud } from "@/lib/contratacion-engine";
import { ROL_LABEL } from "@/types/proceso-engine";
import type { StepSpec } from "@/types/proceso-engine";
import { getStepSpec } from "@/lib/contratacion-engine";

// ── Vista de la columna derecha ───────────────────────────────────────────────

type VistaPanel = "paso" | "auditoria";

// ── Barra de resumen del proceso ──────────────────────────────────────────────

function ResumenProceso({
  pasoActual,
  etapaActual,
  spec,
}: {
  pasoActual: number;
  etapaActual: string;
  spec: StepSpec | undefined;
}) {
  const pct = calcularCompletitud(pasoActual, etapaActual);
  const completado = etapaActual === "completado";
  const rechazado  = etapaActual === "rechazado";

  const pctColor = completado
    ? "#22c55e"
    : rechazado
      ? "#ef4444"
      : pct >= 70
        ? "#22c55e"
        : pct >= 40
          ? "#E5A100"
          : "#2E6BE6";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "10px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)",
        flexShrink: 0,
        flexWrap: "wrap",
      }}
    >
      {/* Progreso */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
        <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
          <svg width={36} height={36} viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke={pctColor}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 800,
              color: pctColor,
            }}
          >
            {pct}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>
            {completado ? "Completado" : rechazado ? "Rechazado" : `Paso ${pasoActual} / 27`}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
            {completado ? "Proceso cerrado" : rechazado ? "Proceso terminado" : "En progreso"}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

      {/* Responsable del paso actual */}
      {spec && !completado && !rechazado && (
        <>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Responsable</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
              {ROL_LABEL[spec.responsable]}
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Duración estimada</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
              {spec.duracionEstimadaDias} día{spec.duracionEstimadaDias !== 1 ? "s" : ""}
            </div>
          </div>
        </>
      )}

      {/* Indicador de riesgo */}
      {!completado && !rechazado && pasoActual > 20 && (
        <>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#E5A100",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: 11, color: "#E5A100", fontWeight: 600 }}>Fase de cierre</span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface ContenidoProcesoProps {
  wsId: string;
  procesoId: string;
}

export function ContenidoProceso({ wsId, procesoId }: ContenidoProcesoProps) {
  const { data: proceso, isLoading, error } = useProcesoContratacion(procesoId);
  const [pasoSeleccionado, setPasoSeleccionado] = useState<number | null>(null);
  const [vista, setVista] = useState<VistaPanel>("paso");

  if (isLoading) return <CargandoProceso />;
  if (error || !proceso) return <ErrorProceso wsId={wsId} />;

  const pasoActual = proceso.pasoActual;
  const pasoVista  = pasoSeleccionado ?? pasoActual;
  const pasoInfo   = PASOS_PRO_TH_001.find((p) => p.numero === pasoVista);
  const spec       = getStepSpec(pasoActual);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <Link
          href={`/ws/${wsId}/contratacion`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "rgba(255,255,255,0.45)",
            textDecoration: "none",
            fontSize: 12,
            padding: "4px 6px",
            borderRadius: 6,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Contratación
        </Link>

        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>/</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {proceso.nombrePuesto}
          </span>
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.06)",
            padding: "3px 8px",
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          {proceso.codigo}
        </span>

        {proceso.prioridad === "urgente" && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#ef4444",
              background: "rgba(239,68,68,0.12)",
              padding: "2px 7px",
              borderRadius: 4,
              letterSpacing: "0.06em",
              flexShrink: 0,
            }}
          >
            URGENTE
          </span>
        )}

        {/* Vista switcher */}
        <div
          style={{
            display: "flex",
            gap: 2,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 8,
            padding: 3,
            flexShrink: 0,
          }}
        >
          {(["paso", "auditoria"] as VistaPanel[]).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                background: vista === v ? "rgba(255,255,255,0.1)" : "transparent",
                color: vista === v ? "white" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {v === "paso" ? "Pasos" : "Auditoría"}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de resumen */}
      <ResumenProceso
        pasoActual={pasoActual}
        etapaActual={proceso.etapaActual}
        spec={spec}
      />

      {/* Cuerpo */}
      {vista === "auditoria" ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
          <AuditTrailPanel proceso={proceso} />
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
          {/* ── Columna izquierda: Timeline ── */}
          <div
            style={{
              width: 270,
              flexShrink: 0,
              borderRight: "1px solid rgba(255,255,255,0.07)",
              overflowY: "auto",
              padding: "8px 0",
            }}
          >
            <ProcesoTimeline
              pasoActual={pasoActual}
              pasoSeleccionado={pasoVista}
              onSeleccionarPaso={(paso) => setPasoSeleccionado(paso.numero)}
            />
          </div>

          {/* ── Columna derecha: StepExecutor ── */}
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {pasoInfo ? (
              <StepExecutor
                paso={pasoInfo}
                proceso={proceso}
                wsId={wsId}
                esActual={pasoVista === pasoActual}
              />
            ) : (
              <div style={{ padding: 32, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                Seleccione un paso en el timeline para ver su detalle.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Estados de carga / error ──────────────────────────────────────────────────

function CargandoProceso() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#2E6BE6" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Cargando proceso…</span>
      </div>
    </div>
  );
}

function ErrorProceso({ wsId }: { wsId: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "#ef4444", marginBottom: 12 }}>Proceso no encontrado</div>
        <Link
          href={`/ws/${wsId}/contratacion`}
          style={{ fontSize: 12, color: "#2E6BE6", textDecoration: "underline" }}
        >
          Volver a la lista
        </Link>
      </div>
    </div>
  );
}
