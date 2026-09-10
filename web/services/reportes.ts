/**
 * Reportes service — fetches monthly report hierarchy from Google Apps Script.
 */

import { getUnidad } from "@/services/monitoreo";

function gasAuthHeaders(): HeadersInit {
  const token = process.env.GAS_BEARER_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArchivoReporte {
  id: string;
  nombre: string;
  mime: string;
  tipoLabel: string;
  url: string;
  tamano: number;
  creadoEn: string;
  modificadoEn: string;
}

export interface MesReporte {
  id: string;
  nombre: string;
  mes: number;
  anio: number;
  driveId: string;
  driveUrl: string;
  archivos: ArchivoReporte[];
  total: number;
}

export interface ReportesHierarchy {
  wsId: string;
  nombre: string;
  carpetaId: string | null;
  carpetaUrl: string | null;
  meses: MesReporte[];
  total: number;
  fetchedAt: string;
  mensaje?: string;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

export async function getReportes(wsId: string): Promise<ReportesHierarchy> {
  const GAS_URL = process.env.APPS_SCRIPT_WEB_APP_URL ?? "";
  if (!GAS_URL) throw new Error("APPS_SCRIPT_WEB_APP_URL is not configured.");
  const unit = getUnidad(wsId);
  if (!unit) throw new Error(`Unidad desconocida: ${wsId}`);
  const url = `${GAS_URL}?action=reportes&wsId=${encodeURIComponent(unit.gasWsId)}`;
  const res = await fetch(url, { next: { revalidate: 600 }, headers: gasAuthHeaders() });
  if (!res.ok) throw new Error(`GAS error ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.message ?? "GAS returned an error");
  return data as ReportesHierarchy;
}
