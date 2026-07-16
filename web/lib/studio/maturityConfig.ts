import type { MaturityLevel } from "@/types/studio";
import type { BadgeVariant } from "@/components/ui/badge";

export interface MaturityConfig {
  label: string;
  variant: BadgeVariant;
  description: string;
  order: number;
}

export const MATURITY_CONFIG: Record<MaturityLevel, MaturityConfig> = {
  draft: {
    label:       "Borrador",
    variant:     "gray",
    description: "En diseño, aún no listo para pruebas.",
    order:       0,
  },
  experimental: {
    label:       "Experimental",
    variant:     "warning",
    description: "Primera versión publicada; se esperan cambios significativos.",
    order:       1,
  },
  pilot: {
    label:       "Piloto",
    variant:     "info",
    description: "Ejecutándose en alcance limitado antes del despliegue general.",
    order:       2,
  },
  production: {
    label:       "Producción",
    variant:     "info",
    description: "Activo en todos los espacios de trabajo aplicables.",
    order:       3,
  },
  stable: {
    label:       "Estable",
    variant:     "success",
    description: "Maduro, bien probado; cambios infrecuentes.",
    order:       4,
  },
  deprecated: {
    label:       "Deprecado",
    variant:     "warning",
    description: "En proceso de retiro; no crear nuevas instancias.",
    order:       5,
  },
  archived: {
    label:       "Archivado",
    variant:     "gray",
    description: "Sin uso activo; conservado sólo para auditoría.",
    order:       6,
  },
};

export const MATURITY_LEVELS_ORDERED: MaturityLevel[] = [
  "draft",
  "experimental",
  "pilot",
  "production",
  "stable",
  "deprecated",
  "archived",
];

export function getMaturityConfig(level: MaturityLevel): MaturityConfig {
  return MATURITY_CONFIG[level];
}
