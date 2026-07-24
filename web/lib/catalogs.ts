/**
 * Centralized badge/label maps for all shared domain enums.
 * Single source of truth — workspace modules import from here,
 * never define local maps for these values.
 */
import type { BadgeVariant } from "@/components/ui/badge";
import type {
  SemaforoColor,
  EstadoProceso,
  EstadoPlan,
  TipoPlan,
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

// ── Avance color helper ───────────────────────────────────────────────────────

export function avanceColor(pct: number): "success" | "warning" | "danger" {
  if (pct >= 70) return "success";
  if (pct >= 40) return "warning";
  return "danger";
}
