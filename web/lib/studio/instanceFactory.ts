import type { ProcessBlueprint, EngineResult, Actor } from "@/types/workflow";
import type { BlueprintMetadata, InstanceFactoryInput } from "@/types/studio";
import { WorkflowEngine } from "@/lib/workflow/workflowEngine";

let _instanceCounter = 1000;

function generateInstanceId(blueprintId: string): string {
  return `INST-${blueprintId.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6)}-${(++_instanceCounter).toString().padStart(4, "0")}`;
}

export interface FactoryResult {
  ok: boolean;
  result?: EngineResult;
  error?: string;
}

export function createInstance(
  blueprint: ProcessBlueprint,
  metadata: BlueprintMetadata,
  input: InstanceFactoryInput,
  actor: Actor,
  now: string,
): FactoryResult {
  if (metadata.status !== "published") {
    return {
      ok: false,
      error: `El blueprint "${blueprint.nombre}" no está publicado (estado: ${metadata.status}). Solo los blueprints publicados pueden generar instancias.`,
    };
  }

  if (metadata.publishedVersion !== blueprint.version) {
    return {
      ok: false,
      error: `La versión activa publicada es "${metadata.publishedVersion}", pero el blueprint proporcionado es versión "${blueprint.version}".`,
    };
  }

  const instanceId = generateInstanceId(blueprint.id);
  const result = WorkflowEngine.create(
    blueprint,
    instanceId,
    input.nombre,
    actor,
    now,
    input.contextData ?? {},
  );

  return { ok: result.ok, result, error: result.error };
}
