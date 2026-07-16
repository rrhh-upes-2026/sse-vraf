import type { BadgeVariant } from "@/components/ui/badge";
import type { BlueprintStatus } from "@/types/studio";

export const BLUEPRINT_STATUS_VARIANT: Record<BlueprintStatus, BadgeVariant> = {
  published:  "success",
  draft:      "gray",
  validating: "info",
  deprecated: "warning",
  archived:   "gray",
};

export const BLUEPRINT_STATUS_LABEL: Record<BlueprintStatus, string> = {
  published:  "Publicado",
  draft:      "Borrador",
  validating: "Validando",
  deprecated: "Deprecado",
  archived:   "Archivado",
};
