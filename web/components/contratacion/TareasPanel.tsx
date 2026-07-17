"use client";

/**
 * TareasPanel — muestra y gestiona tareas de un paso de PRO-TH-001.
 */

import { useState } from "react";
import type { ProcesoContratacion, Tarea } from "@/types/contratacion";

interface TareasPanelProps {
  proceso: ProcesoContratacion;
  paso: number;
}

// ── Badge maps ────────────────────────────────────────────────────────────────

const ESTADO_LABEL: Record<Tarea["estado"], string> = {
  pendiente:   "Pendiente",
  en_progreso: "En progreso",
  completada:  "Completada",
  vencida:     "Vencida",
};

const ESTADO_COLOR: Record<Tarea["estado"], string> = {
  pendiente:   "#E5A100",
  en_progreso: "#2E6BE6",
  completada:  "#22c55e",
  vencida:     "#ef4444",
};

const PRIORIDAD_LABEL: Record<Tarea["prioridad"], string> = {
  alta:  "Alta",
  media: "Media",
  baja:  "Baja",
};

const PRIORIDAD_COLOR: Record<Tarea["prioridad"], string> = {
  alta:  "#ef4444",
  media: "#E5A100",
  baja:  "rgba(255,255,255,0.3)",
};

// ── Demo data ─────────────────────────────────────────────────────────────────

function tareasDemo(procesoId: string, paso: number): Tarea[] {
  return [
    {
      id: `t-${paso}-1`,
      procesoId,
      paso,
      titulo: "Revisar documentación del candidato",
      descripcion:
        "Verificar que todos los documentos requeridos estén completos y vigentes antes de continuar.",
      responsable: "Jefa de RR. HH.",
      rolResponsable: "Jefe de Recursos Humanos",
      vencimiento: new Date(Date.now() + 2 * 86400000).toISOString(),
      estado: "en_progreso",
      prioridad: "alta",
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: `t-${paso}-2`,
      procesoId,
      paso,
      titulo: "Coordinar entrevista con Jefe de Área",
      descripcion:
        "Agendar y confirmar la entrevista final con el responsable de la unidad solicitante.",
      responsable: "Asistente RR. HH.",
      rolResponsable: "Asistente de Recursos Humanos",
      vencimiento: new Date(Date.now() + 5 * 86400000).toISOString(),
      estado: "pendiente",
      prioridad: "media",
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: `t-${paso}-3`,
      procesoId,
      paso,
      titulo: "Notificar a candidatos descartados",
      descripcion:
        "Enviar correo de agradecimiento y notificación de resultado a los candidatos no seleccionados.",
      responsable: "Jefa de RR. HH.",
      rolResponsable: "Jefe de Recursos Humanos",
      vencimiento: new Date(Date.now() - 1 * 86400000).toISOString(),
      estado: "vencida",
      prioridad: "baja",
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
  ];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtVencimiento(iso: string): string {
  const d = new Date(iso);
  const meses = [
    "ene","feb","mar","abr","may","jun",
    "jul","ago","sep","oct","nov","dic",
  ];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Tarjeta de tarea ──────────────────────────────────────────────────────────

function TareaCard({
  tarea,
  onCompletar,
}: {
  tarea: Tarea;
  onCompletar: (id: string) => void;
}) {
  const estadoColor = ESTADO_COLOR[tarea.estado];
  const pColor      = PRIORIDAD_COLOR[tarea.prioridad];
  const puedeCompletar =
    tarea.estado === "pendiente" || tarea.estado === "en_progreso";

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
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 4, lineHeight: 1.35 }}>
            {tarea.titulo}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            {tarea.descripcion}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          {/* Estado */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 4,
              background: estadoColor + "22",
              color: estadoColor,
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
            }}
          >
            {ESTADO_LABEL[tarea.estado]}
          </span>

          {/* Prioridad */}
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 4,
              background: pColor + "18",
              color: pColor,
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}
          >
            {PRIORIDAD_LABEL[tarea.prioridad].toUpperCase()}
          </span>
        </div>
      </div>

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            Responsable:{" "}
            <span style={{ color: "rgba(255,255,255,0.75)" }}>{tarea.responsable}</span>
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            Vence:{" "}
            <span style={{ color: tarea.estado === "vencida" ? "#ef4444" : "rgba(255,255,255,0.75)" }}>
              {fmtVencimiento(tarea.vencimiento)}
            </span>
          </span>
        </div>

        {puedeCompletar && (
          <button
            onClick={() => onCompletar(tarea.id)}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 11px",
              borderRadius: 6,
              background: "rgba(34,197,94,0.12)",
              color: "#22c55e",
              border: "1px solid rgba(34,197,94,0.25)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Marcar completada
          </button>
        )}
      </div>
    </div>
  );
}

// ── Estado del formulario ─────────────────────────────────────────────────────

interface NuevaTareaForm {
  titulo: string;
  descripcion: string;
  responsable: string;
  vencimiento: string;
  prioridad: Tarea["prioridad"];
}

const FORM_VACÍO: NuevaTareaForm = {
  titulo:       "",
  descripcion:  "",
  responsable:  "",
  vencimiento:  "",
  prioridad:    "media",
};

// ── Componente principal ──────────────────────────────────────────────────────

export function TareasPanel({ proceso, paso }: TareasPanelProps) {
  const [tareas, setTareas]           = useState<Tarea[]>(() => tareasDemo(proceso.id, paso));
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm]               = useState<NuevaTareaForm>(FORM_VACÍO);

  function marcarCompletada(id: string) {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, estado: "completada" as const, completadaAt: new Date().toISOString() }
          : t
      )
    );
  }

  function agregarTarea() {
    if (!form.titulo.trim()) return;
    const nueva: Tarea = {
      id:             `t-${paso}-${Date.now()}`,
      procesoId:      proceso.id,
      paso,
      titulo:         form.titulo.trim(),
      descripcion:    form.descripcion.trim(),
      responsable:    form.responsable.trim() || "Sin asignar",
      rolResponsable: "",
      vencimiento:    form.vencimiento
        ? new Date(form.vencimiento).toISOString()
        : new Date(Date.now() + 7 * 86400000).toISOString(),
      estado:    "pendiente",
      prioridad: form.prioridad,
      createdAt: new Date().toISOString(),
    };
    setTareas((prev) => [nueva, ...prev]);
    setForm(FORM_VACÍO);
    setMostrarForm(false);
  }

  const total       = tareas.length;
  const completadas = tareas.filter((t) => t.estado === "completada").length;
  const pct         = total > 0 ? Math.round((completadas / total) * 100) : 0;

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>
            Tareas del paso
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {completadas}/{total} completadas
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 80,
              height: 4,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "#22c55e",
                borderRadius: 2,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", minWidth: 30, textAlign: "right" }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Lista */}
      {tareas.length === 0 ? (
        <div
          style={{
            padding: "28px 0",
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          No hay tareas para este paso.
        </div>
      ) : (
        tareas.map((t) => (
          <TareaCard key={t.id} tarea={t} onCompletar={marcarCompletada} />
        ))
      )}

      {/* Botón / formulario nueva tarea */}
      <div style={{ marginTop: 8 }}>
        {!mostrarForm ? (
          <button
            onClick={() => setMostrarForm(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              padding: "9px 14px",
              borderRadius: 8,
              background: "transparent",
              border: "1px dashed rgba(46,107,230,0.3)",
              color: "#2E6BE6",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Nueva tarea
          </button>
        ) : (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 14 }}>
              Nueva tarea
            </div>

            {/* Título */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                Título *
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Título de la tarea"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6,
                  padding: "7px 10px",
                  fontSize: 12,
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción de la tarea"
                rows={2}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6,
                  padding: "7px 10px",
                  fontSize: 12,
                  color: "white",
                  outline: "none",
                  resize: "vertical",
                  minHeight: 56,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Responsable + Vencimiento */}
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                  Responsable
                </label>
                <input
                  type="text"
                  value={form.responsable}
                  onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value }))}
                  placeholder="Nombre"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 12,
                    color: "white",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                  Vencimiento
                </label>
                <input
                  type="date"
                  value={form.vencimiento}
                  onChange={(e) => setForm((f) => ({ ...f, vencimiento: e.target.value }))}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 12,
                    color: "white",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Prioridad */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                Prioridad
              </label>
              <select
                value={form.prioridad}
                onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value as Tarea["prioridad"] }))}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6,
                  padding: "7px 10px",
                  fontSize: 12,
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={agregarTarea}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "7px 14px",
                  borderRadius: 6,
                  background: "#2E6BE6",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Agregar tarea
              </button>
              <button
                onClick={() => { setMostrarForm(false); setForm(FORM_VACÍO); }}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "7px 12px",
                  borderRadius: 6,
                  background: "transparent",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
