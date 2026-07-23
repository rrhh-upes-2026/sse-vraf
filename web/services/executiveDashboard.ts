import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  ExecutiveDashboardResumen,
  KPIDefinicion,
  DashboardUnitSummary,
} from "@/types/executive";

const client = getAppsScriptClient();

export async function getExecutiveDashboard(
  wsId: string
): Promise<ExecutiveDashboardResumen> {
  return client.call<ExecutiveDashboardResumen>("ejecutivo.getDashboard", { wsId });
}

export async function getExecutiveUnitSummary(
  wsId: string,
  unitKey: string
): Promise<DashboardUnitSummary> {
  return client.call<DashboardUnitSummary>("ejecutivo.getUnitSummary", { wsId, unitKey });
}

export async function getAllKPIs(wsId: string): Promise<KPIDefinicion[]> {
  const res = await client.call<{ data: KPIDefinicion[] }>("ejecutivo.getAllKPIs", { wsId });
  return res.data ?? [];
}

export async function getKPIsByDashboard(
  wsId: string,
  dashboard = "ejecutivo"
): Promise<KPIDefinicion[]> {
  const res = await client.call<{ data: KPIDefinicion[] }>("ejecutivo.getKPIsByDashboard", { wsId, dashboard });
  return res.data ?? [];
}

export async function getKPIsByUnit(
  wsId: string,
  unitKey: string
): Promise<KPIDefinicion[]> {
  const res = await client.call<{ data: KPIDefinicion[] }>("ejecutivo.getKPIsByUnit", { wsId, unitKey });
  return res.data ?? [];
}

export async function getKPIsByCategoria(
  wsId: string,
  categoria: string
): Promise<KPIDefinicion[]> {
  const res = await client.call<{ data: KPIDefinicion[] }>("ejecutivo.getKPIsByCategoria", { wsId, categoria });
  return res.data ?? [];
}

export async function getKPIsSemaforo(
  wsId: string,
  color: "verde" | "amarillo" | "rojo"
): Promise<KPIDefinicion[]> {
  const res = await client.call<{ data: KPIDefinicion[] }>("ejecutivo.getKPIsSemaforo", { wsId, color });
  return res.data ?? [];
}
