import { createEntityService } from "./entityService";
import type { ProcessBlueprint, ProcessInstance } from "@/types/workflow";

export const WorkflowBlueprintsService = createEntityService<ProcessBlueprint>("workflowBlueprints");
export const WorkflowInstancesService  = createEntityService<ProcessInstance>("workflowInstances");
