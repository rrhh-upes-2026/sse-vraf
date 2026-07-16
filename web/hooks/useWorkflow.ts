"use client";

import { useEntityList, useEntityItem } from "./useEntity";
import { WorkflowBlueprintsService, WorkflowInstancesService } from "@/services/workflow";
import type { ProcessBlueprint, ProcessInstance } from "@/types/workflow";

export const workflowKeys = {
  blueprint: (id: string) => ["workflowBlueprints", "item", id] as const,
  instance: (id: string) => ["workflowInstances", "item", id] as const,
  instances: (filter?: { unidadId?: string }) => ["workflowInstances", "list", filter] as const,
};

export function useWorkflowBlueprint(blueprintId: string) {
  return useEntityItem<ProcessBlueprint>("workflowBlueprints", WorkflowBlueprintsService, blueprintId);
}

export function useWorkflowInstance(instanceId: string) {
  return useEntityItem<ProcessInstance>("workflowInstances", WorkflowInstancesService, instanceId);
}

export function useProcessInstances(unidadId?: string) {
  const filter = unidadId ? { unidadId } : undefined;
  return useEntityList<ProcessInstance>("workflowInstances", WorkflowInstancesService, filter);
}
