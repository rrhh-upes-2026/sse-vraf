/**
 * Registro Único Institucional (RUI) — MASTER HANDOFF §17.
 * Nunca usar UUID puro para entidades de negocio visibles al usuario;
 * siempre un identificador legible con este esquema.
 */
import type { WorkspaceId } from "@/config/nav";

const UNIT_CODE: Record<WorkspaceId, string> = {
  vraf: "VRAF",
  rrhh: "RH",
  conta: "CONT",
  compras: "COMP",
  mant: "MANT",
  salud: "SSO",
  ime: "IME",
  pme: "PME",
  ape: "APE",
  aee: "AEE",
  eme: "EME",
  cpe: "CPE",
  eip: "EIP",
  iie: "IIE",
  ioe: "IOE",
  aue: "AUE",
};

function pad(n: number, width: number) {
  return String(n).padStart(width, "0");
}

function yy(date = new Date()) {
  return String(date.getFullYear()).slice(-2);
}

export function buildProcesoId(unidad: WorkspaceId, seq: number, date = new Date()) {
  return `PROC-${UNIT_CODE[unidad]}-${yy(date)}-${pad(seq, 3)}`;
}

export function buildActividadId(procesoId: string, seq: number) {
  return `ACT-${procesoId}-${pad(seq, 2)}`;
}

export function buildEvidenciaId(actividadId: string, seq: number) {
  return `EV-${actividadId}-${pad(seq, 2)}`;
}

export function buildIndicadorId(unidad: WorkspaceId, seq: number) {
  return `KPI-${UNIT_CODE[unidad]}-${pad(seq, 3)}`;
}

export function buildFormularioId(unidad: WorkspaceId, seq: number, version: string) {
  return `FORM-${UNIT_CODE[unidad]}-${pad(seq, 3)}-v${version}`;
}

export function buildSolicitudId(unidad: WorkspaceId, seq: number, date = new Date()) {
  return `SOL-${UNIT_CODE[unidad]}-${yy(date)}-${pad(seq, 3)}`;
}

export function buildReporteId(unidad: WorkspaceId, period: string, date = new Date()) {
  return `REP-${UNIT_CODE[unidad]}-${period.toUpperCase()}-${yy(date)}`;
}

export function buildUsuarioId(unidad: WorkspaceId, seq: number) {
  return `USR-${UNIT_CODE[unidad]}-${pad(seq, 3)}`;
}
