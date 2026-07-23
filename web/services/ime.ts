import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import { createEntityService } from "./entityService";
import type {
  IMEIndicador,
  IMECatalogo,
  IMEHistorial,
  IMEDashboardResumen,
  IMECatalogoTipo,
} from "@/types/ime";

// ── Entity services ───────────────────────────────────────────────────────────

export const IndicadoresService = createEntityService<IMEIndicador>("imeIndicadores");
export const CatalogosService   = createEntityService<IMECatalogo>("imeCatalogos");

// ── Indicador domain actions ──────────────────────────────────────────────────

export async function listIndicadores(params?: Record<string, unknown>): Promise<IMEIndicador[]> {
  const client = getAppsScriptClient();
  return client.call<IMEIndicador[]>("ime.listIndicadores", { wsId: "ime", ...params });
}

export async function getIndicador(id: string): Promise<IMEIndicador> {
  const client = getAppsScriptClient();
  return client.call<IMEIndicador>("ime.getIndicador", { id });
}

export async function createIndicador(payload: Partial<IMEIndicador>): Promise<IMEIndicador> {
  const client = getAppsScriptClient();
  return client.call<IMEIndicador>("ime.createIndicador", { wsId: "ime", ...payload });
}

export async function updateIndicador(
  id: string,
  patch: Partial<IMEIndicador>,
): Promise<IMEIndicador> {
  const client = getAppsScriptClient();
  return client.call<IMEIndicador>("ime.updateIndicador", { id, ...patch });
}

export async function activarIndicador(id: string, userId?: string): Promise<IMEIndicador> {
  const client = getAppsScriptClient();
  return client.call<IMEIndicador>("ime.activarIndicador", { id, userId: userId ?? "" });
}

export async function desactivarIndicador(id: string, userId?: string): Promise<IMEIndicador> {
  const client = getAppsScriptClient();
  return client.call<IMEIndicador>("ime.desactivarIndicador", { id, userId: userId ?? "" });
}

export async function duplicarIndicador(id: string, userId?: string): Promise<IMEIndicador> {
  const client = getAppsScriptClient();
  return client.call<IMEIndicador>("ime.duplicarIndicador", { id, userId: userId ?? "" });
}

export async function getHistorial(indicadorId: string): Promise<IMEHistorial[]> {
  const client = getAppsScriptClient();
  return client.call<IMEHistorial[]>("ime.getHistorial", { indicadorId, wsId: "ime" });
}

// ── Catálogo domain actions ───────────────────────────────────────────────────

export async function listCatalogos(tipo?: IMECatalogoTipo): Promise<IMECatalogo[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: "ime" };
  if (tipo) params.tipo = tipo;
  return client.call<IMECatalogo[]>("ime.listCatalogos", params);
}

export async function createCatalogo(
  payload: Partial<IMECatalogo>,
): Promise<IMECatalogo> {
  const client = getAppsScriptClient();
  return client.call<IMECatalogo>("ime.createCatalogo", { wsId: "ime", ...payload });
}

export async function updateCatalogo(
  id: string,
  patch: Partial<IMECatalogo>,
): Promise<IMECatalogo> {
  const client = getAppsScriptClient();
  return client.call<IMECatalogo>("ime.updateCatalogo", { id, ...patch });
}

export async function archivarCatalogo(id: string): Promise<IMECatalogo> {
  const client = getAppsScriptClient();
  return client.call<IMECatalogo>("ime.archivarCatalogo", { id });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getIMEDashboard(): Promise<IMEDashboardResumen> {
  const client = getAppsScriptClient();
  return client.call<IMEDashboardResumen>("ime.getDashboard", { wsId: "ime" });
}
