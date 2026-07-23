import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  EMEEvidence,
  EMEEvidenceHistory,
  EMECatalogo,
  EMECatalogoTipo,
  EMEDashboard,
  EMEMisEvidencias,
  EMEStatus,
  EMECreateParams,
  EMENuevaVersionParams,
  EMEValidarParams,
} from "@/types/eme";

const EME_WS = "eme";

// ── Evidencias ────────────────────────────────────────────────────────────────

export async function listEMEEvidencias(
  params?: Record<string, unknown>,
): Promise<{ total: number; items: EMEEvidence[] }> {
  const client = getAppsScriptClient();
  return client.call("eme.listEvidencias", { wsId: EME_WS, ...params });
}

export async function getEMEEvidencia(id: string): Promise<EMEEvidence> {
  const client = getAppsScriptClient();
  return client.call<EMEEvidence>("eme.getEvidencia", { id });
}

export async function createEMEEvidencia(
  payload: EMECreateParams,
): Promise<EMEEvidence> {
  const client = getAppsScriptClient();
  return client.call<EMEEvidence>("eme.createEvidencia", { wsId: EME_WS, ...payload });
}

export async function updateEMEEvidencia(
  id: string,
  patch: Partial<EMEEvidence> & { userId?: string },
): Promise<EMEEvidence> {
  const client = getAppsScriptClient();
  return client.call<EMEEvidence>("eme.updateEvidencia", { id, ...patch });
}

export async function cambiarEstadoEME(
  id: string,
  status: EMEStatus,
  userId?: string,
): Promise<EMEEvidence> {
  const client = getAppsScriptClient();
  return client.call<EMEEvidence>("eme.cambiarEstado", { id, status, userId: userId ?? "" });
}

export async function validarEMEEvidencia(
  params: EMEValidarParams,
): Promise<EMEEvidence> {
  const client = getAppsScriptClient();
  return client.call<EMEEvidence>("eme.validarEvidencia", params as unknown as Record<string, unknown>);
}

export async function nuevaVersionEME(
  params: EMENuevaVersionParams,
): Promise<EMEEvidence> {
  const client = getAppsScriptClient();
  return client.call<EMEEvidence>("eme.nuevaVersion", params as unknown as Record<string, unknown>);
}

export async function archivarEMEEvidencia(
  id: string,
  userId?: string,
): Promise<EMEEvidence> {
  const client = getAppsScriptClient();
  return client.call<EMEEvidence>("eme.archivarEvidencia", { id, userId: userId ?? "" });
}

// ── Mis evidencias ─────────────────────────────────────────────────────────────

export async function getEMEMisEvidencias(
  uploadedBy: string,
  params?: Record<string, unknown>,
): Promise<EMEMisEvidencias> {
  const client = getAppsScriptClient();
  return client.call<EMEMisEvidencias>("eme.getMisEvidencias", { uploadedBy, ...params });
}

// ── Catálogos ──────────────────────────────────────────────────────────────────

export async function listEMECatalogos(
  tipo?: EMECatalogoTipo,
): Promise<{ total: number; items: EMECatalogo[]; isDefault?: boolean }> {
  const client = getAppsScriptClient();
  return client.call("eme.listCatalogos", { wsId: EME_WS, ...(tipo ? { tipo } : {}) });
}

export async function createEMECatalogo(
  payload: Partial<EMECatalogo>,
): Promise<EMECatalogo> {
  const client = getAppsScriptClient();
  return client.call<EMECatalogo>("eme.createCatalogo", { wsId: EME_WS, ...payload });
}

export async function updateEMECatalogo(
  id: string,
  patch: Partial<EMECatalogo>,
): Promise<EMECatalogo> {
  const client = getAppsScriptClient();
  return client.call<EMECatalogo>("eme.updateCatalogo", { id, ...patch });
}

// ── Historial ──────────────────────────────────────────────────────────────────

export async function getEMEHistorial(
  evidenciaId?: string,
): Promise<EMEEvidenceHistory[]> {
  const client = getAppsScriptClient();
  return client.call<EMEEvidenceHistory[]>("eme.getHistorial", {
    wsId: EME_WS,
    ...(evidenciaId ? { evidenciaId } : {}),
  });
}

// ── Búsqueda ───────────────────────────────────────────────────────────────────

export async function buscarEMEEvidencias(
  q: string,
): Promise<{ total: number; items: EMEEvidence[] }> {
  const client = getAppsScriptClient();
  return client.call("eme.buscarEvidencias", { wsId: EME_WS, q });
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export async function getEMEDashboard(): Promise<EMEDashboard> {
  const client = getAppsScriptClient();
  return client.call<EMEDashboard>("eme.getDashboard", { wsId: EME_WS });
}
