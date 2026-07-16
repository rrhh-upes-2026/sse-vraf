import type {
  BlueprintMetadata,
  InstanceSummary,
  ImpactReport,
  ImpactDependency,
} from "@/types/studio";

const ACTIVE_STATES = new Set(["in_progress", "waiting", "blocked"]);

function computeRisk(
  activeCount: number,
  sharedCount: number,
): ImpactReport["riskLevel"] {
  if (activeCount > 5 || sharedCount > 2) return "high";
  if (activeCount > 0 || sharedCount > 0) return "medium";
  return "low";
}

function buildRecommendation(
  riskLevel: ImpactReport["riskLevel"],
  activeCount: number,
  sharedCount: number,
): string {
  if (riskLevel === "low") {
    return "Sin instancias activas ni dependencias compartidas. La publicación puede proceder de inmediato.";
  }
  const parts: string[] = [];
  if (activeCount > 0) {
    parts.push(
      `Existen ${activeCount} instancia${activeCount !== 1 ? "s" : ""} en ejecución que continúan sobre la versión anterior hasta que completen o sean reiniciadas.`,
    );
  }
  if (sharedCount > 0) {
    parts.push(
      `${sharedCount} dependencia${sharedCount !== 1 ? "s" : ""} ${sharedCount !== 1 ? "son" : "es"} compartida${sharedCount !== 1 ? "s" : ""} con otros blueprints — verificar compatibilidad antes de publicar.`,
    );
  }
  if (riskLevel === "high") {
    parts.push("Se recomienda publicar en horario de baja demanda y notificar a los responsables.");
  }
  return parts.join(" ");
}

export function computeImpact(
  blueprint: BlueprintMetadata,
  allBlueprints: BlueprintMetadata[],
  instances: InstanceSummary[],
): ImpactReport {
  const others = allBlueprints.filter((b) => b.id !== blueprint.id);

  const activeInstances = instances.filter(
    (i) => i.blueprintId === blueprint.id && ACTIVE_STATES.has(i.estado),
  );

  const sharedDependencies: ImpactDependency[] = [];

  blueprint.formIds.forEach((id) => {
    const sharedWith = others.filter((b) => b.formIds.includes(id)).map((b) => b.id);
    if (sharedWith.length > 0) sharedDependencies.push({ type: "form", id, sharedWith });
  });

  blueprint.indicatorIds.forEach((id) => {
    const sharedWith = others.filter((b) => b.indicatorIds.includes(id)).map((b) => b.id);
    if (sharedWith.length > 0) sharedDependencies.push({ type: "indicator", id, sharedWith });
  });

  blueprint.reportIds.forEach((id) => {
    const sharedWith = others.filter((b) => b.reportIds.includes(id)).map((b) => b.id);
    if (sharedWith.length > 0) sharedDependencies.push({ type: "report", id, sharedWith });
  });

  const riskLevel = computeRisk(activeInstances.length, sharedDependencies.length);

  return {
    blueprintId:        blueprint.id,
    fromVersion:        blueprint.publishedVersion ?? "—",
    toVersion:          blueprint.currentVersion,
    activeInstances:    activeInstances.length,
    affectedInstanceIds: activeInstances.map((i) => i.id),
    sharedDependencies,
    riskLevel,
    recommendation: buildRecommendation(riskLevel, activeInstances.length, sharedDependencies.length),
  };
}
