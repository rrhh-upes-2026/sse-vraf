export interface Indicador {
  id: string;
  nombre: string;
  descripcion: string;
  meta: number;
  resultado: number;
  unidad: string;
  porcentaje: number;
  semaforo: "verde" | "amarillo" | "rojo";
  tendencia: "sube" | "baja" | "estable";
  responsable: string;
  periodicidad: "mensual" | "trimestral" | "semestral" | "anual";
  ultimaActualizacion: string;
  historial: { periodo: string; valor: number; meta: number }[];
  wsId: string;
}

export type Semaforo = "verde" | "amarillo" | "rojo";
export type Tendencia = "sube" | "baja" | "estable";

export function calcularPorcentaje(resultado: number, meta: number): number {
  if (!meta) return 0;
  return Math.round((resultado / meta) * 100);
}

export function calcularSemaforo(pct: number): Semaforo {
  if (pct >= 80) return "verde";
  if (pct >= 60) return "amarillo";
  return "rojo";
}
