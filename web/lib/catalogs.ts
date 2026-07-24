/**
 * Centralized badge/label/options maps for all shared domain enums.
 * Single source of truth — workspace modules import from here,
 * never define local maps for these values.
 */
import type { BadgeVariant } from "@/components/ui/badge";
import type {
  SemaforoColor,
  EstadoProceso,
  EstadoPlan,
  TipoPlan,
  TipoEvidencia,
  ComprasPrioridad,
  ComprasEstadoSolicitud,
  ComprasEstadoOrden,
} from "@/types/entities";

// ── Prioridad (baja | media | alta | critica) ─────────────────────────────────

export type Prioridad = "baja" | "media" | "alta" | "critica";

export const PRIORIDAD_BADGE: Record<Prioridad, BadgeVariant> = {
  baja:    "gray",
  media:   "info",
  alta:    "warning",
  critica: "danger",
};

export const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  baja:    "Baja",
  media:   "Media",
  alta:    "Alta",
  critica: "Crítica",
};

export const PRIORIDAD_OPTIONS: { value: Prioridad; label: string }[] = [
  { value: "baja",    label: "Baja" },
  { value: "media",   label: "Media" },
  { value: "alta",    label: "Alta" },
  { value: "critica", label: "Crítica" },
];

// ── SemaforoColor ─────────────────────────────────────────────────────────────

export const SEMAFORO_DOT: Record<SemaforoColor, string> = {
  verde:    "bg-sse-sem-green-fg",
  amarillo: "bg-sse-sem-amber-fg",
  rojo:     "bg-sse-sem-red-fg",
};

export const SEMAFORO_TEXT: Record<SemaforoColor, string> = {
  verde:    "text-sse-sem-green-fg",
  amarillo: "text-sse-sem-amber-fg",
  rojo:     "text-sse-sem-red-fg",
};

export const SEMAFORO_BADGE: Record<SemaforoColor, BadgeVariant> = {
  verde:    "success",
  amarillo: "warning",
  rojo:     "danger",
};

export const SEMAFORO_LABEL: Record<SemaforoColor, string> = {
  verde:    "Verde",
  amarillo: "Amarillo",
  rojo:     "Rojo",
};

// ── EstadoProceso ─────────────────────────────────────────────────────────────

export const ESTADO_PROCESO_BADGE: Record<EstadoProceso, BadgeVariant> = {
  borrador:   "gray",
  activo:     "success",
  en_riesgo:  "warning",
  completado: "info",
  archivado:  "default",
};

export const ESTADO_PROCESO_LABEL: Record<EstadoProceso, string> = {
  borrador:   "Borrador",
  activo:     "Activo",
  en_riesgo:  "En riesgo",
  completado: "Completado",
  archivado:  "Archivado",
};

// ── EstadoPlan ────────────────────────────────────────────────────────────────

export const ESTADO_PLAN_BADGE: Record<EstadoPlan, BadgeVariant> = {
  borrador: "gray",
  revision: "warning",
  aprobado: "success",
  vigente:  "success",
  cerrado:  "default",
};

export const ESTADO_PLAN_LABEL: Record<EstadoPlan, string> = {
  borrador: "Borrador",
  revision: "En revisión",
  aprobado: "Aprobado",
  vigente:  "Vigente",
  cerrado:  "Cerrado",
};

// ── TipoPlan ──────────────────────────────────────────────────────────────────

export const TIPO_PLAN_LABEL: Record<TipoPlan, string> = {
  estrategico: "Estratégico",
  operativo:   "Operativo",
  mejora:      "Mejora",
  accion:      "Acción",
};

export const TIPO_PLAN_OPTIONS: { value: TipoPlan; label: string }[] = [
  { value: "estrategico", label: "Estratégico" },
  { value: "operativo",   label: "Operativo" },
  { value: "mejora",      label: "Mejora" },
  { value: "accion",      label: "Acción" },
];

// ── EstadoObjetivo ────────────────────────────────────────────────────────────

export type EstadoObjetivo = "borrador" | "vigente" | "completado" | "cancelado";

export const ESTADO_OBJETIVO_BADGE: Record<EstadoObjetivo, BadgeVariant> = {
  borrador:   "gray",
  vigente:    "success",
  completado: "info",
  cancelado:  "danger",
};

export const ESTADO_OBJETIVO_LABEL: Record<EstadoObjetivo, string> = {
  borrador:   "Borrador",
  vigente:    "Vigente",
  completado: "Completado",
  cancelado:  "Cancelado",
};

export const ESTADO_OBJETIVO_OPTIONS: { value: EstadoObjetivo; label: string }[] = [
  { value: "borrador",   label: "Borrador" },
  { value: "vigente",    label: "Vigente" },
  { value: "completado", label: "Completado" },
  { value: "cancelado",  label: "Cancelado" },
];

// ── EstadoProyecto ────────────────────────────────────────────────────────────

export type EstadoProyecto = "activo" | "pausado" | "completado" | "cancelado";

export const ESTADO_PROYECTO_BADGE: Record<EstadoProyecto, BadgeVariant> = {
  activo:     "success",
  pausado:    "warning",
  completado: "success",
  cancelado:  "danger",
};

export const ESTADO_PROYECTO_LABEL: Record<EstadoProyecto, string> = {
  activo:     "Activo",
  pausado:    "Pausado",
  completado: "Completado",
  cancelado:  "Cancelado",
};

export const ESTADO_PROYECTO_OPTIONS: { value: EstadoProyecto; label: string }[] = [
  { value: "activo",     label: "Activo" },
  { value: "pausado",    label: "Pausado" },
  { value: "completado", label: "Completado" },
  { value: "cancelado",  label: "Cancelado" },
];

// ── EstadoEvidencia ───────────────────────────────────────────────────────────

export type EstadoEvidencia = "pendiente" | "cargada" | "validada" | "rechazada";

export const ESTADO_EVIDENCIA_BADGE: Record<EstadoEvidencia, BadgeVariant> = {
  pendiente: "warning",
  cargada:   "info",
  validada:  "success",
  rechazada: "danger",
};

export const ESTADO_EVIDENCIA_LABEL: Record<EstadoEvidencia, string> = {
  pendiente: "Pendiente",
  cargada:   "Cargada",
  validada:  "Validada",
  rechazada: "Rechazada",
};

// ── EstadoRevisionEvidencia ───────────────────────────────────────────────────

export type EstadoRevisionEvidencia = "pendiente" | "en_revision" | "aprobada" | "rechazada";

export const ESTADO_REVISION_BADGE: Record<EstadoRevisionEvidencia, BadgeVariant> = {
  pendiente:   "gray",
  en_revision: "warning",
  aprobada:    "success",
  rechazada:   "danger",
};

export const ESTADO_REVISION_LABEL: Record<EstadoRevisionEvidencia, string> = {
  pendiente:   "Pendiente",
  en_revision: "En revisión",
  aprobada:    "Aprobada",
  rechazada:   "Rechazada",
};

export const ESTADO_REVISION_OPTIONS: { value: EstadoRevisionEvidencia; label: string }[] = [
  { value: "pendiente",   label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobada",    label: "Aprobada" },
  { value: "rechazada",   label: "Rechazada" },
];

// ── FrecuenciaIndicador ───────────────────────────────────────────────────────

export type FrecuenciaIndicador = "mensual" | "trimestral" | "semestral" | "anual";

export const FRECUENCIA_LABEL: Record<FrecuenciaIndicador, string> = {
  mensual:    "Mensual",
  trimestral: "Trimestral",
  semestral:  "Semestral",
  anual:      "Anual",
};

export const FRECUENCIA_OPTIONS: { value: FrecuenciaIndicador; label: string }[] = [
  { value: "mensual",    label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral",  label: "Semestral" },
  { value: "anual",      label: "Anual" },
];

// ── TipoEvidencia ─────────────────────────────────────────────────────────────

export const TIPO_EVIDENCIA_LABEL: Record<TipoEvidencia, string> = {
  documento:   "Documento",
  formulario:  "Formulario",
  archivo:     "Archivo",
  registro:    "Registro",
  fotografia:  "Fotografía",
  acta:        "Acta",
  contrato:    "Contrato",
  informe:     "Informe",
  comprobante: "Comprobante",
  otro:        "Otro",
};

export const TIPO_EVIDENCIA_OPTIONS: { value: TipoEvidencia; label: string }[] = [
  { value: "documento",   label: "Documento" },
  { value: "formulario",  label: "Formulario" },
  { value: "archivo",     label: "Archivo" },
  { value: "registro",    label: "Registro" },
  { value: "fotografia",  label: "Fotografía" },
  { value: "acta",        label: "Acta" },
  { value: "contrato",    label: "Contrato" },
  { value: "informe",     label: "Informe" },
  { value: "comprobante", label: "Comprobante" },
  { value: "otro",        label: "Otro" },
];

// ── Compras ───────────────────────────────────────────────────────────────────

export const COMPRAS_PRIORIDAD_BADGE: Record<ComprasPrioridad, BadgeVariant> = {
  normal:  "default",
  urgente: "warning",
  critica: "danger",
};

export const COMPRAS_PRIORIDAD_LABEL: Record<ComprasPrioridad, string> = {
  normal:  "Normal",
  urgente: "Urgente",
  critica: "Crítica",
};

export const COMPRAS_ESTADO_SOL_BADGE: Record<ComprasEstadoSolicitud, BadgeVariant> = {
  pendiente:   "warning",
  en_revision: "info",
  aprobada:    "success",
  rechazada:   "danger",
  archivada:   "gray",
};

export const COMPRAS_ESTADO_SOL_LABEL: Record<ComprasEstadoSolicitud, string> = {
  pendiente:   "Pendiente",
  en_revision: "En revisión",
  aprobada:    "Aprobada",
  rechazada:   "Rechazada",
  archivada:   "Archivada",
};

export const COMPRAS_ESTADO_OC_BADGE: Record<ComprasEstadoOrden, BadgeVariant> = {
  borrador:  "gray",
  emitida:   "info",
  recibida:  "success",
  pagada:    "success",
  cancelada: "danger",
};

export const COMPRAS_ESTADO_OC_LABEL: Record<ComprasEstadoOrden, string> = {
  borrador:  "Borrador",
  emitida:   "Emitida",
  recibida:  "Recibida",
  pagada:    "Pagada",
  cancelada: "Cancelada",
};

// ── Avance color helper ───────────────────────────────────────────────────────

export function avanceColor(pct: number): "success" | "warning" | "danger" {
  if (pct >= 70) return "success";
  if (pct >= 40) return "warning";
  return "danger";
}
