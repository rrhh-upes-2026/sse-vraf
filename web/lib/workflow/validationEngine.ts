import type {
  ValidationRule,
  ValidationResult,
  StageInstance,
  ProcessInstance,
  Actor,
} from "@/types/workflow";

export function evaluateRule(
  rule: ValidationRule,
  stage: StageInstance,
  instance: ProcessInstance,
  actor: Actor,
): ValidationResult {
  switch (rule.type) {
    case "min_evidence": {
      const done = stage.activities.filter(
        (a) => a.type === "evidence" && a.estado === "completada",
      ).length;
      const passed = done >= rule.count;
      return {
        ruleId: rule.id,
        ruleLabel: rule.label,
        passed,
        message: passed
          ? undefined
          : `Se requieren al menos ${rule.count} evidencia(s). Adjuntadas: ${done}.`,
      };
    }

    case "mandatory_form": {
      const activity = stage.activities.find(
        (a) => a.type === "form" && a.formId === rule.formId,
      );
      const passed = activity?.estado === "completada" && !!activity.formSubmission;
      return {
        ruleId: rule.id,
        ruleLabel: rule.label,
        passed,
        message: passed ? undefined : "El formulario requerido debe ser completado antes de continuar.",
      };
    }

    case "required_approval": {
      const passed = stage.activities.some(
        (a) => a.type === "approval" && a.estado === "completada",
      );
      return {
        ruleId: rule.id,
        ruleLabel: rule.label,
        passed,
        message: passed
          ? undefined
          : `Se requiere una aprobación (rol: ${rule.roleCode}) para continuar.`,
      };
    }

    case "previous_stage_completed": {
      const prev = instance.stages.find((s) => s.defId === rule.stageId);
      const passed = prev?.estado === "completada";
      return {
        ruleId: rule.id,
        ruleLabel: rule.label,
        passed,
        message: passed
          ? undefined
          : `La etapa previa "${prev?.label ?? rule.stageId}" debe estar completada.`,
      };
    }

    case "permission_required": {
      const passed = actor.permissions.has(rule.permission);
      return {
        ruleId: rule.id,
        ruleLabel: rule.label,
        passed,
        message: passed
          ? undefined
          : `Su rol no tiene el permiso requerido: ${rule.permission}.`,
      };
    }
  }
}

export function evaluateRules(
  rules: ValidationRule[],
  stage: StageInstance,
  instance: ProcessInstance,
  actor: Actor,
): ValidationResult[] {
  return rules.map((r) => evaluateRule(r, stage, instance, actor));
}

export function allPassed(results: ValidationResult[]): boolean {
  return results.every((r) => r.passed);
}

export function failedRules(results: ValidationResult[]): ValidationResult[] {
  return results.filter((r) => !r.passed);
}
