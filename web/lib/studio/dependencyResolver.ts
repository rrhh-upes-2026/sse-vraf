import type { BlueprintMetadata, BlueprintDependencyGraph, DependencyNode } from "@/types/studio";

export function buildDependencyGraph(
  blueprint: BlueprintMetadata,
  allBlueprints: BlueprintMetadata[] = [],
): BlueprintDependencyGraph {
  const others = allBlueprints.filter((b) => b.id !== blueprint.id);
  const nodes: DependencyNode[] = [];

  blueprint.formIds.forEach((id) => {
    const sharedWith = others
      .filter((b) => b.formIds.includes(id))
      .map((b) => b.id);
    nodes.push({ id, type: "form", label: id, sharedWith });
  });

  blueprint.indicatorIds.forEach((id) => {
    const sharedWith = others
      .filter((b) => b.indicatorIds.includes(id))
      .map((b) => b.id);
    nodes.push({ id, type: "indicator", label: id, sharedWith });
  });

  blueprint.reportIds.forEach((id) => {
    const sharedWith = others
      .filter((b) => b.reportIds.includes(id))
      .map((b) => b.id);
    nodes.push({ id, type: "report", label: id, sharedWith });
  });

  blueprint.permissionsRequired.forEach((id) => {
    const sharedWith = others
      .filter((b) => (b.permissionsRequired as string[]).includes(id))
      .map((b) => b.id);
    nodes.push({ id, type: "permission", label: String(id), sharedWith });
  });

  return {
    blueprintId:   blueprint.id,
    blueprintName: blueprint.nombre,
    nodes,
  };
}
