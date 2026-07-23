import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  CPESnapshot,
  CPEPlanMejora,
  CPEHistorial,
  CPECatalogo,
  CPECatalogoTipo,
  CPEBrecha,
  CPEDashboard,
  CPECalcularParams,
  CPECreatePlanParams,
  CPEUpdatePlanParams,
} from "@/types/cpe";

const CPE_WS = "cpe";

// ── Cálculo ───────────────────────────────────────────────────────────────────

export async function calcularCPECumplimiento(
  params: CPECalcularParams,
): Promise<CPESnapshot> {
  const client = getAppsScriptClient();
  return client.call<CPESnapshot>("cpe.calcularCumplimiento", { ...params, wsId: CPE_WS });
}

export async function getCPESnapshot(id: string): Promise<CPESnapshot> {
  const client = getAppsScriptClient();
  return client.call<CPESnapshot>("cpe.getSnapshot", { id });
}

export async function listCPESnapshots(
  params?: Record<string, unknown>,
): Promise<{ total: number; items: CPESnapshot[] }> {
  const client = getAppsScriptClient();
  return client.call("cpe.listSnapshots", { wsId: CPE_WS, ...params });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getCPEDashboard(
  year?: number,
): Promise<CPEDashboard> {
  const client = getAppsScriptClient();
  return client.call<CPEDashboard>("cpe.getDashboard", {
    wsId: CPE_WS,
    ...(year ? { year } : {}),
  });
}

// ── Brechas ───────────────────────────────────────────────────────────────────

export async function getCPEBrechas(year?: number): Promise<CPEBrecha[]> {
  const client = getAppsScriptClient();
  return client.call<CPEBrecha[]>("cpe.getBrechas", {
    wsId: CPE_WS,
    ...(year ? { year } : {}),
  });
}

// ── Planes de Mejora ──────────────────────────────────────────────────────────

export async function listCPEPlanesMejora(
  params?: Record<string, unknown>,
): Promise<{ total: number; items: CPEPlanMejora[] }> {
  const client = getAppsScriptClient();
  return client.call("cpe.listPlanesMejora", { wsId: CPE_WS, ...params });
}

export async function getCPEPlanMejora(id: string): Promise<CPEPlanMejora> {
  const client = getAppsScriptClient();
  return client.call<CPEPlanMejora>("cpe.getPlanMejora", { id });
}

export async function createCPEPlanMejora(
  payload: CPECreatePlanParams,
): Promise<CPEPlanMejora> {
  const client = getAppsScriptClient();
  return client.call<CPEPlanMejora>("cpe.createPlanMejora", { wsId: CPE_WS, ...payload });
}

export async function updateCPEPlanMejora(
  id: string,
  patch: CPEUpdatePlanParams,
): Promise<CPEPlanMejora> {
  const client = getAppsScriptClient();
  return client.call<CPEPlanMejora>("cpe.updatePlanMejora", { id, ...patch });
}

export async function deleteCPEPlanMejora(id: string): Promise<{ success: boolean }> {
  const client = getAppsScriptClient();
  return client.call<{ success: boolean }>("cpe.deletePlanMejora", { id });
}

// ── Catálogos ─────────────────────────────────────────────────────────────────

export async function listCPECatalogos(
  tipo?: CPECatalogoTipo,
): Promise<{ total: number; items: CPECatalogo[]; isDefault?: boolean }> {
  const client = getAppsScriptClient();
  return client.call("cpe.listCatalogos", { wsId: CPE_WS, ...(tipo ? { tipo } : {}) });
}

export async function updateCPECatalogo(
  id: string,
  patch: Partial<CPECatalogo>,
): Promise<CPECatalogo> {
  const client = getAppsScriptClient();
  return client.call<CPECatalogo>("cpe.updateCatalogo", { id, ...patch });
}

// ── Historial ─────────────────────────────────────────────────────────────────

export async function getCPEHistorial(): Promise<CPEHistorial[]> {
  const client = getAppsScriptClient();
  return client.call<CPEHistorial[]>("cpe.getHistorial", { wsId: CPE_WS });
}
