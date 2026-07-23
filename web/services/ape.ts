import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  APEPlan,
  APEHistorial,
  APEDashboard,
  APEGenerateParams,
  APEGenerateResult,
  APEPreview,
  APEStatus,
} from "@/types/ape";

const APE_WS = "ape";

// ── Planes ─────────────────────────────────────────────────────────────────────

export async function listAPEPlanes(params?: Record<string, unknown>): Promise<APEPlan[]> {
  const client = getAppsScriptClient();
  return client.call<APEPlan[]>("ape.listPlanes", { wsId: APE_WS, ...params });
}

export async function getAPEPlan(id: string): Promise<APEPlan> {
  const client = getAppsScriptClient();
  return client.call<APEPlan>("ape.getPlan", { id });
}

export async function createAPEPlan(payload: Partial<APEPlan>): Promise<APEPlan> {
  const client = getAppsScriptClient();
  return client.call<APEPlan>("ape.createPlan", { wsId: APE_WS, ...payload });
}

export async function updateAPEPlan(id: string, patch: Partial<APEPlan>): Promise<APEPlan> {
  const client = getAppsScriptClient();
  return client.call<APEPlan>("ape.updatePlan", { id, ...patch });
}

export async function cambiarEstadoAPE(
  id: string,
  status: APEStatus,
  userId?: string,
): Promise<APEPlan> {
  const client = getAppsScriptClient();
  return client.call<APEPlan>("ape.cambiarEstado", { id, status, userId: userId ?? "" });
}

// ── Generación automática ──────────────────────────────────────────────────────

export async function generateAPEPlans(
  params: APEGenerateParams,
): Promise<APEGenerateResult> {
  const client = getAppsScriptClient();
  return client.call<APEGenerateResult>("ape.generatePlans", { wsId: APE_WS, ...params });
}

export async function previewAPEGeneration(
  params: APEGenerateParams,
): Promise<APEPreview> {
  const client = getAppsScriptClient();
  return client.call<APEPreview>("ape.previewGeneration", { wsId: APE_WS, ...params });
}

// ── Historial ──────────────────────────────────────────────────────────────────

export async function getAPEHistorial(planId: string): Promise<APEHistorial[]> {
  const client = getAppsScriptClient();
  return client.call<APEHistorial[]>("ape.getHistorial", { wsId: APE_WS, planId });
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export async function getAPEDashboard(year?: string): Promise<APEDashboard> {
  const client = getAppsScriptClient();
  return client.call<APEDashboard>("ape.getDashboard", { wsId: APE_WS, ...(year ? { year } : {}) });
}
