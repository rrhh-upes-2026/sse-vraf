"use client";

/**
 * ComentariosThread — hilo de comentarios anidados para pasos, tareas y documentos
 * de PRO-TH-001.
 */

import { useState } from "react";
import type { Comentario } from "@/types/contratacion";

interface ComentariosThreadProps {
  procesoId: string;
  contexto: "paso" | "tarea" | "documento";
  contextoId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs} hora${hrs > 1 ? "s" : ""}`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} día${days > 1 ? "s" : ""}`;
}

// ── Demo data ─────────────────────────────────────────────────────────────────

function comentariosDemo(
  procesoId: string,
  contexto: string,
  contextoId: string,
): Comentario[] {
  if (contexto === "paso") {
    return [
      {
        id: "c-demo-1",
        procesoId,
        contexto,
        contextoId,
        autor: "María Rivas",
        texto:
          "Ya se coordinó la entrevista con el Jefe de Área para el martes 21. Pendiente confirmación del candidato.",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        respuestas: [
          {
            id: "c-demo-1-r1",
            procesoId,
            contexto,
            contextoId,
            autor: "Carlos Mendoza",
            texto: "Perfecto, yo confirmo con el candidato hoy en la tarde.",
            createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
          },
        ],
      },
    ];
  }
  return [
    {
      id: "c-demo-2",
      procesoId,
      contexto,
      contextoId,
      autor: "Ana Flores",
      texto:
        "Documentación revisada. Falta únicamente la constancia de grado académico.",
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: "c-demo-3",
      procesoId,
      contexto,
      contextoId,
      autor: "Roberto López",
      texto:
        "Se le notificó al candidato que debe enviar la constancia antes del viernes.",
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
  ];
}

// ── Avatar de iniciales ───────────────────────────────────────────────────────

function Avatar({ nombre, size = 30 }: { nombre: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#2E6BE6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        color: "white",
        flexShrink: 0,
        letterSpacing: "0.02em",
        userSelect: "none",
      }}
    >
      {iniciales(nombre)}
    </div>
  );
}

// ── Tarjeta de comentario individual ─────────────────────────────────────────

function ComentarioCard({
  comentario,
  onResponder,
  profundidad = 0,
}: {
  comentario: Comentario;
  onResponder: (parentId: string, texto: string) => void;
  profundidad?: number;
}) {
  const [respondiendo, setRespondiendo]       = useState(false);
  const [textoRespuesta, setTextoRespuesta]   = useState("");
  const avatarSize                            = profundidad > 0 ? 24 : 30;

  function enviarRespuesta() {
    if (!textoRespuesta.trim()) return;
    onResponder(comentario.id, textoRespuesta.trim());
    setTextoRespuesta("");
    setRespondiendo(false);
  }

  return (
    <div style={{ marginLeft: profundidad > 0 ? 40 : 0 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: profundidad > 0 ? 8 : 14 }}>
        <Avatar nombre={comentario.autor} size={avatarSize} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Autor + timestamp */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
              {comentario.autor}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {tiempoRelativo(comentario.createdAt)}
            </span>
            {comentario.editadoAt && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                (editado)
              </span>
            )}
          </div>

          {/* Texto */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 13,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.55,
              marginBottom: 6,
            }}
          >
            {comentario.texto}
          </div>

          {/* Botón responder — solo en nivel raíz */}
          {profundidad === 0 && (
            <button
              onClick={() => setRespondiendo((v) => !v)}
              style={{
                fontSize: 11,
                color: "#2E6BE6",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontWeight: 500,
              }}
            >
              Responder
            </button>
          )}

          {/* Input de respuesta */}
          {respondiendo && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <textarea
                value={textoRespuesta}
                onChange={(e) => setTextoRespuesta(e.target.value)}
                placeholder="Escribe una respuesta…"
                rows={2}
                autoFocus
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontSize: 12,
                  color: "white",
                  outline: "none",
                  resize: "vertical",
                  minHeight: 52,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <button
                  onClick={enviarRespuesta}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "6px 11px",
                    borderRadius: 5,
                    background: "#2E6BE6",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Responder
                </button>
                <button
                  onClick={() => { setRespondiendo(false); setTextoRespuesta(""); }}
                  style={{
                    fontSize: 11,
                    padding: "5px 10px",
                    borderRadius: 5,
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

      {/* Respuestas anidadas */}
      {comentario.respuestas?.map((r) => (
        <ComentarioCard
          key={r.id}
          comentario={r}
          onResponder={onResponder}
          profundidad={profundidad + 1}
        />
      ))}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ComentariosThread({
  procesoId,
  contexto,
  contextoId,
}: ComentariosThreadProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>(() =>
    comentariosDemo(procesoId, contexto, contextoId)
  );
  const [nuevoTexto, setNuevoTexto]   = useState("");

  function agregarComentario() {
    if (!nuevoTexto.trim()) return;
    const nuevo: Comentario = {
      id:         `c-${Date.now()}`,
      procesoId,
      contexto,
      contextoId,
      autor:      "Usuario Actual",
      texto:      nuevoTexto.trim(),
      createdAt:  new Date().toISOString(),
      respuestas: [],
    };
    setComentarios((prev) => [...prev, nuevo]);
    setNuevoTexto("");
  }

  function agregarRespuesta(parentId: string, texto: string) {
    const respuesta: Comentario = {
      id:         `c-${Date.now()}`,
      procesoId,
      contexto,
      contextoId,
      autor:      "Usuario Actual",
      texto,
      createdAt:  new Date().toISOString(),
    };
    setComentarios((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, respuestas: [...(c.respuestas ?? []), respuesta] }
          : c
      )
    );
  }

  const totalComentarios = comentarios.reduce(
    (acc, c) => acc + 1 + (c.respuestas?.length ?? 0),
    0
  );

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Cabecera */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 16 }}>
        Comentarios
        <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>
          ({totalComentarios})
        </span>
      </div>

      {/* Hilo */}
      {comentarios.length === 0 ? (
        <div
          style={{
            padding: "24px 0",
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.25)",
            marginBottom: 16,
          }}
        >
          Sin comentarios aún. Sé el primero en comentar.
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          {comentarios.map((c) => (
            <ComentarioCard
              key={c.id}
              comentario={c}
              onResponder={agregarRespuesta}
            />
          ))}
        </div>
      )}

      {/* Nuevo comentario */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: 16,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <Avatar nombre="Usuario Actual" size={28} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={nuevoTexto}
            onChange={(e) => setNuevoTexto(e.target.value)}
            placeholder="Añade un comentario…"
            rows={3}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 13,
              color: "white",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={agregarComentario}
              disabled={!nuevoTexto.trim()}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "7px 14px",
                borderRadius: 6,
                background: nuevoTexto.trim() ? "#2E6BE6" : "rgba(255,255,255,0.07)",
                color: nuevoTexto.trim() ? "white" : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: nuevoTexto.trim() ? "pointer" : "default",
                transition: "background 0.15s",
              }}
            >
              Comentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
