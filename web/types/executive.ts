// ─── KPI Types ────────────────────────────────────────────────────────────────

export type KPITipo = "numero" | "porcentaje" | "moneda" | "duracion" | "texto";
export type KPITendencia = "alza" | "baja" | "estable";
export type KPISemaforo = "verde" | "amarillo" | "rojo";
export type KPIFrecuencia = "diaria" | "semanal" | "mensual" | "trimestral" | "anual";
export type KPICategoria =
  | "personal" | "reclutamiento" | "desempeño" | "desarrollo"
  | "estrategia" | "proyectos" | "cumplimiento"
  | "compras" | "financiero" | "presupuesto" | "proveedores"
  | "contabilidad" | "activos" | "mantenimiento" | "inventario"
  | "seguridad";

export interface KPIDefinicion {
  id: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  categoria: KPICategoria | string;
  grupo: string;
  origen: string;
  adaptador: string;
  consulta: string;
  formula: string;
  tipo: KPITipo;
  meta: number;
  valorActual: number;
  valorAnterior: number;
  variacion: number;
  tendencia: KPITendencia;
  semaforo: KPISemaforo;
  inverso?: boolean;
  frecuencia: KPIFrecuencia;
  responsable: string;
  dashboard: string;
  visible: boolean;
  orden: number;
}

// ─── Dashboard Unit Types ──────────────────────────────────────────────────────

export type DashboardEstado = "ok" | "warning" | "critical";

export interface DashboardKPI {
  id: string;
  label: string;
  valor: number;
  meta: number;
  unidad: string;
  semaforo: KPISemaforo;
  tendencia: KPITendencia;
}

export interface DashboardAlerta {
  nivel: "info" | "warning" | "critical";
  mensaje: string;
  accion: string | null;
}

export interface DashboardActividad {
  fecha: string;
  descripcion: string;
  tipo: string;
}

export interface DashboardResumenFinanciero {
  egresos: number;
  saldo: number;
}

export interface DashboardIndicador {
  label: string;
  valor: string | number;
  unidad?: string;
}

export interface DashboardResumenOperativo {
  descripcion: string;
  indicadores: DashboardIndicador[];
}

export interface DashboardUnitSummary {
  unitKey: string;
  label: string;
  color: string;
  icon: string;
  estado: DashboardEstado;
  estadoRazon: string;
  kpis: DashboardKPI[];
  alertas: DashboardAlerta[];
  cumplimientoPct: number;
  resumenFinanciero: DashboardResumenFinanciero | null;
  resumenOperativo: DashboardResumenOperativo;
  actividadReciente: DashboardActividad[];
}

// ─── Consolidated Dashboard Types ─────────────────────────────────────────────

export interface AlertaInstitucional {
  unitKey: string;
  unitLabel: string;
  nivel: "critical";
  mensaje: string;
  accion: string | null;
}

export interface ActividadGlobal {
  unitKey: string;
  unitLabel: string;
  fecha: string;
  descripcion: string;
  tipo: string;
}

export interface GlobalStats {
  cumplimientoPromedio: number;
  alertasCriticasCount: number;
  resumenFinanciero: DashboardResumenFinanciero;
  unidadesOk: number;
  unidadesWarning: number;
  unidadesCritical: number;
}

export interface ExecutiveDashboardResumen {
  generadoEn: string;
  unidades: DashboardUnitSummary[];
  semaforos: Record<string, KPISemaforo>;
  alertasCriticas: AlertaInstitucional[];
  kpisGlobales: DashboardKPI[];
  actividadGlobal: ActividadGlobal[];
  globales: GlobalStats;
  errores: { unitKey: string; error: string }[];
}

// ─── Widget Prop Types ─────────────────────────────────────────────────────────

export interface ExecutiveKPICardProps {
  kpi: KPIDefinicion;
  compact?: boolean;
}

export interface ExecutiveSummaryCardProps {
  unit: DashboardUnitSummary;
  onClick?: () => void;
}

export interface TrendCardProps {
  label: string;
  valor: number;
  unidad?: string;
  tendencia: KPITendencia;
  variacion: number;
  semaforo?: KPISemaforo;
  meta?: number;
}

export interface ProgressCardProps {
  label: string;
  valor: number;
  meta: number;
  unidad?: string;
  color?: string;
  semaforo?: KPISemaforo;
}

export interface StatusCardProps {
  unitKey: string;
  label: string;
  estado: DashboardEstado;
  estadoRazon?: string;
  cumplimientoPct?: number;
  color?: string;
  icon?: string;
}

export interface AlertCardProps {
  alerta: AlertaInstitucional | DashboardAlerta;
  unitLabel?: string;
}

export interface GaugeCardProps {
  label: string;
  valor: number;
  meta: number;
  unidad?: string;
  semaforo?: KPISemaforo;
  size?: "sm" | "md" | "lg";
}

export interface RankingItem {
  label: string;
  valor: number;
  unidad?: string;
  color?: string;
  semaforo?: KPISemaforo;
}

export interface RankingCardProps {
  title: string;
  items: RankingItem[];
  maxItems?: number;
}

export interface TimelineEvent {
  fecha: string;
  descripcion: string;
  tipo: string;
  unitLabel?: string;
  unitKey?: string;
}

export interface TimelineCardProps {
  events: TimelineEvent[];
  maxItems?: number;
}

export interface HeatmapCell {
  row: string;
  col: string;
  valor: number;
  label?: string;
}

export interface HeatmapCardProps {
  title: string;
  cells: HeatmapCell[];
  rows: string[];
  cols: string[];
  colorScale?: [string, string];
}
