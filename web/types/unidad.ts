export interface UnidadConfig {
  id: string;
  nombre: string;
  codigo: string;
  color: string;
  sheetsId?: string;
  driveId?: string;
  carpetas?: {
    indicadores?: string;
    evidencias?: string;
    reportes?: string;
    planesMejora?: string;
  };
  periodicidad: "mensual" | "trimestral";
  activo: boolean;
}

export const UNIDADES: UnidadConfig[] = [
  {
    id: "vraf",
    nombre: "Vicerrectoría Administrativa y Financiera",
    codigo: "VRAF",
    color: "#2563EB",
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "rrhh",
    nombre: "Recursos Humanos",
    codigo: "RRHH",
    color: "#7C3AED",
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "conta",
    nombre: "Unidad de Contabilidad",
    codigo: "CONTA",
    color: "#059669",
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "compras",
    nombre: "Unidad de Compras y Almacén",
    codigo: "COMPRAS",
    color: "#D97706",
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "mant",
    nombre: "Unidad de Mantenimiento",
    codigo: "MANT",
    color: "#DC2626",
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "salud",
    nombre: "Comité de Salud y Seguridad Ocupacional",
    codigo: "SALUD",
    color: "#0891B2",
    periodicidad: "mensual",
    activo: true,
  },
];

export function getUnidad(id: string): UnidadConfig | undefined {
  return UNIDADES.find((u) => u.id === id);
}

export function getUnidadColor(id: string): string {
  return getUnidad(id)?.color ?? "#2563EB";
}
