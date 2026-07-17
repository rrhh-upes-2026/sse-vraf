"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useWorkflowBlueprint, useWorkflowInstance } from "./useWorkflow";
import { WorkflowEngine } from "@/lib/workflow/workflowEngine";
import { emitEvents } from "@/lib/workflow/eventBus";
import { ROLE_PERMISSIONS } from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";
import type { RoleCode } from "@/types/roles";
import type {
  ProcessInstance,
  ProcessBlueprint,
  StageInstance,
  StageDefinition,
  TransitionDefinition,
  EngineResult,
  CanAdvanceResult,
  Actor,
} from "@/types/workflow";

export interface WorkflowEngineHandle {
  instance: ProcessInstance | null;
  blueprint: ProcessBlueprint | null;
  currentStage: StageInstance | undefined;
  currentStageDef: StageDefinition | undefined;
  availableTransitions: TransitionDefinition[];
  isLoading: boolean;
  assignActivity: (stageId: string, activityId: string, assigneeId: string, assigneeName: string) => Promise<EngineResult>;
  completeActivity: (stageId: string, activityId: string, data?: { formSubmission?: Record<string, unknown>; attachments?: string[] }) => Promise<EngineResult>;
  reopenActivity: (stageId: string, activityId: string) => Promise<EngineResult>;
  delegateActivity: (stageId: string, activityId: string, newAssigneeId: string, newAssigneeName: string) => Promise<EngineResult>;
  addComment: (stageId: string, activityId: string, texto: string) => Promise<EngineResult>;
  executeTransition: (transitionId: string, comment?: string) => Promise<EngineResult>;
  canAdvance: (transitionId: string) => CanAdvanceResult;
  getAvailableTransitions: () => TransitionDefinition[];
}

export function useWorkflowEngine(instanceId: string, blueprintIdOverride?: string): WorkflowEngineHandle {
  const { user } = useSession();
  const { data: serverInstance, isLoading: instanceLoading } = useWorkflowInstance(instanceId);
  const resolvedBlueprintId = blueprintIdOverride ?? serverInstance?.blueprintId ?? "";
  const { data: blueprint, isLoading: blueprintLoading } = useWorkflowBlueprint(resolvedBlueprintId);

  const [localInstance, setLocalInstance] = useState<ProcessInstance | null>(null);

  const actor = useMemo((): Actor => {
    const role = (user?.rol ?? "OPS") as RoleCode;
    return {
      id: user?.usuarioId ?? "",
      name: user?.name ?? "",
      roleCode: role,
      permissions: new Set<Permission>(ROLE_PERMISSIONS[role] ?? []),
    };
  }, [user]);

  const instance = localInstance ?? serverInstance ?? null;
  const isLoading = instanceLoading || blueprintLoading;

  const currentStage = instance?.stages.find((s) => s.defId === instance.currentStageId);
  const currentStageDef = blueprint?.stages.find((s) => s.id === instance?.currentStageId);
  const availableTransitions = instance && blueprint
    ? WorkflowEngine.getAvailableTransitions(instance, blueprint, actor)
    : [];

  const apply = useCallback((result: EngineResult): EngineResult => {
    setLocalInstance(result.instance);
    emitEvents(result.newEvents);
    return result;
  }, []);

  const now = () => new Date().toISOString();

  const assignActivity = useCallback(
    (stageId: string, activityId: string, assigneeId: string, assigneeName: string) => {
      if (!instance) return Promise.resolve({ ok: false, instance: {} as ProcessInstance, newEvents: [], error: "No instance" });
      return Promise.resolve(apply(WorkflowEngine.assignActivity(instance, stageId, activityId, assigneeId, assigneeName, actor, now())));
    },
    [instance, apply, actor],
  );

  const completeActivity = useCallback(
    (stageId: string, activityId: string, data?: { formSubmission?: Record<string, unknown>; attachments?: string[] }) => {
      if (!instance || !blueprint) return Promise.resolve({ ok: false, instance: {} as ProcessInstance, newEvents: [], error: "No instance" });
      return Promise.resolve(apply(WorkflowEngine.completeActivity(instance, blueprint, stageId, activityId, actor, now(), data)));
    },
    [instance, blueprint, apply, actor],
  );

  const reopenActivity = useCallback(
    (stageId: string, activityId: string) => {
      if (!instance) return Promise.resolve({ ok: false, instance: {} as ProcessInstance, newEvents: [], error: "No instance" });
      return Promise.resolve(apply(WorkflowEngine.reopenActivity(instance, stageId, activityId, actor, now())));
    },
    [instance, apply, actor],
  );

  const delegateActivity = useCallback(
    (stageId: string, activityId: string, newAssigneeId: string, newAssigneeName: string) => {
      if (!instance) return Promise.resolve({ ok: false, instance: {} as ProcessInstance, newEvents: [], error: "No instance" });
      return Promise.resolve(apply(WorkflowEngine.delegateActivity(instance, stageId, activityId, newAssigneeId, newAssigneeName, actor, now())));
    },
    [instance, apply, actor],
  );

  const addComment = useCallback(
    (stageId: string, activityId: string, texto: string) => {
      if (!instance) return Promise.resolve({ ok: false, instance: {} as ProcessInstance, newEvents: [], error: "No instance" });
      return Promise.resolve(apply(WorkflowEngine.addComment(instance, stageId, activityId, texto, actor, now())));
    },
    [instance, apply, actor],
  );

  const executeTransition = useCallback(
    (transitionId: string, comment?: string) => {
      if (!instance || !blueprint) return Promise.resolve({ ok: false, instance: {} as ProcessInstance, newEvents: [], error: "No instance" });
      return Promise.resolve(apply(WorkflowEngine.executeTransition(instance, blueprint, transitionId, actor, now(), comment)));
    },
    [instance, blueprint, apply, actor],
  );

  const canAdvance = useCallback(
    (transitionId: string): CanAdvanceResult => {
      if (!instance || !blueprint) return { ok: false, blockers: [] };
      return WorkflowEngine.canAdvance(instance, blueprint, transitionId, actor);
    },
    [instance, blueprint, actor],
  );

  const getAvailableTransitions = useCallback(
    (): TransitionDefinition[] => {
      if (!instance || !blueprint) return [];
      return WorkflowEngine.getAvailableTransitions(instance, blueprint, actor);
    },
    [instance, blueprint, actor],
  );

  return {
    instance,
    blueprint: blueprint ?? null,
    currentStage,
    currentStageDef,
    availableTransitions,
    isLoading,
    assignActivity,
    completeActivity,
    reopenActivity,
    delegateActivity,
    addComment,
    executeTransition,
    canAdvance,
    getAvailableTransitions,
  };
}
