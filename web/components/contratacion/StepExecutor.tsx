"use client";

/**
 * StepExecutor — panel de ejecución de un paso de PRO-TH-001 basado en el motor
 * declarativo (contratacion-engine.ts). Muestra instrucciones, validaciones,
 * evidencia requerida, documentos generados, tareas, comentarios y botones
 * de transición según la especificación del paso.
 */

import { useState } from "react";
import type { PasoDefinicion } from "./ProcesoTimeline";
import type { ProcesoContratacion } from "@/types/contratacion";
import type { ValidacionPaso } from "@/types/proceso-engine";
import { getStepSpec } from "@/lib/contratacion-engine";
import { ROL_LABEL } from "@/types/proceso-engine";
import { useAvanzarEtapa } from "@/hooks/useContratacion";
import { FormRequisicion } from "./FormRequisicion";
import { TareasPanel } from "./TareasPanel";
import { ComentariosThread } from "./ComentariosThread";
import { EvidenciaPanel } from "./EvidenciaPanel";
import { DocumentosPanel } from "./DocumentosPanel";

// ── Colores de tipo ───────────────────────────────────────────────────────────

const TIPO_COLOR: Record<string, string> = {
  P: "#2E6BE6",
  H: "#0F8A8A",
  D: "#E5A100",
  V: "#5B4FD0",
  A: "#12A150",
};

const BOTON_COLOR: Record<string, string> = {
  primario:   "#2E6BE6",
  secundario: "rgba(255,255,255,0.12)",
  peligro:    "#ef4444",
  exito:      "#22c55e",
};

const BOTON_TEXT: Record<string, string> = {
  primario:   "white",
  secundario: "rgba(255,255,255,0.7)",
  peligro:    "white",
  exito:      "white",
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

type Tab =
  | "descripcion"
  | "validaciones"
  | "evidencia"
  | "documentos"
  | "tareas"
  | "comentarios";

const TABS: { key: Tab; label: string }[] = [
  { key: "descripcion",  label: "Instrucciones" },
  { key: "validaciones", label: "Validaciones" },
  { key: "evidencia",    label: "Evidencia" },
  { key: "documentos",   label: "Documentos" },
  { key: "tareas",       label: "Tareas" },
  { key: "comentarios",  label: "Comentarios" },
];

// ── Evaluador de validaciones ─────────────────────────────────────────────────

function evaluarValidacion(
  validacion: ValidacionPaso,
  proceso: ProcesoContratacion,
): boolean {
  switch (validacion.tipo) {
    case "campo_requerido": {
      if (!validacion.campo) return false;
      const val = (proceso as unknown as Record<string, unknown>)[validacion.campo];
      return val !== undefined && val !== null && val !== "";
    }
    case "candidatos_minimo":
      return (proceso.candidatos?.length ?? 0) >= (Number(validacion.valor) || 1);
    case "terna_completa":
      return (proceso.terna?.length ?? 0) === 3;
    case "oferta_emitida":
      return !!proceso.cartaOfertaId;
    case "contrato_firmado":
      return !!proceso.contratoId;
    case "documento_cargado":
    case "aprobacion_registrada":
      return false; // requires server-side evidence; default unmet in mock
    default:
      return false;
  }
}

// ── Confirmación modal ────────────────────────────────────────────────────────

interface ModalConfirmProps {
  titulo: string;
  descripcion: string;
  onConfirmar: (notas: string) => void;
  onCancelar: () => void;
  requiereNotas: boolean;
}

function ModalConfirm({
  titulo,
  descripcion,
  onConfirmar,
  onCancelar,
  requiereNotas,
}: ModalConfirmProps) {
  const [notas, setNotas] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: "28px 32px",
          maxWidth: 480,
          width: "100%",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>
          {titulo}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 20, lineHeight: 1.5 }}>
          {descripcion}
        </div>

        {requiereNotas && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>
              Notas de justificación
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Ingrese las notas requeridas…"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "white",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancelar}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(notas)}
            disabled={requiereNotas && !notas.trim()}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              background: "#2E6BE6",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: requiereNotas && !notas.trim() ? "not-allowed" : "pointer",
              opacity: requiereNotas && !notas.trim() ? 0.6 : 1,
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Panel de Instrucciones ────────────────────────────────────────────────────

function TabInstrucciones({
  paso,
  proceso,
  wsId,
  esActual,
}: {
  paso: PasoDefinicion;
  proceso: ProcesoContratacion;
  wsId: string;
  esActual: boolean;
}) {
  const spec = getStepSpec(paso.numero);
  const color = TIPO_COLOR[paso.tipo] ?? "#6b7280";

  // Step 8: render the full requisición form
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

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Instrucciones del responsable */}
      <div
        style={{
          background: color + "10",
          border: `1px solid ${color}30`,
          borderRadius: 12,
          padding: "18px 22px",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, color: color, letterSpacing: "0.06em", marginBottom: 6 }}>
          INSTRUCCIONES PARA {spec ? ROL_LABEL[spec.responsable].toUpperCase() : paso.responsable.toUpperCase()}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>
          {spec?.instrucciones ?? paso.actividad}
        </div>
      </div>

      {/* Duración estimada */}
      {spec && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "rgba(255,255,255,0.45)",
              background: "rgba(255,255,255,0.04)",
              padding: "6px 12px",
              borderRadius: 8,
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Duración estimada: <strong style={{ color: "white" }}>{spec.duracionEstimadaDias} día{spec.duracionEstimadaDias !== 1 ? "s" : ""}</strong></span>
          </div>
        </div>
      )}

      {/* Precondiciones */}
      {spec && spec.precondiciones.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", marginBottom: 10 }}>
            PRECONDICIONES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {spec.precondiciones.map((pre, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <span style={{ color: "#E5A100", marginTop: 1, flexShrink: 0 }}>›</span>
                {pre}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Puntos de decisión */}
      {paso.esDecision && (
        <div
          style={{
            background: "rgba(229,160,0,0.08)",
            border: "1px solid rgba(229,160,0,0.25)",
            borderRadius: 10,
            padding: "14px 18px",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: "#E5A100", letterSpacing: "0.06em", marginBottom: 10 }}>
            PUNTO DE DECISIÓN
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {paso.opcionSi && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "2px 7px", borderRadius: 4 }}>SÍ</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{paso.opcionSi}</span>
              </div>
            )}
            {paso.opcionNo && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(239,68,68,0.12)", color: "#ef4444", padding: "2px 7px", borderRadius: 4 }}>NO</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{paso.opcionNo}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!esActual && (
        <div
          style={{
            marginTop: 20,
            padding: "10px 14px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 8,
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Paso no activo — modo consulta
        </div>
      )}
    </div>
  );
}

// ── Panel de validaciones ─────────────────────────────────────────────────────

function TabValidaciones({
  paso,
  proceso,
}: {
  paso: PasoDefinicion;
  proceso: ProcesoContratacion;
}) {
  const spec = getStepSpec(paso.numero);
  if (!spec || spec.validaciones.length === 0) {
    return (
      <div style={{ padding: "32px 28px", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
        Este paso no tiene validaciones automáticas.
      </div>
    );
  }

  const obligatorias = spec.validaciones.filter((v) => v.obligatoria);
  const opcionales   = spec.validaciones.filter((v) => !v.obligatoria);

  function ValidItem({ v }: { v: ValidacionPaso }) {
    const cumplida = evaluarValidacion(v, proceso);
    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "12px 14px",
          background: cumplida ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${cumplida ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: cumplida ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
            border: `1.5px solid ${cumplida ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {cumplida ? (
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none">
              <path d="M20 6 9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: cumplida ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)", lineHeight: 1.35, marginBottom: 2 }}>
            {v.descripcion}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            {v.tipo.replace(/_/g, " ")}
            {!v.obligatoria && " · opcional"}
          </div>
        </div>
        {!cumplida && v.obligatoria && (
          <span style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,0.12)", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
            REQUERIDO
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 28px" }}>
      {obligatorias.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 10 }}>
            REQUERIDAS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {obligatorias.map((v) => <ValidItem key={v.id} v={v} />)}
          </div>
        </div>
      )}

      {opcionales.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 10 }}>
            RECOMENDADAS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {opcionales.map((v) => <ValidItem key={v.id} v={v} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface StepExecutorProps {
  paso: PasoDefinicion;
  proceso: ProcesoContratacion;
  wsId: string;
  esActual: boolean;
}

export function StepExecutor({ paso, proceso, wsId, esActual }: StepExecutorProps) {
  const [tabActiva, setTabActiva] = useState<Tab>("descripcion");
  const [modal, setModal] = useState<{
    titulo: string;
    descripcion: string;
    resultado: "aprobado" | "rechazado";
    requiereNotas: boolean;
  } | null>(null);

  const avanzar = useAvanzarEtapa(proceso.id);
  const spec     = getStepSpec(paso.numero);
  const color    = TIPO_COLOR[paso.tipo] ?? "#6b7280";

  // Count met validations for badge
  const valMet = spec
    ? spec.validaciones.filter((v) => v.obligatoria && evaluarValidacion(v, proceso)).length
    : 0;
  const valTotal = spec ? spec.validaciones.filter((v) => v.obligatoria).length : 0;

  function handleTransicion(resultado: "aprobado" | "rechazado", requiereConfirmacion: boolean, requiereNotas: boolean, etiqueta: string, descripcion: string) {
    if (requiereConfirmacion || requiereNotas) {
      setModal({ titulo: etiqueta, descripcion, resultado, requiereNotas });
    } else {
      avanzar.mutate({ resultado, responsable: "Usuario actual" });
    }
  }

  function handleConfirmar(notas: string) {
    if (!modal) return;
    avanzar.mutate({ resultado: modal.resultado, notas, responsable: "Usuario actual" });
    setModal(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Cabecera del paso */}
      <div
        style={{
          padding: "18px 28px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: esActual ? "#2E6BE6" : "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 800,
            color: esActual ? "white" : "rgba(255,255,255,0.3)",
          }}
        >
          {paso.numero}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "white", lineHeight: 1.35, marginBottom: 6 }}>
            {paso.actividad}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 4,
                background: color + "20",
                color: color,
                letterSpacing: "0.04em",
              }}
            >
              {paso.responsable}
            </span>
            {esActual && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  background: "rgba(46,107,230,0.2)",
                  color: "#2E6BE6",
                  padding: "2px 7px",
                  borderRadius: 4,
                  letterSpacing: "0.05em",
                }}
              >
                PASO ACTUAL
              </span>
            )}
            {spec && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                ~{spec.duracionEstimadaDias}d
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          paddingLeft: 28,
          flexShrink: 0,
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => {
          const activa = tabActiva === t.key;
          const badge = t.key === "validaciones" && valTotal > 0 ? `${valMet}/${valTotal}` : null;
          return (
            <button
              key={t.key}
              onClick={() => setTabActiva(t.key)}
              style={{
                padding: "10px 14px",
                fontSize: 12,
                fontWeight: activa ? 600 : 400,
                color: activa ? "white" : "rgba(255,255,255,0.4)",
                background: "none",
                border: "none",
                borderBottom: `2px solid ${activa ? "#2E6BE6" : "transparent"}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {t.label}
              {badge && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: 10,
                    background: valMet === valTotal ? "rgba(34,197,94,0.2)" : "rgba(229,160,0,0.2)",
                    color: valMet === valTotal ? "#22c55e" : "#E5A100",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido de la tab */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tabActiva === "descripcion" && (
          <TabInstrucciones paso={paso} proceso={proceso} wsId={wsId} esActual={esActual} />
        )}
        {tabActiva === "validaciones" && (
          <TabValidaciones paso={paso} proceso={proceso} />
        )}
        {tabActiva === "evidencia" && spec && (
          <EvidenciaPanel
            procesoId={proceso.id}
            paso={paso.numero}
            evidenciasRequeridas={spec.evidenciasRequeridas}
            soloLectura={!esActual}
          />
        )}
        {tabActiva === "documentos" && spec && (
          <DocumentosPanel
            procesoId={proceso.id}
            documentosGenerados={spec.documentosGenerados}
          />
        )}
        {tabActiva === "tareas" && (
          <TareasPanel proceso={proceso} paso={paso.numero} />
        )}
        {tabActiva === "comentarios" && (
          <ComentariosThread
            procesoId={proceso.id}
            contexto="paso"
            contextoId={String(paso.numero)}
          />
        )}
      </div>

      {/* Botones de transición (solo paso activo) */}
      {esActual && spec && spec.transiciones.length > 0 && (
        <div
          style={{
            padding: "14px 28px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {spec.transiciones.map((t) => {
            const resultado: "aprobado" | "rechazado" =
              t.condicion === "rechazado" || t.condicion === "decision_no" || t.condicion === "sin_candidatos"
                ? "rechazado"
                : "aprobado";

            const bg   = BOTON_COLOR[t.colorBoton] ?? BOTON_COLOR.primario;
            const text = BOTON_TEXT[t.colorBoton] ?? "white";

            return (
              <button
                key={t.condicion}
                onClick={() =>
                  handleTransicion(resultado, t.requiereConfirmacion, t.requiereNotas, t.etiqueta, t.descripcion)
                }
                disabled={avanzar.isPending}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  background: bg,
                  border: t.colorBoton === "secundario" ? "1px solid rgba(255,255,255,0.15)" : "none",
                  color: text,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: avanzar.isPending ? "not-allowed" : "pointer",
                  opacity: avanzar.isPending ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {avanzar.isPending ? "Procesando…" : t.etiqueta}
              </button>
            );
          })}
          {avanzar.isError && (
            <span style={{ fontSize: 12, color: "#ef4444", alignSelf: "center" }}>
              Error al procesar la transición
            </span>
          )}
        </div>
      )}

      {/* Modal de confirmación */}
      {modal && (
        <ModalConfirm
          titulo={modal.titulo}
          descripcion={modal.descripcion}
          requiereNotas={modal.requiereNotas}
          onConfirmar={handleConfirmar}
          onCancelar={() => setModal(null)}
        />
      )}
    </div>
  );
}
