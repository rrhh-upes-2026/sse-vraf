/**
 * Reportes service — fetches monthly report hierarchy from Google Apps Script.
 */

const GAS_URL = process.env.APPS_SCRIPT_WEB_APP_URL ?? "";

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

export interface IndicadorMencionado {
  nombre: string;
  valor?: string;
  observacion?: string;
}

export interface InformeAnalizado {
  fileId: string;
  fileName: string;
  wsId: string;
  mesNombre: string;
  mesNum: number;
  anio: number;
  analizadoEn: string;
  resumenEjecutivo: string;
  actividadesPrincipales: string[];
  logros: string[];
  desafios: string[];
  indicadoresMencionados: IndicadorMencionado[];
  recomendacionesIA: string[];
  sentimientoGeneral: "positivo" | "neutral" | "negativo";
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export async function getReportes(wsId: string): Promise<ReportesHierarchy> {
  if (!GAS_URL) throw new Error("APPS_SCRIPT_WEB_APP_URL is not configured.");
  const url = `${GAS_URL}?action=reportes&wsId=${encodeURIComponent(wsId)}`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`GAS error ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.message ?? "GAS returned an error");
  return data as ReportesHierarchy;
}
