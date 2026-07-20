import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import { createEntityService } from "./entityService";
import type { PlanEstrategico, VRAFDashboardResumen } from "@/types/entities";

export const PlanesVRAFService = createEntityService<PlanEstrategico>("planes");

export async function getVRAFDashboardResumen(wsId = "vraf"): Promise<VRAFDashboardResumen> {
  const client = getAppsScriptClient();
  return client.call<VRAFDashboardResumen>("vraf.getDashboardResumen", { wsId });
}

export async function createPlanVRAF(
  payload: Omit<PlanEstrategico, "id" | "createdAt" | "updatedAt">,
): Promise<PlanEstrategico> {
  const client = getAppsScriptClient();
  return client.call<PlanEstrategico>("vraf.createPlan", payload);
}

export async function updatePlanVRAF(
  id: string,
  patch: Partial<PlanEstrategico>,
): Promise<PlanEstrategico> {
  const client = getAppsScriptClient();
  return client.call<PlanEstrategico>("vraf.updatePlan", { id, ...patch });
}
