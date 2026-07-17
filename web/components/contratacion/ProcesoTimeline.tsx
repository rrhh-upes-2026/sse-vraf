"use client";

/**
 * ProcesoTimeline — vertical 27-step timeline for PRO-TH-001.
 *
 * Faithfully reproduces every step, responsible party, and decision point
 * from the institutional procedure exactly as written.
 */

import type { EtapaContratacion } from "@/types/contratacion";

// ── Step definitions from PRO-TH-001 ──────────────────────────────────────────

export type TipoPaso = "P" | "H" | "D" | "V" | "A"; // Proceso/Humanware/Decisión/Verificación/Aprobación

export interface PasoDefinicion {
  numero: number;
  actividad: string;
  tipo: TipoPaso;
  responsable: string;
  esDecision?: boolean;
  opcionSi?: string;
  opcionNo?: string;
  etapa: EtapaContratacion;
}

export const PASOS_PRO_TH_001: PasoDefinicion[] = [
  {
    numero: 1,
    actividad: "Identifica la necesidad de contratación y valida si corresponde a una plaza existente",
    tipo: "P",
    responsable: "Jefe de Área",
    esDecision: true,
    opcionSi: "→ Paso 8",
    opcionNo: "→ Paso 2",
    etapa: "identificacion_necesidad",
  },
  {
    numero: 2,
    actividad: "Elabora Proyecto de Creación de Plaza (justificación, impacto, funciones, perfil y estimación presupuestaria)",
    tipo: "H",
    responsable: "Jefe de Área",
    etapa: "identificacion_necesidad",
  },
  {
    numero: 3,
    actividad: "Remite el proyecto de nueva plaza a Rectoría para revisión técnica y presupuestaria",
    tipo: "H",
    responsable: "Jefe de Área",
    etapa: "identificacion_necesidad",
  },
  {
    numero: 4,
    actividad: "Evalúa el proyecto y lo presenta a la instancia competente (Asamblea General / Junta de Directores) para aprobación",
    tipo: "P",
    responsable: "Rector",
    etapa: "identificacion_necesidad",
  },
  {
    numero: 5,
    actividad: "Una vez aprobada la plaza, solicita a O&M la elaboración o actualización del Descriptor de Puesto",
    tipo: "H",
    responsable: "Rector",
    etapa: "identificacion_necesidad",
  },
  {
    numero: 6,
    actividad: "Elabora y valida el Descriptor del Perfil de Puesto y procedimientos asociados",
    tipo: "H",
    responsable: "Gestor de O&M",
    etapa: "identificacion_necesidad",
  },
  {
    numero: 7,
    actividad: "Actualiza el Manual de Organización y Funciones (MOF) conforme a la plaza aprobada",
    tipo: "H",
    responsable: "Gestor de O&M",
    etapa: "identificacion_necesidad",
  },
  {
    numero: 8,
    actividad: "Solicita formalmente a RR. HH. el inicio del proceso por medio del Formulario de Requisición de Personal",
    tipo: "H",
    responsable: "Jefe de Área",
    etapa: "requisicion",
  },
  {
    numero: 9,
    actividad: "Revisa la requisición, valida perfil y define la estrategia de reclutamiento",
    tipo: "H",
    responsable: "Jefe de Recursos Humanos",
    esDecision: true,
    opcionSi: "→ Paso 10 (interna)",
    opcionNo: "→ Paso 11 (externa)",
    etapa: "estrategia_reclutamiento",
  },
  {
    numero: 10,
    actividad: "Publica la vacante en medios institucionales, divulgación interna, redes sociales, bolsas de empleo y universidades",
    tipo: "P",
    responsable: "Jefe de Recursos Humanos",
    esDecision: true,
    opcionSi: "→ Paso 12 (hay candidatos)",
    opcionNo: "→ Paso 11 (sin candidatos)",
    etapa: "publicacion_vacante",
  },
  {
    numero: 11,
    actividad: "Reclutamiento externo / outsourcing (urgente, especializado o sin postulantes idóneos)",
    tipo: "D",
    responsable: "Jefe de Recursos Humanos",
    etapa: "publicacion_vacante",
  },
  {
    numero: 12,
    actividad: "Recibe currículum de candidatos y realiza evaluación de idoneidad CV vs Perfil del Puesto",
    tipo: "V",
    responsable: "Jefe de Recursos Humanos",
    etapa: "recepcion_cv",
  },
  {
    numero: 13,
    actividad: "Convoca a entrevista preliminar virtual a candidatos que cumplen el perfil",
    tipo: "P",
    responsable: "Jefe de Recursos Humanos",
    etapa: "entrevista_preliminar",
  },
  {
    numero: 14,
    actividad: "Aplica pruebas técnicas y conductuales, según lo definido en el perfil del puesto",
    tipo: "P",
    responsable: "Jefe de Recursos Humanos",
    etapa: "pruebas",
  },
  {
    numero: 15,
    actividad: "Realiza entrevista de selección por parte de RR. HH.",
    tipo: "P",
    responsable: "Jefe de Recursos Humanos",
    etapa: "entrevista_rrhh",
  },
  {
    numero: 16,
    actividad: "Analiza resultados y conforma terna de candidatos idóneos, remitiendo Informe Técnico a Jefe de Área y Rector",
    tipo: "P",
    responsable: "Jefe de Recursos Humanos",
    etapa: "conformacion_terna",
  },
  {
    numero: 17,
    actividad: "Realiza entrevista final por Comité de Evaluación (puestos estratégicos) o por jefatura inmediata (puestos no estratégicos)",
    tipo: "P",
    responsable: "Comité / Jefe de Área",
    etapa: "entrevista_final",
  },
  {
    numero: 18,
    actividad: "Emite Informe Técnico del candidato recomendado",
    tipo: "V",
    responsable: "Jefe Inmediato / Comité",
    etapa: "informe_seleccion",
  },
  {
    numero: 19,
    actividad: "Presenta candidato recomendado a la instancia superior para validación final, cuando aplique",
    tipo: "P",
    responsable: "Jefe de RR. HH. / Jefe de Área",
    etapa: "validacion_rector",
  },
  {
    numero: 20,
    actividad: "Notifica decisión final a RR. HH.",
    tipo: "V",
    responsable: "Rector",
    etapa: "validacion_rector",
  },
  {
    numero: 21,
    actividad: "Emite Carta Oferta con condiciones (1ª opción, 2ª opción si la primera no acepta, 3ª opción si las dos anteriores no aceptan)",
    tipo: "A",
    responsable: "Jefe de Recursos Humanos",
    etapa: "carta_oferta",
  },
  {
    numero: 22,
    actividad: "¿Se acepta la oferta laboral?",
    tipo: "D",
    responsable: "Candidato",
    esDecision: true,
    opcionSi: "→ Paso 23",
    opcionNo: "→ Volver a Paso 8",
    etapa: "carta_oferta",
  },
  {
    numero: 23,
    actividad: "Crea expediente físico y digital y solicita documentación completa al candidato seleccionado",
    tipo: "H",
    responsable: "Jefe de Recursos Humanos",
    etapa: "creacion_expediente",
  },
  {
    numero: 24,
    actividad: "Elabora contrato en sistema conforme a normativa vigente",
    tipo: "H",
    responsable: "Jefe de Recursos Humanos",
    etapa: "elaboracion_contrato",
  },
  {
    numero: 25,
    actividad: "Firma de contrato por empleado y autoridad institucional",
    tipo: "H",
    responsable: "Empleado / Rector",
    etapa: "firma_contrato",
  },
  {
    numero: 26,
    actividad: "Anexa contrato a expediente y comunica contratación de manera institucional",
    tipo: "V",
    responsable: "Jefe de Recursos Humanos",
    etapa: "comunicacion",
  },
  {
    numero: 27,
    actividad: "Inicia Procedimiento de Vinculación e Inducción",
    tipo: "P",
    responsable: "Recursos Humanos",
    etapa: "vinculacion_induccion",
  },
];

// ── Etapa → paso range mapping ────────────────────────────────────────────────

export function pasoDeEtapa(etapa: EtapaContratacion): number {
  const paso = PASOS_PRO_TH_001.find((p) => p.etapa === etapa);
  return paso?.numero ?? 1;
}

// ── Status helpers ─────────────────────────────────────────────────────────────

type EstadoPaso = "completado" | "actual" | "pendiente" | "error";

function estadoPaso(paso: PasoDefinicion, pasoActual: number, etapaCompletada: boolean): EstadoPaso {
  if (paso.numero < pasoActual) return "completado";
  if (paso.numero === pasoActual) return etapaCompletada ? "completado" : "actual";
  return "pendiente";
}

// ── Icon paths ────────────────────────────────────────────────────────────────

const ICONS = {
  check:    "M20 6 9 17l-5-5",
  decision: "M12 2l10 10-10 10L2 12z",
  dot:      "",
};

// ── SVG Icon ──────────────────────────────────────────────────────────────────

function StepIcon({ estado, numero }: { estado: EstadoPaso; numero: number }) {
  const size = 24;
  if (estado === "completado") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#22c55e" />
        <path d={ICONS.check} stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (estado === "actual") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" fill="#2E6BE6" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui">
          {numero}
        </text>
      </svg>
    );
  }
  if (estado === "error") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#ef4444" />
        <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <text x="12" y="16" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="11" fontWeight="600" fontFamily="system-ui">
        {numero}
      </text>
    </svg>
  );
}

// ── Tipo badge ────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<TipoPaso, string> = {
  P: "Proceso",
  H: "Tarea",
  D: "Decisión",
  V: "Verificación",
  A: "Aprobación",
};

const TIPO_COLOR: Record<TipoPaso, string> = {
  P: "#2E6BE6",
  H: "#0F8A8A",
  D: "#E5A100",
  V: "#5B4FD0",
  A: "#12A150",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ProcesoTimelineProps {
  pasoActual: number;
  onSeleccionarPaso?: (paso: PasoDefinicion) => void;
  pasoSeleccionado?: number;
}

export function ProcesoTimeline({
  pasoActual,
  onSeleccionarPaso,
  pasoSeleccionado,
}: ProcesoTimelineProps) {
  return (
    <div style={{ padding: "8px 0" }}>
      {PASOS_PRO_TH_001.map((paso, i) => {
        const estado = estadoPaso(paso, pasoActual, false);
        const esSeleccionado = pasoSeleccionado === paso.numero;
        const esActual = estado === "actual";
        const esCompletado = estado === "completado";

        return (
          <div key={paso.numero} style={{ position: "relative" }}>
            {/* Connector line */}
            {i < PASOS_PRO_TH_001.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  left: 23,
                  top: 36,
                  width: 2,
                  height: "calc(100% - 4px)",
                  background: esCompletado
                    ? "rgba(34,197,94,0.4)"
                    : "rgba(255,255,255,0.07)",
                  zIndex: 0,
                }}
              />
            )}

            {/* Step row */}
            <button
              onClick={() => onSeleccionarPaso?.(paso)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                width: "100%",
                textAlign: "left",
                padding: "6px 12px 6px 12px",
                borderRadius: 10,
                background: esSeleccionado
                  ? "rgba(46,107,230,0.12)"
                  : esActual
                    ? "rgba(46,107,230,0.06)"
                    : "transparent",
                border: esSeleccionado
                  ? "1px solid rgba(46,107,230,0.25)"
                  : "1px solid transparent",
                cursor: onSeleccionarPaso ? "pointer" : "default",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Icon */}
              <div style={{ flexShrink: 0, marginTop: 1 }}>
                <StepIcon estado={estado} numero={paso.numero} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: esActual ? 700 : esCompletado ? 500 : 400,
                    color: esActual
                      ? "white"
                      : esCompletado
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.35)",
                    lineHeight: 1.35,
                    marginBottom: 2,
                  }}
                >
                  {paso.actividad.length > 70 && !esActual && !esSeleccionado
                    ? paso.actividad.slice(0, 68) + "…"
                    : paso.actividad}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    {paso.responsable}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: 4,
                      background: esActual || esCompletado
                        ? TIPO_COLOR[paso.tipo] + "22"
                        : "rgba(255,255,255,0.04)",
                      color: esActual || esCompletado
                        ? TIPO_COLOR[paso.tipo]
                        : "rgba(255,255,255,0.2)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {TIPO_LABEL[paso.tipo]}
                  </span>
                  {paso.esDecision && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: 4,
                        background: "rgba(229,160,0,0.12)",
                        color: "#E5A100",
                      }}
                    >
                      Decisión
                    </span>
                  )}
                </div>

                {/* Decision options — only show on active/selected */}
                {paso.esDecision && (esActual || esSeleccionado) && (
                  <div style={{ marginTop: 4, fontSize: 10, color: "#E5A100" }}>
                    <div>Sí: {paso.opcionSi}</div>
                    <div>No: {paso.opcionNo}</div>
                  </div>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
