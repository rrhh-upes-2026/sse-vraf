import type {
  ProcessInstance,
  ProcessBlueprint,
  TransitionDefinition,
  StageInstance,
  WorkflowEvent,
  Actor,
  ValidationResult,
} from "@/types/workflow";
import { canTransition, applyStateTransition } from "./stateMachine";
import { evaluateRules, allPassed, failedRules } from "./validationEngine";
import { startStage, completeStage, reactivateStage } from "./stageEngine";
import { makeEvent } from "./eventFactory";

export interface TransitionCheck {
  allowed: boolean;
  failedValidations: ValidationResult[];
  error?: string;
}

export function checkTransitionAllowed(
  instance: ProcessInstance,
  blueprint: ProcessBlueprint,
  transition: TransitionDefinition,
  actor: Actor,
): TransitionCheck {
  // Permission gate
  if (transition.requiredPermission && !actor.permissions.has(transition.requiredPermission)) {
    return {
      allowed: false,
      failedValidations: [],
      error: `Permiso requerido: ${transition.requiredPermission}`,
    };
  }

  // FSM gate
  if (!canTransition(instance.estado, transition.type)) {
    return {
      allowed: false,
      failedValidations: [],
      error: `Transición "${transition.type}" no permitida desde estado "${instance.estado}"`,
    };
  }

  // Validation rules gate
  if (transition.validationRuleIds?.length) {
    const currentStageDef = blueprint.stages.find((s) => s.id === instance.currentStageId);
    const currentStageInst = instance.stages.find((s) => s.defId === instance.currentStageId);

    if (currentStageDef && currentStageInst) {
      const rules = currentStageDef.validationRules.filter((r) =>
        transition.validationRuleIds!.includes(r.id),
      );
      const results = evaluateRules(rules, currentStageInst, instance, actor);
      if (!allPassed(results)) {
        return { allowed: false, failedValidations: failedRules(results) };
      }
    }
  }

  return { allowed: true, failedValidations: [] };
}

export interface TransitionResult {
  instance: ProcessInstance;
  events: WorkflowEvent[];
}

export function executeTransition(
  instance: ProcessInstance,
  blueprint: ProcessBlueprint,
  transition: TransitionDefinition,
  actor: Actor,
  now: string,
  comment?: string,
): TransitionResult {
  const events: WorkflowEvent[] = [];
  let updated = instance;

  // Complete current stage if moving to a new stage or completing the workflow
  const currentStageInst = updated.stages.find((s) => s.defId === updated.currentStageId);
  if (currentStageInst && currentStageInst.estado === "activa") {
    const completedStage = completeStage(currentStageInst, actor.id, now);
    updated = {
      ...updated,
      stages: updated.stages.map((s) =>
        s.defId === completedStage.defId ? completedStage : s,
      ),
    };
    events.push(
      makeEvent("StageCompleted", instance.id, actor, now, {
        stageId: completedStage.defId,
        stageLabel: completedStage.label,
      }),
    );
  }

  // Apply FSM state transition
  const nextState = applyStateTransition(updated.estado, transition.type);
  updated = { ...updated, estado: nextState, updatedAt: now };

  // Emit transition event
  events.push(
    makeEvent("TransitionExecuted", instance.id, actor, now, {
      transitionId: transition.id,
      transitionLabel: transition.label,
      transitionType: transition.type,
      ...(comment ? { comment } : {}),
    }),
  );

  // Advance to next stage when toStageId is set
  if (transition.toStageId) {
    const nextStageDef = blueprint.stages.find((s) => s.id === transition.toStageId);
    if (nextStageDef) {
      const nextStageInst: StageInstance | undefined = updated.stages.find(
        (s) => s.defId === transition.toStageId,
      );
      if (nextStageInst && (nextStageInst.estado === "pendiente" || nextStageInst.estado === "completada")) {
        const activatedStage = nextStageInst.estado === "completada"
          ? reactivateStage(nextStageInst, now)
          : startStage(nextStageInst, now);
        updated = {
          ...updated,
          currentStageId: transition.toStageId,
          stages: updated.stages.map((s) =>
            s.defId === activatedStage.defId ? activatedStage : s,
          ),
        };
        events.push(
          makeEvent("StageStarted", instance.id, actor, now, {
            stageId: activatedStage.defId,
            stageLabel: activatedStage.label,
          }),
        );
      }
    }
  }

  // Handle workflow terminal states
  if (nextState === "completed") {
    updated = { ...updated, completedAt: now };
    events.push(
      makeEvent("WorkflowCompleted", instance.id, actor, now, {}),
    );
  } else if (nextState === "cancelled") {
    events.push(
      makeEvent("WorkflowCancelled", instance.id, actor, now, {
        reason: comment ?? "",
      }),
    );
  } else if (nextState === "blocked") {
    events.push(
      makeEvent("WorkflowBlocked", instance.id, actor, now, {
        reason: comment ?? "",
      }),
    );
  } else if (nextState === "in_progress" && instance.estado === "waiting") {
    events.push(makeEvent("WorkflowResumed", instance.id, actor, now, {}));
  }

  return { instance: updated, events };
}
