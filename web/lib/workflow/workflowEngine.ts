import type {
  ProcessBlueprint,
  ProcessInstance,
  StageInstance,
  InstanceActivity,
  Actor,
  EngineResult,
  WorkflowEvent,
  CanAdvanceResult,
  TransitionDefinition,
} from "@/types/workflow";
import { makeEvent } from "./eventFactory";
import { applyStateTransition, canTransition, isTerminal } from "./stateMachine";
import { evaluateRules, allPassed, failedRules } from "./validationEngine";
import {
  assignActivity as doAssign,
  completeActivity as doComplete,
  reopenActivity as doReopen,
  delegateActivity as doDelegate,
  addComment as doComment,
  areRequiredActivitiesDone,
} from "./activityEngine";
import {
  startStage,
  completeStage,
  updateStageInInstance,
  updateActivityInStage,
  findStageInstance,
} from "./stageEngine";
import { eventsToTimeline } from "./timelineEngine";
import {
  checkTransitionAllowed,
  executeTransition as doExecuteTransition,
} from "./transitionEngine";

export { makeEvent };

// ─── helpers ────────────────────────────────────────────────────────────────

function appendEvents(instance: ProcessInstance, events: WorkflowEvent[]): ProcessInstance {
  const newTimeline = eventsToTimeline(events);
  return {
    ...instance,
    auditLog: [...instance.auditLog, ...events],
    timeline: [...instance.timeline, ...newTimeline],
    updatedAt: events.at(-1)?.occurredAt ?? instance.updatedAt,
  };
}

function ok(instance: ProcessInstance, newEvents: WorkflowEvent[]): EngineResult {
  return { ok: true, instance, newEvents };
}

function err(instance: ProcessInstance, error: string): EngineResult {
  return { ok: false, instance, newEvents: [], error };
}

function stageDefFor(blueprint: ProcessBlueprint, stageId: string) {
  return blueprint.stages.find((s) => s.id === stageId);
}

// ─── WorkflowEngine ─────────────────────────────────────────────────────────

export const WorkflowEngine = {
  /** Create a brand-new instance from a blueprint. */
  create(
    blueprint: ProcessBlueprint,
    instanceId: string,
    nombre: string,
    actor: Actor,
    now: string,
    contextData: Record<string, unknown> = {},
  ): EngineResult {
    const initialStageDef = blueprint.stages.find((s) => s.id === blueprint.initialStageId);
    if (!initialStageDef) {
      const bare: ProcessInstance = {
        id: instanceId,
        blueprintId: blueprint.id,
        blueprintVersion: blueprint.version,
        blueprintName: blueprint.nombre,
        unidadId: blueprint.unidadId,
        nombre,
        estado: "created",
        currentStageId: "",
        stages: [],
        assignedUsers: [],
        auditLog: [],
        timeline: [],
        evidencias: [],
        contextData,
        createdAt: now,
        createdBy: actor.id,
        createdByName: actor.name,
        updatedAt: now,
      };
      return err(bare, `Blueprint "${blueprint.id}" missing initialStageId "${blueprint.initialStageId}"`);
    }

    const stages: StageInstance[] = blueprint.stages.map((def) => ({
      defId: def.id,
      label: def.nombre,
      orden: def.orden,
      estado: def.id === blueprint.initialStageId ? "activa" : "pendiente",
      activities: def.activities.map((a) => ({
        defId: a.id,
        label: a.label,
        type: a.type,
        required: a.required,
        estado: "pendiente" as const,
        formId: a.formId,
        evidenceCategory: a.evidenceCategory,
        dependencies: a.dependencies,
      })),
      startedAt: def.id === blueprint.initialStageId ? now : undefined,
    }));

    const instance: ProcessInstance = {
      id: instanceId,
      blueprintId: blueprint.id,
      blueprintVersion: blueprint.version,
      blueprintName: blueprint.nombre,
      unidadId: blueprint.unidadId,
      nombre,
      estado: "in_progress",
      currentStageId: blueprint.initialStageId,
      stages,
      assignedUsers: [],
      auditLog: [],
      timeline: [],
      evidencias: [],
      contextData,
      createdAt: now,
      createdBy: actor.id,
      createdByName: actor.name,
      updatedAt: now,
    };

    const events: WorkflowEvent[] = [
      makeEvent("WorkflowCreated", instanceId, actor, now, { nombre, blueprintId: blueprint.id }),
      makeEvent("WorkflowStarted", instanceId, actor, now, {}),
      makeEvent("StageStarted", instanceId, actor, now, {
        stageId: initialStageDef.id,
        stageLabel: initialStageDef.nombre,
      }),
    ];

    return ok(appendEvents(instance, events), events);
  },

  /** Assign an activity to a user. */
  assignActivity(
    instance: ProcessInstance,
    stageId: string,
    activityId: string,
    assigneeId: string,
    assigneeName: string,
    actor: Actor,
    now: string,
  ): EngineResult {
    if (isTerminal(instance.estado)) return err(instance, "Workflow terminado");
    const stageInst = findStageInstance(instance, stageId);
    if (!stageInst) return err(instance, `Etapa "${stageId}" no encontrada`);

    const updatedStage = updateActivityInStage(stageInst, activityId, (a) =>
      doAssign(a, assigneeId, assigneeName),
    );
    const updated = updateStageInInstance(instance, updatedStage);

    const act = updatedStage.activities.find((a) => a.defId === activityId)!;
    const events: WorkflowEvent[] = [
      makeEvent("ActivityAssigned", instance.id, actor, now, {
        stageId,
        activityId,
        activityLabel: act.label,
        assigneeId,
        assigneeName,
      }),
    ];
    return ok(appendEvents(updated, events), events);
  },

  /** Mark an activity as completed. */
  completeActivity(
    instance: ProcessInstance,
    blueprint: ProcessBlueprint,
    stageId: string,
    activityId: string,
    actor: Actor,
    now: string,
    data?: { formSubmission?: Record<string, unknown>; attachments?: string[] },
  ): EngineResult {
    if (isTerminal(instance.estado)) return err(instance, "Workflow terminado");
    const stageInst = findStageInstance(instance, stageId);
    if (!stageInst) return err(instance, `Etapa "${stageId}" no encontrada`);

    const updatedStage = updateActivityInStage(stageInst, activityId, (a) =>
      doComplete(a, actor.id, now, data),
    );
    let updated = updateStageInInstance(instance, updatedStage);

    const act = updatedStage.activities.find((a) => a.defId === activityId)!;
    const events: WorkflowEvent[] = [];

    if (act.type === "form" && data?.formSubmission) {
      events.push(
        makeEvent("FormSubmitted", instance.id, actor, now, {
          stageId,
          activityId,
          formId: act.formId ?? activityId,
          formLabel: act.label,
        }),
      );
    } else if (act.type === "evidence") {
      events.push(
        makeEvent("EvidenceValidated", instance.id, actor, now, {
          stageId,
          activityId,
          fileName: data?.attachments?.[0] ?? act.label,
        }),
      );
    } else if (act.type === "approval") {
      events.push(
        makeEvent("ApprovalGranted", instance.id, actor, now, {
          stageId,
          activityId,
          approverName: actor.name,
        }),
      );
    }

    events.push(
      makeEvent("ActivityCompleted", instance.id, actor, now, {
        stageId,
        activityId,
        activityLabel: act.label,
      }),
    );

    updated = appendEvents(updated, events);

    // Auto-advance if all required activities done and stage is auto-advance
    const stageDef = stageDefFor(blueprint, stageId);
    if (stageDef?.autoAdvance && areRequiredActivitiesDone(updatedStage.activities)) {
      const autoTransition = stageDef.transitions.find((t) => t.type === "approve");
      if (autoTransition) {
        const check = checkTransitionAllowed(updated, blueprint, autoTransition, actor);
        if (check.allowed) {
          const { instance: advanced, events: transEvents } = doExecuteTransition(
            updated,
            blueprint,
            autoTransition,
            actor,
            now,
          );
          updated = appendEvents(advanced, transEvents);
          return ok(updated, [...events, ...transEvents]);
        }
      }
    }

    return ok(updated, events);
  },

  /** Reopen a completed activity. */
  reopenActivity(
    instance: ProcessInstance,
    stageId: string,
    activityId: string,
    actor: Actor,
    now: string,
  ): EngineResult {
    if (isTerminal(instance.estado)) return err(instance, "Workflow terminado");
    const stageInst = findStageInstance(instance, stageId);
    if (!stageInst) return err(instance, `Etapa "${stageId}" no encontrada`);

    const updatedStage = updateActivityInStage(stageInst, activityId, doReopen);
    const updated = updateStageInInstance(instance, updatedStage);
    const act = updatedStage.activities.find((a) => a.defId === activityId)!;

    const events: WorkflowEvent[] = [
      makeEvent("ActivityReopened", instance.id, actor, now, {
        stageId,
        activityId,
        activityLabel: act.label,
      }),
    ];
    return ok(appendEvents(updated, events), events);
  },

  /** Delegate an activity to another user. */
  delegateActivity(
    instance: ProcessInstance,
    stageId: string,
    activityId: string,
    newAssigneeId: string,
    newAssigneeName: string,
    actor: Actor,
    now: string,
  ): EngineResult {
    if (isTerminal(instance.estado)) return err(instance, "Workflow terminado");
    const stageInst = findStageInstance(instance, stageId);
    if (!stageInst) return err(instance, `Etapa "${stageId}" no encontrada`);

    const updatedStage = updateActivityInStage(stageInst, activityId, (a) =>
      doDelegate(a, newAssigneeId, newAssigneeName),
    );
    const updated = updateStageInInstance(instance, updatedStage);
    const act = updatedStage.activities.find((a) => a.defId === activityId)!;

    const events: WorkflowEvent[] = [
      makeEvent("AssigneeChanged", instance.id, actor, now, {
        stageId,
        activityId,
        activityLabel: act.label,
        assigneeId: newAssigneeId,
        assigneeName: newAssigneeName,
      }),
    ];
    return ok(appendEvents(updated, events), events);
  },

  /** Add a comment to an activity. */
  addComment(
    instance: ProcessInstance,
    stageId: string,
    activityId: string,
    texto: string,
    actor: Actor,
    now: string,
  ): EngineResult {
    if (isTerminal(instance.estado)) return err(instance, "Workflow terminado");
    const stageInst = findStageInstance(instance, stageId);
    if (!stageInst) return err(instance, `Etapa "${stageId}" no encontrada`);

    const updatedStage = updateActivityInStage(stageInst, activityId, (a) =>
      doComment(a, actor.id, actor.name, texto, now),
    );
    const updated = updateStageInInstance(instance, updatedStage);

    const events: WorkflowEvent[] = [
      makeEvent("CommentAdded", instance.id, actor, now, {
        stageId,
        activityId,
        authorName: actor.name,
        texto,
      }),
    ];
    return ok(appendEvents(updated, events), events);
  },

  /** Execute a named transition (approve/reject/cancel/etc). */
  executeTransition(
    instance: ProcessInstance,
    blueprint: ProcessBlueprint,
    transitionId: string,
    actor: Actor,
    now: string,
    comment?: string,
  ): EngineResult {
    const stageDef = stageDefFor(blueprint, instance.currentStageId);
    const allTransitions: TransitionDefinition[] = [
      ...(stageDef?.transitions ?? []),
      ...(blueprint.globalTransitions ?? []),
    ];
    const transition = allTransitions.find((t) => t.id === transitionId);
    if (!transition) return err(instance, `Transición "${transitionId}" no encontrada`);

    const check = checkTransitionAllowed(instance, blueprint, transition, actor);
    if (!check.allowed) {
      return err(instance, check.error ?? "Transición no permitida");
    }

    const { instance: updated, events } = doExecuteTransition(
      instance,
      blueprint,
      transition,
      actor,
      now,
      comment,
    );
    return ok(appendEvents(updated, events), events);
  },

  /** Check whether the current stage can advance (all required activities done + rules pass). */
  canAdvance(
    instance: ProcessInstance,
    blueprint: ProcessBlueprint,
    transitionId: string,
    actor: Actor,
  ): CanAdvanceResult {
    const stageDef = stageDefFor(blueprint, instance.currentStageId);
    const allTransitions: TransitionDefinition[] = [
      ...(stageDef?.transitions ?? []),
      ...(blueprint.globalTransitions ?? []),
    ];
    const transition = allTransitions.find((t) => t.id === transitionId);
    if (!transition) return { ok: false, blockers: [] };

    const check = checkTransitionAllowed(instance, blueprint, transition, actor);
    return {
      ok: check.allowed,
      blockers: check.failedValidations,
    };
  },

  /** Return the transitions available to this actor from the current state. */
  getAvailableTransitions(
    instance: ProcessInstance,
    blueprint: ProcessBlueprint,
    actor: Actor,
  ): TransitionDefinition[] {
    const stageDef = stageDefFor(blueprint, instance.currentStageId);
    const allTransitions: TransitionDefinition[] = [
      ...(stageDef?.transitions ?? []),
      ...(blueprint.globalTransitions ?? []),
    ];
    return allTransitions.filter((t) => {
      // Hide if actor lacks the required permission
      if (t.requiredPermission && !actor.permissions.has(t.requiredPermission)) return false;
      // Hide if the FSM rejects this transition type from the current state
      if (!canTransition(instance.estado, t.type)) return false;
      // Show even when validation rules block — the UI surfaces the blockers
      return true;
    });
  },
};
