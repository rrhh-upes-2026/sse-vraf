"use client";

/**
 * AuditTrailPanel — registro de auditoría de un proceso PRO-TH-001.
 * Muestra todas las acciones, aprobaciones y cambios de estado en orden cronológico.
 */

import { useState } from "react";
import type { ProcesoContratacion } from "@/types/contratacion";

interface AuditTrailPanelProps {
  proceso: ProcesoContratacion;
}

// ── Tipos de evento ───────────────────────────────────────────────────────────

type TipoEvento =
  | "proceso_creado"
  | "paso_completado"
  | "aprobacion"
  | "rechazo"
  | "documento_generado"
  | "evidencia_cargada"
  | "notificacion_enviada"
  | "escalacion"
  | "comentario";

interface EventoAudit {
  id: string;
  tipo: TipoEvento;
  paso?: number;
  actor: string;
  descripcion: string;
  detalle?: string;
  createdAt: string;
}

// ── Configuración visual ──────────────────────────────────────────────────────

const TIPO_CONFIG: Record<TipoEvento, { color: string; icono: string }> = {
  proceso_creado:      { color: "#2E6BE6", icono: "P" },
  paso_completado:     { color: "#22c55e", icono: "✓" },
  aprobacion:          { color: "#22c55e", icono: "A" },
  rechazo:             { color: "#ef4444", icono: "R" },
  documento_generado:  { color: "#5B4FD0", icono: "D" },
  evidencia_cargada:   { color: "#0F8A8A", icono: "E" },
  notificacion_enviada:{ color: "#E5A100", icono: "N" },
  escalacion:          { color: "#ef4444", icono: "!" },
  comentario:          { color: "rgba(255,255,255,0.3)", icono: "C" },
};

// ── Datos de demo ─────────────────────────────────────────────────────────────

function generarAuditDemo(proceso: ProcesoContratacion): EventoAudit[] {
  const base = new Date(proceso.createdAt).getTime();
  const dia = 86400000;

  const eventos: EventoAudit[] = [
    {
      id: "ae-1",
      tipo: "proceso_creado",
      actor: proceso.jefeSolicitante || "Sistema",
      descripcion: `Proceso ${proceso.codigo} creado`,
      detalle: `Puesto: ${proceso.nombrePuesto} · ${proceso.unidadFacultad}`,
      createdAt: new Date(base).toISOString(),
    },
    {
      id: "ae-2",
      tipo: "notificacion_enviada",
      paso: 1,
      actor: "Sistema",
      descripcion: "Notificación enviada a Jefe de RR. HH.",
      detalle: "Asunto: Nuevo proceso de contratación iniciado",
      createdAt: new Date(base + 0.5 * dia).toISOString(),
    },
    {
      id: "ae-3",
      tipo: "paso_completado",
      paso: 1,
      actor: proceso.jefeSolicitante || "Jefe de Área",
      descripcion: "Paso 1 completado: Identificación de necesidad",
      detalle: `Tipo de plaza: ${proceso.tipoPuesto === "plaza_existente" ? "Plaza existente" : "Nueva plaza"}`,
      createdAt: new Date(base + 1 * dia).toISOString(),
    },
  ];

  if (proceso.pasoActual >= 8) {
    eventos.push({
      id: "ae-4",
      tipo: "documento_generado",
      paso: 8,
      actor: "Sistema",
      descripcion: "Formulario de Requisición de Personal generado",
      detalle: "Documento enviado a carpeta Drive del proceso",
      createdAt: new Date(base + 3 * dia).toISOString(),
    });
    eventos.push({
      id: "ae-5",
      tipo: "paso_completado",
      paso: 8,
      actor: "Jefe de RR. HH.",
      descripcion: "Paso 8 completado: Requisición de Personal enviada",
      createdAt: new Date(base + 4 * dia).toISOString(),
    });
  }

  if (proceso.pasoActual >= 13) {
    eventos.push({
      id: "ae-6",
      tipo: "aprobacion",
      paso: 10,
      actor: "Rector",
      descripcion: "Estrategia de reclutamiento aprobada",
      detalle: "Modalidad: Reclutamiento externo e interno",
      createdAt: new Date(base + 6 * dia).toISOString(),
    });
    eventos.push({
      id: "ae-7",
      tipo: "evidencia_cargada",
      paso: 12,
      actor: "Gestor de O&M",
      descripcion: "Convocatoria publicada en medios digitales",
      detalle: "Archivo: Convocatoria_2026.pdf",
      createdAt: new Date(base + 7 * dia).toISOString(),
    });
  }

  if (proceso.pasoActual >= 20) {
    eventos.push({
      id: "ae-8",
      tipo: "documento_generado",
      paso: 16,
      actor: "Sistema",
      descripcion: "Informe Técnico de Selección generado",
      createdAt: new Date(base + 18 * dia).toISOString(),
    });
    eventos.push({
      id: "ae-9",
      tipo: "aprobacion",
      paso: 20,
      actor: "Rector",
      descripcion: "Candidato seleccionado aprobado por Rectoría",
      detalle: `Paso siguiente: Carta Oferta`,
      createdAt: new Date(base + 20 * dia).toISOString(),
    });
  }

  if (proceso.etapaActual === "completado") {
    eventos.push({
      id: "ae-10",
      tipo: "paso_completado",
      paso: 27,
      actor: "Sistema",
      descripcion: "Proceso completado exitosamente",
      detalle: "Empleado incorporado y proceso archivado",
      createdAt: new Date(base + 35 * dia).toISOString(),
    });
  }

  return eventos.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtFechaHora(iso: string): string {
  const d = new Date(iso);
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

// ── Filtros ───────────────────────────────────────────────────────────────────

type FiltroAudit = "todo" | "aprobaciones" | "documentos" | "sistema";

const FILTROS: { key: FiltroAudit; label: string }[] = [
  { key: "todo",        label: "Todo" },
  { key: "aprobaciones",label: "Aprobaciones" },
  { key: "documentos",  label: "Documentos" },
  { key: "sistema",     label: "Sistema" },
];

function filtrarEventos(eventos: EventoAudit[], filtro: FiltroAudit): EventoAudit[] {
  switch (filtro) {
    case "aprobaciones":
      return eventos.filter((e) => e.tipo === "aprobacion" || e.tipo === "rechazo");
    case "documentos":
      return eventos.filter((e) => e.tipo === "documento_generado" || e.tipo === "evidencia_cargada");
    case "sistema":
      return eventos.filter((e) => e.actor === "Sistema");
    default:
      return eventos;
  }
}

// ── Componente principal ──────────────────────────────────────────────────────

export function AuditTrailPanel({ proceso }: AuditTrailPanelProps) {
  const [filtro, setFiltro] = useState<FiltroAudit>("todo");

  const todos    = generarAuditDemo(proceso);
  const visibles = filtrarEventos(todos, filtro);

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>
            Auditoría del proceso
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {todos.length} eventos registrados
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: 16,
              border: "1px solid",
              cursor: "pointer",
              background: filtro === f.key ? "#2E6BE6" : "transparent",
              borderColor: filtro === f.key ? "#2E6BE6" : "rgba(255,255,255,0.12)",
              color: filtro === f.key ? "white" : "rgba(255,255,255,0.45)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline de eventos */}
      {visibles.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          No hay eventos en esta vista
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Línea vertical */}
          <div
            style={{
              position: "absolute",
              left: 15,
              top: 0,
              bottom: 0,
              width: 1,
              background: "rgba(255,255,255,0.07)",
            }}
          />

          {visibles.map((evento, idx) => {
            const cfg = TIPO_CONFIG[evento.tipo];
            return (
              <div
                key={evento.id}
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: idx < visibles.length - 1 ? 18 : 0,
                  position: "relative",
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: cfg.color + "22",
                    border: `1.5px solid ${cfg.color}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: cfg.color,
                    flexShrink: 0,
                    zIndex: 1,
                    position: "relative",
                  }}
                >
                  {cfg.icono}
                </div>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "white", lineHeight: 1.3 }}>
                      {evento.descripcion}
                    </div>
                    {evento.paso && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.35)",
                          flexShrink: 0,
                          letterSpacing: "0.04em",
                        }}
                      >
                        P{evento.paso}
                      </span>
                    )}
                  </div>
                  {evento.detalle && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 3, lineHeight: 1.4 }}>
                      {evento.detalle}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    {evento.actor} · {fmtFechaHora(evento.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
