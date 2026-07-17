"use client";

import { useState } from "react";
import Link from "next/link";
import { useProcesoContratacion } from "@/hooks/useContratacion";
import { ProcesoTimeline, PASOS_PRO_TH_001, pasoDeEtapa, type PasoDefinicion } from "./ProcesoTimeline";
import { PanelPaso } from "./PanelPaso";

// ── Back icon ─────────────────────────────────────────────────────────────────

const BACK_ICON = "M15 19l-7-7 7-7";

// ── Layout principal ──────────────────────────────────────────────────────────

interface ContenidoProcesoProps {
  wsId: string;
  procesoId: string;
}

export function ContenidoProceso({ wsId, procesoId }: ContenidoProcesoProps) {
  const { data: proceso, isLoading, error } = useProcesoContratacion(procesoId);
  const [pasoSeleccionado, setPasoSeleccionado] = useState<number | null>(null);

  if (isLoading) return <CargandoProceso />;
  if (error || !proceso) return <ErrorProceso wsId={wsId} />;

  const pasoActual = proceso.pasoActual;
  const pasoVista  = pasoSeleccionado ?? pasoActual;
  const pasoInfo   = PASOS_PRO_TH_001.find((p) => p.numero === pasoVista);

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
          padding: "14px 20px",
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
            <path d={BACK_ICON} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      </div>

      {/* Panel de dos columnas */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* ── Columna izquierda: Timeline ── */}
        <div
          style={{
            width: 280,
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

        {/* ── Columna derecha: Paso actual ── */}
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          {pasoInfo ? (
            <PanelPaso
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
          style={{
            fontSize: 12,
            color: "#2E6BE6",
            textDecoration: "underline",
          }}
        >
          Volver a la lista
        </Link>
      </div>
    </div>
  );
}
