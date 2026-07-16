import type { ProcessBlueprint, StageDefinition, TransitionDefinition } from "@/types/workflow";
import type { ValidationReport, ValidationIssue } from "@/types/studio";

function issue(
  severity: ValidationIssue["severity"],
  code: string,
  message: string,
  path?: string,
): ValidationIssue {
  return { severity, code, message, path };
}

export function validateBlueprint(
  blueprint: ProcessBlueprint,
  now: string,
): ValidationReport {
  const issues: ValidationIssue[] = [];
  const stageIds = new Set(blueprint.stages.map((s) => s.id));

  // ── Blueprint-level checks ───────────────────────────────────────────────

  if (!blueprint.nombre?.trim()) {
    issues.push(issue("error", "BP001", "El blueprint debe tener un nombre."));
  }
  if (!blueprint.category?.trim()) {
    issues.push(issue("warning", "BP002", "El blueprint no tiene categoría definida."));
  }
  if (blueprint.stages.length === 0) {
    issues.push(issue("error", "BP003", "El blueprint debe tener al menos una etapa.", "stages"));
  }
  if (!stageIds.has(blueprint.initialStageId)) {
    issues.push(issue("error", "BP004", `initialStageId "${blueprint.initialStageId}" no existe en las etapas.`, "initialStageId"));
  }

  // ── Per-stage checks ─────────────────────────────────────────────────────

  let hasCompletionTransition = false;
  const allRuleIds = new Map<string, string>(); // ruleId → stageId

  blueprint.stages.forEach((stage: StageDefinition) => {
    const path = `stages[${stage.id}]`;

    if (!stage.nombre?.trim()) {
      issues.push(issue("error", "SG001", `Etapa "${stage.id}" no tiene nombre.`, path));
    }
    if (stage.activities.length === 0) {
      issues.push(issue("warning", "SG002", `Etapa "${stage.id}" no tiene actividades definidas.`, `${path}.activities`));
    }
    if (stage.transitions.length === 0) {
      issues.push(issue("warning", "SG003", `Etapa "${stage.id}" no tiene transiciones definidas.`, `${path}.transitions`));
    }

    // Collect all rule IDs
    stage.validationRules.forEach((r) => {
      allRuleIds.set(r.id, stage.id);
    });

    // ── Activity checks ──────────────────────────────────────────────────

    const activityIds = new Set(stage.activities.map((a) => a.id));
    stage.activities.forEach((activity) => {
      const aPath = `${path}.activities[${activity.id}]`;
      if (!activity.label?.trim()) {
        issues.push(issue("error", "AC001", `Actividad "${activity.id}" no tiene etiqueta.`, aPath));
      }
      if ((activity.type === "form" || activity.type === "evidence") && activity.type === "form" && !activity.formId) {
        issues.push(issue("warning", "AC002", `Actividad de tipo "form" "${activity.id}" no tiene formId.`, aPath));
      }
      if (activity.dependencies) {
        activity.dependencies.forEach((depId) => {
          if (!activityIds.has(depId)) {
            issues.push(issue("error", "AC003", `Actividad "${activity.id}" depende de "${depId}" que no existe en la etapa.`, aPath));
          }
        });
      }
    });

    // ── Transition checks ────────────────────────────────────────────────

    stage.transitions.forEach((transition: TransitionDefinition) => {
      const tPath = `${path}.transitions[${transition.id}]`;

      if (!transition.label?.trim()) {
        issues.push(issue("error", "TR001", `Transición "${transition.id}" no tiene etiqueta.`, tPath));
      }

      if (transition.type === "complete") {
        hasCompletionTransition = true;
        if (transition.toStageId !== null) {
          issues.push(issue("warning", "TR002", `Transición de tipo "complete" "${transition.id}" debería tener toStageId null.`, tPath));
        }
      } else if (transition.toStageId !== null) {
        if (!stageIds.has(transition.toStageId)) {
          issues.push(issue("error", "TR003", `Transición "${transition.id}" referencia etapa "${transition.toStageId}" que no existe.`, tPath));
        }
      }

      if (transition.validationRuleIds) {
        transition.validationRuleIds.forEach((ruleId) => {
          if (!allRuleIds.has(ruleId)) {
            issues.push(issue("error", "TR004", `Transición "${transition.id}" referencia regla "${ruleId}" que no existe en ninguna etapa.`, tPath));
          }
        });
      }
    });
  });

  // Check global transitions
  blueprint.globalTransitions?.forEach((transition: TransitionDefinition) => {
    const tPath = `globalTransitions[${transition.id}]`;
    if (transition.toStageId !== null && !stageIds.has(transition.toStageId)) {
      issues.push(issue("error", "TR003", `Transición global "${transition.id}" referencia etapa "${transition.toStageId}" que no existe.`, tPath));
    }
  });

  if (!hasCompletionTransition) {
    issues.push(issue("error", "BP005", 'El blueprint no tiene ninguna transición de tipo "complete". El proceso nunca podría finalizar.'));
  }

  // ── Performance hints ────────────────────────────────────────────────────

  if (blueprint.stages.length > 15) {
    issues.push(issue("info", "PF001", `El blueprint tiene ${blueprint.stages.length} etapas. Los procesos con más de 15 etapas pueden ser difíciles de administrar.`));
  }

  const totalActivities = blueprint.stages.reduce((sum, s) => sum + s.activities.length, 0);
  const totalTransitions = blueprint.stages.reduce((sum, s) => sum + s.transitions.length, 0);
  const totalForms = blueprint.stages.flatMap((s) => s.activities.filter((a) => a.type === "form" && a.formId)).length;

  const passed = !issues.some((i) => i.severity === "error");

  return {
    blueprintId: blueprint.id,
    version: blueprint.version,
    runAt: now,
    passed,
    issues,
    stats: {
      stages: blueprint.stages.length,
      activities: totalActivities,
      transitions: totalTransitions,
      validationRules: blueprint.stages.reduce((sum, s) => sum + s.validationRules.length, 0),
      forms: totalForms,
    },
  };
}
