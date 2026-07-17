"use client";

import { useState } from "react";
import Link from "next/link";
import { useProcesosContratacion } from "@/hooks/useContratacion";
import type { ProcesoContratacion, EtapaContratacion } from "@/types/contratacion";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// ── Etiquetas y colores ───────────────────────────────────────────────────────

const ETAPA_LABEL: Record<string, string> = {
  identificacion_necesidad: "Identificación de necesidad",
  requisicion:              "Requisición de personal",
  estrategia_reclutamiento: "Estrategia de reclutamiento",
  publicacion_vacante:      "Publicación de vacante",
  recepcion_cv:             "Recepción de CVs",
  entrevista_preliminar:    "Entrevista preliminar",
  pruebas:                  "Pruebas técnicas y conductuales",
  entrevista_rrhh:          "Entrevista RR. HH.",
  conformacion_terna:       "Conformación de terna",
  entrevista_final:         "Entrevista final",
  informe_seleccion:        "Informe de selección",
  validacion_rector:        "Validación del Rector",
  carta_oferta:             "Carta oferta",
  creacion_expediente:      "Creación de expediente",
  elaboracion_contrato:     "Elaboración de contrato",
  firma_contrato:           "Firma de contrato",
  comunicacion:             "Comunicación institucional",
  vinculacion_induccion:    "Vinculación e inducción",
  completado:               "Completado",
  rechazado:                "Rechazado",
  suspendido:               "Suspendido",
};

const ETAPA_COLOR: Record<string, string> = {
  identificacion_necesidad: "#E5A100",
  requisicion:              "#E5A100",
  estrategia_reclutamiento: "#2E6BE6",
  publicacion_vacante:      "#2E6BE6",
  recepcion_cv:             "#2E6BE6",
  entrevista_preliminar:    "#5B4FD0",
  pruebas:                  "#5B4FD0",
  entrevista_rrhh:          "#5B4FD0",
  conformacion_terna:       "#0F8A8A",
  entrevista_final:         "#0F8A8A",
  informe_seleccion:        "#0F8A8A",
  validacion_rector:        "#E5A100",
  carta_oferta:             "#E5A100",
  creacion_expediente:      "#12A150",
  elaboracion_contrato:     "#12A150",
  firma_contrato:           "#12A150",
  comunicacion:             "#12A150",
  vinculacion_induccion:    "#12A150",
  completado:               "#22c55e",
  rechazado:                "#ef4444",
  suspendido:               "#6b7280",
};

const PRIORIDAD_COLOR: Record<string, string> = {
  urgente: "#ef4444",
  normal:  "rgba(255,255,255,0.3)",
};

// ── Filtros ───────────────────────────────────────────────────────────────────

type FiltroVista = "todos" | "en_curso" | "completados" | "urgentes";

const FILTROS: { key: FiltroVista; label: string }[] = [
  { key: "todos",       label: "Todos" },
  { key: "en_curso",    label: "En curso" },
  { key: "completados", label: "Completados" },
  { key: "urgentes",    label: "Urgentes" },
];

function aplicarFiltro(procesos: ProcesoContratacion[], filtro: FiltroVista) {
  switch (filtro) {
    case "en_curso":
      return procesos.filter(
        (p) => p.etapaActual !== "completado" && p.etapaActual !== "rechazado" && p.etapaActual !== "suspendido",
      );
    case "completados":
      return procesos.filter((p) => p.etapaActual === "completado");
    case "urgentes":
      return procesos.filter((p) => p.prioridad === "urgente");
    default:
      return procesos;
  }
}

// ── Tarjeta de proceso ────────────────────────────────────────────────────────

function TarjetaProceso({ proceso, wsId }: { proceso: ProcesoContratacion; wsId: string }) {
  const color = ETAPA_COLOR[proceso.etapaActual] ?? "#6b7280";
  const completado = proceso.etapaActual === "completado";
  const rechazado  = proceso.etapaActual === "rechazado";

  return (
    <Link href={`/ws/${wsId}/contratacion/${proceso.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "16px 18px",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.14)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
        }}
      >
        {/* Barra lateral de color */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: color,
            borderRadius: "12px 0 0 12px",
          }}
        />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Código + prioridad */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>
                {proceso.codigo}
              </span>
              {proceso.prioridad === "urgente" && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.12)",
                    padding: "1px 6px",
                    borderRadius: 4,
                  }}
                >
                  URGENTE
                </span>
              )}
            </div>

            {/* Nombre del puesto */}
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                marginBottom: 3,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {proceso.nombrePuesto}
            </div>

            {/* Unidad / facultad */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 8, lineHeight: 1.3 }}>
              {proceso.unidadFacultad}
            </div>

            {/* Etapa actual */}
            <span
              style={{
                display: "inline-block",
                fontSize: 10,
                fontWeight: 600,
                color: color,
                background: color + "18",
                padding: "2px 8px",
                borderRadius: 6,
                letterSpacing: "0.02em",
              }}
            >
              {ETAPA_LABEL[proceso.etapaActual] ?? proceso.etapaActual}
            </span>
          </div>

          {/* Paso / estado */}
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            {completado ? (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(34,197,94,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <path d="M20 6 9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : rechazado ? (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "white",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {proceso.pasoActual}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>/ 27</div>
              </div>
            )}
          </div>
        </div>

        {/* Solicitante */}
        <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          Solicitado por {proceso.jefeSolicitante} · {proceso.tipoContratacion}
        </div>
      </div>
    </Link>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface ListaProcesosProps {
  wsId: string;
}

export function ListaProcesos({ wsId }: ListaProcesosProps) {
  const [filtro, setFiltro] = useState<FiltroVista>("todos");
  const [busqueda, setBusqueda] = useState("");

  const { data: procesos = [], isLoading, error } = useProcesosContratacion(wsId);

  const visibles = aplicarFiltro(procesos, filtro).filter((p) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      p.nombrePuesto.toLowerCase().includes(q) ||
      p.unidadFacultad.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: "24px 28px", maxWidth: 900 }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: 0 }}>
            Contratación
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
            PRO-TH-001 — Reclutamiento, Selección y Contratación
          </p>
        </div>
        <Link
          href={`/ws/${wsId}/contratacion/nueva`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 8,
            background: "#2E6BE6",
            color: "white",
            fontWeight: 600,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Nuevo proceso
        </Link>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              border: "1px solid",
              cursor: "pointer",
              background: filtro === f.key ? "#2E6BE6" : "transparent",
              borderColor: filtro === f.key ? "#2E6BE6" : "rgba(255,255,255,0.12)",
              color: filtro === f.key ? "white" : "rgba(255,255,255,0.5)",
              transition: "all 0.15s",
            }}
          >
            {f.label}
          </button>
        ))}

        <div style={{ flex: 1, maxWidth: 260, marginLeft: "auto" }}>
          <div style={{ position: "relative" }}>
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <path
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar proceso..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px 6px 30px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Contador */}
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
        {isLoading ? "Cargando…" : `${visibles.length} proceso${visibles.length !== 1 ? "s" : ""}`}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 100,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: 24, textAlign: "center", color: "#ef4444", fontSize: 13 }}>
          Error al cargar los procesos
        </div>
      ) : visibles.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          No hay procesos{busqueda ? " que coincidan con la búsqueda" : " en esta vista"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibles.map((p) => (
            <TarjetaProceso key={p.id} proceso={p} wsId={wsId} />
          ))}
        </div>
      )}
    </div>
  );
}
