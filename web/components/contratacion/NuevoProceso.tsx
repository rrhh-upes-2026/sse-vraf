"use client";

/**
 * NuevoProceso — Paso 1 de PRO-TH-001.
 *
 * El Jefe de Área identifica la necesidad y decide si corresponde a una
 * plaza existente (→ Paso 8) o a una nueva plaza (→ Paso 2).
 * Aquí se capturan los datos básicos y se registra esa decisión.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCrearProceso } from "@/hooks/useContratacion";
import type { ProcesoContratacion } from "@/types/contratacion";

interface NuevoProcesoProps {
  wsId: string;
}

export function NuevoProceso({ wsId }: NuevoProcesoProps) {
  const router = useRouter();
  const crear  = useCrearProceso(wsId);

  const [form, setForm] = useState({
    nombrePuesto:     "",
    unidadFacultad:   "",
    jefeSolicitante:  "",
    cargoSolicitante: "",
    tipoContratacion: "permanente" as ProcesoContratacion["tipoContratacion"],
    prioridad:        "normal" as ProcesoContratacion["prioridad"],
    tipoPuesto:       "plaza_existente" as ProcesoContratacion["tipoPuesto"],
    motivoVacante:    "" as ProcesoContratacion["motivoVacante"],
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  async function handleSubmit() {
    if (!form.nombrePuesto.trim() || !form.unidadFacultad.trim()) return;
    const proceso = await crear.mutateAsync({
      ...form,
      etapaActual: form.tipoPuesto === "plaza_existente" ? "requisicion" : "identificacion_necesidad",
      pasoActual:  form.tipoPuesto === "plaza_existente" ? 8 : 2,
    });
    router.push(`/ws/${wsId}/contratacion/${proceso.id}`);
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 660 }}>
      {/* Cabecera */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 8 }}>
          PRO-TH-001 · PASO 1
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 6 }}>
          Identificar necesidad de contratación
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
          El Jefe de Área identifica la necesidad y valida si corresponde a una plaza existente.
          Si es una plaza existente, el proceso avanza directamente al Paso 8 (Requisición).
          Si es una nueva plaza, se requiere elaborar el Proyecto de Creación de Plaza (Pasos 2-7).
        </div>
      </div>

      {/* Decisión clave: tipo de plaza */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {(["plaza_existente", "nueva_plaza"] as const).map((tipo) => {
          const activo = form.tipoPuesto === tipo;
          return (
            <button
              key={tipo}
              onClick={() => setForm((f) => ({ ...f, tipoPuesto: tipo }))}
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRadius: 10,
                border: `2px solid ${activo ? "#2E6BE6" : "rgba(255,255,255,0.1)"}`,
                background: activo ? "rgba(46,107,230,0.12)" : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: activo ? "white" : "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                {tipo === "plaza_existente" ? "Plaza existente" : "Nueva plaza"}
              </div>
              <div style={{ fontSize: 11, color: activo ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}>
                {tipo === "plaza_existente"
                  ? "La vacante corresponde a una plaza ya aprobada en el MOF → Paso 8"
                  : "Se requiere crear una nueva plaza → Pasos 2-7 (aprobación de Rectoría)"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Datos del proceso */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
            Nombre del puesto <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            style={inputStyle}
            value={form.nombrePuesto}
            onChange={(e) => setForm((f) => ({ ...f, nombrePuesto: e.target.value }))}
            placeholder="Ej. Técnico de Soporte IT"
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
            Unidad / Facultad solicitante <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            style={inputStyle}
            value={form.unidadFacultad}
            onChange={(e) => setForm((f) => ({ ...f, unidadFacultad: e.target.value }))}
            placeholder="Ej. Dirección de Tecnología y Administración Informática"
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
              Nombre del jefe solicitante
            </label>
            <input
              style={inputStyle}
              value={form.jefeSolicitante}
              onChange={(e) => setForm((f) => ({ ...f, jefeSolicitante: e.target.value }))}
              placeholder="Nombre completo"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
              Cargo del solicitante
            </label>
            <input
              style={inputStyle}
              value={form.cargoSolicitante}
              onChange={(e) => setForm((f) => ({ ...f, cargoSolicitante: e.target.value }))}
              placeholder="Cargo institucional"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
              Tipo de contratación
            </label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.tipoContratacion}
              onChange={(e) => setForm((f) => ({ ...f, tipoContratacion: e.target.value as typeof form.tipoContratacion }))}
            >
              <option value="permanente">Permanente</option>
              <option value="interino">Interino</option>
              <option value="eventual">Eventual</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
              Prioridad
            </label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.prioridad}
              onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value as typeof form.prioridad }))}
            >
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        {form.tipoPuesto === "plaza_existente" && (
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
              Motivo de la vacante
            </label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.motivoVacante ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, motivoVacante: e.target.value as typeof form.motivoVacante }))}
            >
              <option value="">Seleccionar motivo…</option>
              <option value="retiro_voluntario">Retiro voluntario</option>
              <option value="terminacion_contrato">Terminación de contrato</option>
              <option value="cancelacion_contrato">Cancelación de contrato</option>
              <option value="promocion_traslado">Promoción / traslado</option>
              <option value="permiso_licencia">Permiso / licencia</option>
              <option value="incapacidad_enfermedad">Incapacidad por enfermedad</option>
              <option value="incapacidad_maternidad">Incapacidad por maternidad</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        )}
      </div>

      {/* Botones */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 28,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={() => router.push(`/ws/${wsId}/contratacion`)}
          style={{
            padding: "9px 18px",
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
          onClick={handleSubmit}
          disabled={crear.isPending || !form.nombrePuesto.trim() || !form.unidadFacultad.trim()}
          style={{
            padding: "9px 20px",
            borderRadius: 8,
            background: "#2E6BE6",
            border: "none",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor:
              crear.isPending || !form.nombrePuesto.trim() || !form.unidadFacultad.trim()
                ? "not-allowed"
                : "pointer",
            opacity:
              crear.isPending || !form.nombrePuesto.trim() || !form.unidadFacultad.trim() ? 0.6 : 1,
          }}
        >
          {crear.isPending ? "Creando proceso…" : "Iniciar proceso"}
        </button>

        {crear.isError && (
          <span style={{ fontSize: 12, color: "#ef4444" }}>Error al crear el proceso</span>
        )}
      </div>
    </div>
  );
}
