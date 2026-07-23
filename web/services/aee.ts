import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  AEEExecution,
  AEEExecutionHistory,
  AEECatalogo,
  AEEDashboard,
  AEEMisActividades,
  AEEStatus,
  AEECreateParams,
} from "@/types/aee";

const AEE_WS = "aee";

// ── Ejecuciones ───────────────────────────────────────────────────────────────

export async function listAEEEjecuciones(
  params?: Record<string, unknown>,
): Promise<AEEExecution[]> {
  const client = getAppsScriptClient();
  return client.call<AEEExecution[]>("aee.listEjecuciones", { wsId: AEE_WS, ...params });
}

export async function getAEEEjecucion(id: string): Promise<AEEExecution> {
  const client = getAppsScriptClient();
  return client.call<AEEExecution>("aee.getEjecucion", { id });
}

export async function createAEEEjecucion(
  payload: AEECreateParams,
): Promise<AEEExecution> {
  const client = getAppsScriptClient();
  return client.call<AEEExecution>("aee.createEjecucion", { wsId: AEE_WS, ...payload });
}

export async function updateAEEEjecucion(
  id: string,
  patch: Partial<AEEExecution>,
): Promise<AEEExecution> {
  const client = getAppsScriptClient();
  return client.call<AEEExecution>("aee.updateEjecucion", { id, ...patch });
}

export async function cambiarEstadoAEE(
  id: string,
  status: AEEStatus,
  userId?: string,
): Promise<AEEExecution> {
  const client = getAppsScriptClient();
  return client.call<AEEExecution>("aee.cambiarEstado", {
    id,
    status,
    userId: userId ?? "",
  });
}

export async function archivarAEEEjecucion(
  id: string,
  userId?: string,
): Promise<AEEExecution> {
  const client = getAppsScriptClient();
  return client.call<AEEExecution>("aee.archivarEjecucion", {
    id,
    userId: userId ?? "",
  });
}

// ── Mis actividades ────────────────────────────────────────────────────────────

export async function getAEEMisActividades(
  executedBy: string,
  params?: Record<string, unknown>,
): Promise<AEEMisActividades> {
  const client = getAppsScriptClient();
  return client.call<AEEMisActividades>("aee.getMisActividades", {
    executedBy,
    ...params,
  });
}

// ── Catálogos ─────────────────────────────────────────────────────────────────

export async function listAEECatalogos(
  tipo?: "resultadoEjecucion" | "nivelRiesgo",
): Promise<{ total: number; items: AEECatalogo[]; isDefault?: boolean }> {
  const client = getAppsScriptClient();
  return client.call("aee.listCatalogos", {
    wsId: AEE_WS,
    ...(tipo ? { tipo } : {}),
  });
}

export async function createAEECatalogo(
  payload: Partial<AEECatalogo>,
): Promise<AEECatalogo> {
  const client = getAppsScriptClient();
  return client.call<AEECatalogo>("aee.createCatalogo", { wsId: AEE_WS, ...payload });
}

export async function updateAEECatalogo(
  id: string,
  patch: Partial<AEECatalogo>,
): Promise<AEECatalogo> {
  const client = getAppsScriptClient();
  return client.call<AEECatalogo>("aee.updateCatalogo", { id, ...patch });
}

// ── Historial ──────────────────────────────────────────────────────────────────

export async function getAEEHistorial(
  ejecucionId?: string,
): Promise<AEEExecutionHistory[]> {
  const client = getAppsScriptClient();
  return client.call<AEEExecutionHistory[]>("aee.getHistorial", {
    wsId: AEE_WS,
    ...(ejecucionId ? { ejecucionId } : {}),
  });
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export async function getAEEDashboard(): Promise<AEEDashboard> {
  const client = getAppsScriptClient();
  return client.call<AEEDashboard>("aee.getDashboard", { wsId: AEE_WS });
}
