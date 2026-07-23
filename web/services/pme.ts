import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  PMEProceso,
  PMEProcedimiento,
  PMEActividad,
  PMECatalogo,
  PMEHistorial,
  PMEDashboardResumen,
  PMECatalogoTipo,
} from "@/types/pme";

const PME_WS = "pme";

// ── Procesos ──────────────────────────────────────────────────────────────────

export async function listProcesos(params?: Record<string, unknown>): Promise<PMEProceso[]> {
  const client = getAppsScriptClient();
  return client.call<PMEProceso[]>("pme.listProcesos", { wsId: PME_WS, ...params });
}

export async function getProceso(id: string): Promise<PMEProceso> {
  const client = getAppsScriptClient();
  return client.call<PMEProceso>("pme.getProceso", { id });
}

export async function createProceso(payload: Partial<PMEProceso>): Promise<PMEProceso> {
  const client = getAppsScriptClient();
  return client.call<PMEProceso>("pme.createProceso", { wsId: PME_WS, ...payload });
}

export async function updateProceso(id: string, patch: Partial<PMEProceso>): Promise<PMEProceso> {
  const client = getAppsScriptClient();
  return client.call<PMEProceso>("pme.updateProceso", { id, ...patch });
}

export async function archivarProceso(id: string, userId?: string): Promise<PMEProceso> {
  const client = getAppsScriptClient();
  return client.call<PMEProceso>("pme.archivarProceso", { id, userId: userId ?? "" });
}

export async function activarProceso(id: string, userId?: string): Promise<PMEProceso> {
  const client = getAppsScriptClient();
  return client.call<PMEProceso>("pme.activarProceso", { id, userId: userId ?? "" });
}

export async function duplicarProceso(id: string, userId?: string): Promise<PMEProceso> {
  const client = getAppsScriptClient();
  return client.call<PMEProceso>("pme.duplicarProceso", { id, userId: userId ?? "" });
}

// ── Procedimientos ────────────────────────────────────────────────────────────

export async function listProcedimientos(
  params?: Record<string, unknown>,
): Promise<PMEProcedimiento[]> {
  const client = getAppsScriptClient();
  return client.call<PMEProcedimiento[]>("pme.listProcedimientos", { wsId: PME_WS, ...params });
}

export async function getProcedimiento(id: string): Promise<PMEProcedimiento> {
  const client = getAppsScriptClient();
  return client.call<PMEProcedimiento>("pme.getProcedimiento", { id });
}

export async function createProcedimiento(
  payload: Partial<PMEProcedimiento>,
): Promise<PMEProcedimiento> {
  const client = getAppsScriptClient();
  return client.call<PMEProcedimiento>("pme.createProcedimiento", { wsId: PME_WS, ...payload });
}

export async function updateProcedimiento(
  id: string,
  patch: Partial<PMEProcedimiento>,
): Promise<PMEProcedimiento> {
  const client = getAppsScriptClient();
  return client.call<PMEProcedimiento>("pme.updateProcedimiento", { id, ...patch });
}

export async function archivarProcedimiento(
  id: string,
  userId?: string,
): Promise<PMEProcedimiento> {
  const client = getAppsScriptClient();
  return client.call<PMEProcedimiento>("pme.archivarProcedimiento", {
    id,
    userId: userId ?? "",
  });
}

export async function activarProcedimiento(
  id: string,
  userId?: string,
): Promise<PMEProcedimiento> {
  const client = getAppsScriptClient();
  return client.call<PMEProcedimiento>("pme.activarProcedimiento", { id, userId: userId ?? "" });
}

export async function duplicarProcedimiento(
  id: string,
  userId?: string,
): Promise<PMEProcedimiento> {
  const client = getAppsScriptClient();
  return client.call<PMEProcedimiento>("pme.duplicarProcedimiento", {
    id,
    userId: userId ?? "",
  });
}

// ── Actividades ───────────────────────────────────────────────────────────────

export async function listActividades(params?: Record<string, unknown>): Promise<PMEActividad[]> {
  const client = getAppsScriptClient();
  return client.call<PMEActividad[]>("pme.listActividades", { wsId: PME_WS, ...params });
}

export async function getActividad(id: string): Promise<PMEActividad> {
  const client = getAppsScriptClient();
  return client.call<PMEActividad>("pme.getActividad", { id });
}

export async function createActividad(payload: Partial<PMEActividad>): Promise<PMEActividad> {
  const client = getAppsScriptClient();
  return client.call<PMEActividad>("pme.createActividad", { wsId: PME_WS, ...payload });
}

export async function updateActividad(
  id: string,
  patch: Partial<PMEActividad>,
): Promise<PMEActividad> {
  const client = getAppsScriptClient();
  return client.call<PMEActividad>("pme.updateActividad", { id, ...patch });
}

export async function archivarActividad(id: string, userId?: string): Promise<PMEActividad> {
  const client = getAppsScriptClient();
  return client.call<PMEActividad>("pme.archivarActividad", { id, userId: userId ?? "" });
}

export async function activarActividad(id: string, userId?: string): Promise<PMEActividad> {
  const client = getAppsScriptClient();
  return client.call<PMEActividad>("pme.activarActividad", { id, userId: userId ?? "" });
}

export async function duplicarActividad(id: string, userId?: string): Promise<PMEActividad> {
  const client = getAppsScriptClient();
  return client.call<PMEActividad>("pme.duplicarActividad", { id, userId: userId ?? "" });
}

// ── Catálogos ─────────────────────────────────────────────────────────────────

export async function listPMECatalogos(
  tipo?: PMECatalogoTipo,
): Promise<PMECatalogo[]> {
  const client = getAppsScriptClient();
  return client.call<PMECatalogo[]>("pme.listCatalogos", {
    wsId: PME_WS,
    ...(tipo ? { tipo } : {}),
  });
}

export async function createPMECatalogo(
  payload: Partial<PMECatalogo>,
): Promise<PMECatalogo> {
  const client = getAppsScriptClient();
  return client.call<PMECatalogo>("pme.createCatalogo", { wsId: PME_WS, ...payload });
}

export async function updatePMECatalogo(
  id: string,
  patch: Partial<PMECatalogo>,
): Promise<PMECatalogo> {
  const client = getAppsScriptClient();
  return client.call<PMECatalogo>("pme.updateCatalogo", { id, ...patch });
}

export async function archivarPMECatalogo(id: string): Promise<PMECatalogo> {
  const client = getAppsScriptClient();
  return client.call<PMECatalogo>("pme.archivarCatalogo", { id });
}

// ── Historial ─────────────────────────────────────────────────────────────────

export async function getPMEHistorial(
  entidadId: string,
  entidadTipo?: string,
): Promise<PMEHistorial[]> {
  const client = getAppsScriptClient();
  return client.call<PMEHistorial[]>("pme.getHistorial", {
    wsId: PME_WS,
    entidadId,
    ...(entidadTipo ? { entidadTipo } : {}),
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getPMEDashboard(): Promise<PMEDashboardResumen> {
  const client = getAppsScriptClient();
  return client.call<PMEDashboardResumen>("pme.getDashboard", { wsId: PME_WS });
}
