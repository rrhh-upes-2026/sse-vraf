import type { BadgeVariant } from "@/components/ui/badge";
import type { WorkflowState } from "@/types/workflow";

export const WORKFLOW_STATE_LABEL: Record<WorkflowState, string> = {
  created:     "Creado",
  in_progress: "En progreso",
  waiting:     "En espera",
  blocked:     "Bloqueado",
  completed:   "Completado",
  cancelled:   "Cancelado",
  archived:    "Archivado",
};

export const WORKFLOW_STATE_VARIANT: Record<WorkflowState, BadgeVariant> = {
  created:     "gray",
  in_progress: "info",
  waiting:     "gray",
  blocked:     "warning",
  completed:   "success",
  cancelled:   "danger",
  archived:    "gray",
};
