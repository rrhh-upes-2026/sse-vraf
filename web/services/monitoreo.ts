/**
 * Monitoreo service — SSE-VRAF monitoring platform.
 * Fetches indicator and evidence data from Google Apps Script.
 * No mock fallback — GAS is the single source of truth.
 */

// ─── Public types ─────────────────────────────────────────────────────────────

export interface IndicadorMonitoreo {
  id: string;
  nombre: string;
  descripcion: string;
  formula: string;
  meta: number;
  resultado: number | null;
  unidad: "%" | "días" | "#" | "$" | "h";
  porcentaje: number | null;
  semaforo: "verde" | "amarillo" | "rojo" | "gris";
  tendencia: "sube" | "baja" | "estable";
  responsable: string;
  periodicidad: "mensual" | "trimestral" | "semestral" | "anual";
  ultimaActualizacion: string;
  historial: { periodo: string; valor: number; meta: number }[];
  wsId: string;
}

export interface ArchivoEvidencia {
  id: string;
  nombre: string;
  tipo: string;
  tamaño?: number;
  fechaModificacion: string;
  driveId: string;
  driveUrl: string;
}

export interface MesEvidencia {
  id: string;
  nombre: string;
  mes: number;
  anio: number;
  driveId: string;
  driveUrl: string;
  archivos: ArchivoEvidencia[];
  total: number;
}

export interface IndicadorEvidencia {
  id: string;
  nombre: string;
  driveId: string;
  driveUrl: string;
  meses: MesEvidencia[];
  totalArchivos: number;
}

export interface AreaEvidencia {
  id: string;
  nombre: string;
  driveId: string;
  driveUrl: string;
  indicadores: IndicadorEvidencia[];
}

export interface EvidenciaHierarchy {
  wsId: string;
  nombre: string;
  carpetaId: string | null;
  carpetaUrl: string | null;
  areas: AreaEvidencia[];
  total: number;
  fetchedAt: string;
  mensaje?: string;
}

export interface UnidadConfig {
  id: string;
  gasWsId: string;
  nombre: string;
  codigo: string;
  color: string;
  periodicidad: "mensual" | "trimestral";
  activo: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function calcularPorcentaje(resultado: number, meta: number): number {
  if (meta === 0) return 0;
  return Math.min(Math.round((resultado / meta) * 100), 200);
}

export function calcularSemaforo(pct: number): "verde" | "amarillo" | "rojo" {
  if (pct >= 80) return "verde";
  if (pct >= 60) return "amarillo";
  return "rojo";
}

// ─── Unit configuration ───────────────────────────────────────────────────────

export const UNIDADES: UnidadConfig[] = [
  { id: "vraf",    gasWsId: "1-vicerrectoria-administrativa-y-financiera", nombre: "Vicerrectoría Administrativa y Financiera", codigo: "VRAF", color: "#2563EB", periodicidad: "mensual", activo: true },
  { id: "conta",   gasWsId: "2-contabilidad",                              nombre: "Unidad de Contabilidad",                    codigo: "CONT", color: "#059669", periodicidad: "mensual", activo: true },
  { id: "rrhh",    gasWsId: "3-recursos-humanos",                          nombre: "Unidad de Recursos Humanos",                codigo: "RH",   color: "#7C3AED", periodicidad: "mensual", activo: true },
  { id: "mant",    gasWsId: "4-mantenimiento-e-infraestructura",           nombre: "Unidad de Mantenimiento",                   codigo: "MANT", color: "#DC2626", periodicidad: "mensual", activo: true },
  { id: "compras", gasWsId: "5-compras-y-almacen",                        nombre: "Unidad de Compras y Almacén",                codigo: "COMP", color: "#D97706", periodicidad: "mensual", activo: true },
  { id: "salud",   gasWsId: "6-comite-de-seguridad-y-salud-ocupacional",  nombre: "Comité de Salud y Seguridad Ocupacional",   codigo: "SSO",  color: "#0891B2", periodicidad: "mensual", activo: true },
];

export function getUnidad(wsId: string): UnidadConfig | undefined {
  return UNIDADES.find((u) => u.id === wsId);
}

// ─── GAS response types ───────────────────────────────────────────────────────

interface GasIndicador {
  codigo: string;
  nombre: string;
  meta: number | null;
  resultado: number | null;
  unidad: string;
  responsable: string;
  periodicidad: string;
  fecha: string;
  observacion: string;
  formula: string;
  porcentaje: number | null;
  semaforo: string;
  tendencia: string;
  historial: { fecha: string; resultado: number }[];
}

interface GasIndicadoresResponse {
  wsId: string;
  nombre: string;
  sheetId: string;
  indicadores: GasIndicador[];
  total: number;
  fetchedAt: string;
  error?: boolean;
  message?: string;
}

interface GasArchivoEv {
  id: string;
  nombre: string;
  mime: string;
  tipoLabel: string;
  url: string;
  tamano: number;
  creadoEn: string;
  modificadoEn: string;
}

interface GasMesEv {
  id: string;
  nombre: string;
  mes: number;
  anio: number;
  driveId: string;
  driveUrl: string;
  archivos: GasArchivoEv[];
  total: number;
}

interface GasIndicadorEv {
  id: string;
  nombre: string;
  driveId: string;
  driveUrl: string;
  meses: GasMesEv[];
  totalArchivos: number;
}

interface GasAreaEv {
  id: string;
  nombre: string;
  driveId: string;
  driveUrl: string;
  indicadores: GasIndicadorEv[];
}

interface GasEvidenciasResponse {
  wsId: string;
  nombre: string;
  carpetaId: string | null;
  carpetaUrl: string | null;
  areas: GasAreaEv[];
  total: number;
  fetchedAt: string;
  error?: boolean;
  message?: string;
  mensaje?: string;
}

// ─── Transformations ──────────────────────────────────────────────────────────

const UNIDAD_MAP: Record<string, IndicadorMonitoreo["unidad"]> = {
  "%": "%", "porcentaje": "%", "pct": "%",
  "días": "días", "dias": "días", "day": "días",
  "#": "#", "número": "#", "numero": "#", "unidades": "#",
  "$": "$", "usd": "$", "dólares": "$",
  "h": "h", "horas": "h", "hours": "h",
};

function normalizeUnidad(raw: string): IndicadorMonitoreo["unidad"] {
  const key = raw.trim().toLowerCase();
  return UNIDAD_MAP[key] ?? "%";
}

function normalizeTendencia(raw: string): IndicadorMonitoreo["tendencia"] {
  if (raw === "subiendo") return "sube";
  if (raw === "bajando")  return "baja";
  return "estable";
}

function normalizePeriodicidad(raw: string): IndicadorMonitoreo["periodicidad"] {
  const key = raw.trim().toLowerCase();
  if (key.includes("trimest")) return "trimestral";
  if (key.includes("semest"))  return "semestral";
  if (key.includes("anual") || key.includes("annual")) return "anual";
  return "mensual";
}

function normalizeSemaforo(raw: string): IndicadorMonitoreo["semaforo"] {
  if (raw === "verde" || raw === "amarillo" || raw === "rojo") return raw;
  return "gris";
}

function transformIndicador(gas: GasIndicador, wsId: string): IndicadorMonitoreo {
  return {
    id:                 gas.codigo || gas.nombre,
    nombre:             gas.nombre,
    descripcion:        gas.observacion || "",
    formula:            gas.formula || "",
    meta:               gas.meta ?? 0,
    resultado:          gas.resultado,
    unidad:             normalizeUnidad(gas.unidad),
    porcentaje:         gas.porcentaje,
    semaforo:           normalizeSemaforo(gas.semaforo),
    tendencia:          normalizeTendencia(gas.tendencia),
    responsable:        gas.responsable || "",
    periodicidad:       normalizePeriodicidad(gas.periodicidad),
    ultimaActualizacion: gas.fecha || new Date().toISOString().split("T")[0],
    historial:          (gas.historial ?? []).map((h) => ({
      periodo: h.fecha,
      valor:   h.resultado,
      meta:    gas.meta ?? 0,
    })),
    wsId,
  };
}

function transformArchivoEv(a: GasArchivoEv): ArchivoEvidencia {
  return {
    id:               a.id,
    nombre:           a.nombre,
    tipo:             a.tipoLabel,
    tamaño:           a.tamano,
    fechaModificacion: a.modificadoEn,
    driveId:          a.id,
    driveUrl:         a.url,
  };
}

function transformEvidenciasHierarchy(gas: GasEvidenciasResponse): EvidenciaHierarchy {
  return {
    wsId:       gas.wsId,
    nombre:     gas.nombre,
    carpetaId:  gas.carpetaId,
    carpetaUrl: gas.carpetaUrl,
    areas:      (gas.areas ?? []).map((area) => ({
      id:       area.id,
      nombre:   area.nombre,
      driveId:  area.driveId,
      driveUrl: area.driveUrl,
      indicadores: (area.indicadores ?? []).map((ind) => ({
        id:            ind.id,
        nombre:        ind.nombre,
        driveId:       ind.driveId,
        driveUrl:      ind.driveUrl,
        totalArchivos: ind.totalArchivos ?? 0,
        meses: (ind.meses ?? []).map((mes) => ({
          id:       mes.id,
          nombre:   mes.nombre,
          mes:      mes.mes,
          anio:     mes.anio,
          driveId:  mes.driveId,
          driveUrl: mes.driveUrl,
          total:    mes.total,
          archivos: (mes.archivos ?? []).map(transformArchivoEv),
        })),
      })),
    })),
    total:      gas.total ?? 0,
    fetchedAt:  gas.fetchedAt,
    mensaje:    gas.mensaje,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns indicators for a workspace unit, fetched from Google Apps Script.
 * Throws on network or GAS errors — never returns stale mock data.
 */
export async function getIndicadores(wsId: string): Promise<IndicadorMonitoreo[]> {
  const unit = getUnidad(wsId);
  if (!unit) throw new Error(`Unidad desconocida: ${wsId}`);

  const gasUrl = process.env.APPS_SCRIPT_WEB_APP_URL;
  if (!gasUrl) throw new Error("APPS_SCRIPT_WEB_APP_URL no está configurado.");

  const url = `${gasUrl}?action=indicadores&wsId=${encodeURIComponent(unit.gasWsId)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`No fue posible obtener la información de Google Workspace. (HTTP ${res.status})`);
  }

  const data = await res.json() as GasIndicadoresResponse;

  if (data.error) {
    throw new Error(data.message ?? "Error en Google Apps Script.");
  }

  return (data.indicadores ?? []).map((ind) => transformIndicador(ind, wsId));
}

/**
 * Returns the 3-level evidence hierarchy for a workspace unit.
 * Structure: Unit → Areas → Indicator folders → Monthly folders → Files
 * Throws on network or GAS errors — never returns stale mock data.
 */
export async function getEvidencias(wsId: string): Promise<EvidenciaHierarchy> {
  const unit = getUnidad(wsId);
  if (!unit) throw new Error(`Unidad desconocida: ${wsId}`);

  const gasUrl = process.env.APPS_SCRIPT_WEB_APP_URL;
  if (!gasUrl) throw new Error("APPS_SCRIPT_WEB_APP_URL no está configurado.");

  const url = `${gasUrl}?action=evidencias&wsId=${encodeURIComponent(unit.gasWsId)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`No fue posible obtener la información de Google Workspace. (HTTP ${res.status})`);
  }

  const data = await res.json() as GasEvidenciasResponse;

  if (data.error) {
    throw new Error(data.message ?? "Error en Google Apps Script.");
  }

  return transformEvidenciasHierarchy(data);
}
