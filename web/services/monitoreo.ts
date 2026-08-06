/**
 * Monitoreo service — SSE-VRAF monitoring platform.
 * Provides getIndicadores and getEvidencias with mock data fallback.
 * When environment variables for Google integrations are present,
 * data is fetched from the corresponding API routes.
 */

// ─── Inline types (mirror of the monitoring-specific interfaces) ─────────────

export interface IndicadorMonitoreo {
  id: string;
  nombre: string;
  descripcion: string;
  meta: number;
  resultado: number;
  unidad: "%" | "días" | "#" | "$" | "h";
  porcentaje: number;
  semaforo: "verde" | "amarillo" | "rojo";
  tendencia: "sube" | "baja" | "estable";
  responsable: string;
  periodicidad: "mensual" | "trimestral" | "semestral" | "anual";
  ultimaActualizacion: string;
  historial: { periodo: string; valor: number; meta: number }[];
  wsId: string;
}

export interface EvidenciaMonitoreo {
  id: string;
  nombre: string;
  tipo: string;
  tamaño?: number;
  fechaModificacion: string;
  carpeta: string;
  driveId: string;
  driveUrl: string;
  responsable?: string;
  wsId: string;
}

export interface CarpetaEvidencia {
  id: string;
  nombre: string;
  driveId: string;
  cantidad: number;
  ultimaModificacion?: string;
  archivos?: EvidenciaMonitoreo[];
}

export interface UnidadConfig {
  id: string;
  nombre: string;
  codigo: string;
  color: string;
  sheetsId?: string;
  driveId?: string;
  periodicidad: "mensual" | "trimestral";
  activo: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  { id: "vraf",    nombre: "VRAF",              codigo: "VRAF", color: "#2563EB", periodicidad: "mensual", activo: true },
  { id: "rrhh",    nombre: "Recursos Humanos",  codigo: "RH",   color: "#7C3AED", periodicidad: "mensual", activo: true },
  { id: "conta",   nombre: "Contabilidad",      codigo: "CONT", color: "#059669", periodicidad: "mensual", activo: true },
  { id: "compras", nombre: "Compras",            codigo: "COMP", color: "#D97706", periodicidad: "mensual", activo: true },
  { id: "mant",    nombre: "Mantenimiento",      codigo: "MANT", color: "#DC2626", periodicidad: "mensual", activo: true },
  { id: "salud",   nombre: "Salud SSO",          codigo: "SSO",  color: "#0891B2", periodicidad: "mensual", activo: true },
];

export function getUnidad(wsId: string): UnidadConfig | undefined {
  return UNIDADES.find((u) => u.id === wsId);
}

// ─── Mock historial helper ────────────────────────────────────────────────────

const MESES = ["Ene 2026", "Feb 2026", "Mar 2026", "Abr 2026", "May 2026", "Jun 2026"];

function historial(
  meta: number,
  resultado: number,
  variance = 0.06,
): { periodo: string; valor: number; meta: number }[] {
  return MESES.map((periodo, i) => {
    // Progress gently toward resultado, with slight noise
    const progress = resultado * (0.8 + (i / MESES.length) * 0.25);
    const noise = 1 + (Math.random() * 2 - 1) * variance;
    const valor = Math.round(progress * noise * 10) / 10;
    return { periodo, valor, meta };
  });
}

// ─── Mock indicators ──────────────────────────────────────────────────────────

const MOCK_INDICADORES: Record<string, IndicadorMonitoreo[]> = {
  // ── VRAF ──────────────────────────────────────────────────────────────────
  vraf: [
    {
      id: "KPI-VRAF-001",
      nombre: "Ejecución Presupuestaria",
      descripcion: "Porcentaje del presupuesto institucional ejecutado sobre el total aprobado.",
      meta: 85,
      resultado: 78,
      unidad: "%",
      porcentaje: calcularPorcentaje(78, 85),
      semaforo: calcularSemaforo(calcularPorcentaje(78, 85)),
      tendencia: "sube",
      responsable: "Dirección Financiera",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(85, 78),
      wsId: "vraf",
    },
    {
      id: "KPI-VRAF-002",
      nombre: "Contratos Activos",
      descripcion: "Número de contratos institucionales vigentes y en seguimiento.",
      meta: 100,
      resultado: 96,
      unidad: "#",
      porcentaje: calcularPorcentaje(96, 100),
      semaforo: calcularSemaforo(calcularPorcentaje(96, 100)),
      tendencia: "estable",
      responsable: "Unidad de Contratos",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(100, 96, 0.04),
      wsId: "vraf",
    },
    {
      id: "KPI-VRAF-003",
      nombre: "Eficiencia Operativa",
      descripcion: "Porcentaje de procesos internos completados dentro del plazo establecido.",
      meta: 90,
      resultado: 88,
      unidad: "%",
      porcentaje: calcularPorcentaje(88, 90),
      semaforo: calcularSemaforo(calcularPorcentaje(88, 90)),
      tendencia: "estable",
      responsable: "Coordinación VRAF",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(90, 88, 0.04),
      wsId: "vraf",
    },
    {
      id: "KPI-VRAF-004",
      nombre: "Transparencia Financiera",
      descripcion: "Porcentaje de informes financieros publicados según normativa de transparencia.",
      meta: 95,
      resultado: 91,
      unidad: "%",
      porcentaje: calcularPorcentaje(91, 95),
      semaforo: calcularSemaforo(calcularPorcentaje(91, 95)),
      tendencia: "sube",
      responsable: "Auditoría Interna",
      periodicidad: "trimestral",
      ultimaActualizacion: "2026-06-30",
      historial: historial(95, 91, 0.05),
      wsId: "vraf",
    },
    {
      id: "KPI-VRAF-005",
      nombre: "Auditorías Completadas",
      descripcion: "Número de auditorías internas completadas en el año.",
      meta: 4,
      resultado: 3,
      unidad: "#",
      porcentaje: calcularPorcentaje(3, 4),
      semaforo: calcularSemaforo(calcularPorcentaje(3, 4)),
      tendencia: "estable",
      responsable: "Auditoría Interna",
      periodicidad: "semestral",
      ultimaActualizacion: "2026-06-30",
      historial: historial(4, 3, 0.08),
      wsId: "vraf",
    },
  ],

  // ── RRHH ──────────────────────────────────────────────────────────────────
  rrhh: [
    {
      id: "KPI-RH-001",
      nombre: "Contratos Vigentes",
      descripcion: "Número de contratos de personal activos y debidamente formalizados.",
      meta: 150,
      resultado: 147,
      unidad: "#",
      porcentaje: calcularPorcentaje(147, 150),
      semaforo: calcularSemaforo(calcularPorcentaje(147, 150)),
      tendencia: "estable",
      responsable: "Jefatura de RRHH",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(150, 147, 0.02),
      wsId: "rrhh",
    },
    {
      id: "KPI-RH-002",
      nombre: "Capacitaciones Realizadas",
      descripcion: "Número de jornadas de capacitación ejecutadas conforme al plan anual.",
      meta: 24,
      resultado: 18,
      unidad: "#",
      porcentaje: calcularPorcentaje(18, 24),
      semaforo: calcularSemaforo(calcularPorcentaje(18, 24)),
      tendencia: "sube",
      responsable: "Coordinador de Capacitación",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(24, 18, 0.07),
      wsId: "rrhh",
    },
    {
      id: "KPI-RH-003",
      nombre: "Evaluaciones de Desempeño",
      descripcion: "Porcentaje de evaluaciones de desempeño completadas en el período.",
      meta: 100,
      resultado: 72,
      unidad: "%",
      porcentaje: calcularPorcentaje(72, 100),
      semaforo: calcularSemaforo(calcularPorcentaje(72, 100)),
      tendencia: "sube",
      responsable: "Jefatura de RRHH",
      periodicidad: "semestral",
      ultimaActualizacion: "2026-06-30",
      historial: historial(100, 72, 0.08),
      wsId: "rrhh",
    },
    {
      id: "KPI-RH-004",
      nombre: "Rotación de Personal",
      descripcion: "Porcentaje de rotación voluntaria del personal. Indicador inverso: meta es el límite máximo.",
      meta: 5,
      resultado: 8,
      unidad: "%",
      // Inverse: higher resultado is worse; porcentaje reflects penalty
      porcentaje: calcularPorcentaje(5, 8),
      semaforo: "rojo",
      tendencia: "baja",
      responsable: "Jefatura de RRHH",
      periodicidad: "trimestral",
      ultimaActualizacion: "2026-06-30",
      historial: historial(5, 8, 0.1),
      wsId: "rrhh",
    },
    {
      id: "KPI-RH-005",
      nombre: "Solicitudes Atendidas",
      descripcion: "Porcentaje de solicitudes de personal atendidas dentro del plazo comprometido.",
      meta: 95,
      resultado: 91,
      unidad: "%",
      porcentaje: calcularPorcentaje(91, 95),
      semaforo: calcularSemaforo(calcularPorcentaje(91, 95)),
      tendencia: "estable",
      responsable: "Coordinador Operativo RRHH",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(95, 91, 0.04),
      wsId: "rrhh",
    },
  ],

  // ── CONTABILIDAD ──────────────────────────────────────────────────────────
  conta: [
    {
      id: "KPI-CONT-001",
      nombre: "Estados Financieros",
      descripcion: "Número de estados financieros mensuales generados y presentados en el año.",
      meta: 12,
      resultado: 8,
      unidad: "#",
      porcentaje: calcularPorcentaje(8, 12),
      semaforo: calcularSemaforo(calcularPorcentaje(8, 12)),
      tendencia: "sube",
      responsable: "Contador General",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(12, 8, 0.05),
      wsId: "conta",
    },
    {
      id: "KPI-CONT-002",
      nombre: "Conciliaciones Bancarias",
      descripcion: "Porcentaje de cuentas bancarias conciliadas correctamente en el período.",
      meta: 100,
      resultado: 98,
      unidad: "%",
      porcentaje: calcularPorcentaje(98, 100),
      semaforo: calcularSemaforo(calcularPorcentaje(98, 100)),
      tendencia: "estable",
      responsable: "Especialista Contable",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(100, 98, 0.02),
      wsId: "conta",
    },
    {
      id: "KPI-CONT-003",
      nombre: "Cierre Mensual en Plazo",
      descripcion: "Porcentaje de cierres contables mensuales completados dentro del plazo normativo.",
      meta: 100,
      resultado: 83,
      unidad: "%",
      porcentaje: calcularPorcentaje(83, 100),
      semaforo: calcularSemaforo(calcularPorcentaje(83, 100)),
      tendencia: "sube",
      responsable: "Contador General",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(100, 83, 0.07),
      wsId: "conta",
    },
    {
      id: "KPI-CONT-004",
      nombre: "Auditorías sin Observaciones",
      descripcion: "Porcentaje de auditorías externas concluidas sin observaciones materiales.",
      meta: 90,
      resultado: 85,
      unidad: "%",
      porcentaje: calcularPorcentaje(85, 90),
      semaforo: calcularSemaforo(calcularPorcentaje(85, 90)),
      tendencia: "estable",
      responsable: "Auditoría Interna",
      periodicidad: "semestral",
      ultimaActualizacion: "2026-06-30",
      historial: historial(90, 85, 0.05),
      wsId: "conta",
    },
  ],

  // ── COMPRAS ───────────────────────────────────────────────────────────────
  compras: [
    {
      id: "KPI-COMP-001",
      nombre: "Órdenes de Compra Procesadas",
      descripcion: "Número total de órdenes de compra procesadas y aprobadas en el período.",
      meta: 200,
      resultado: 185,
      unidad: "#",
      porcentaje: calcularPorcentaje(185, 200),
      semaforo: calcularSemaforo(calcularPorcentaje(185, 200)),
      tendencia: "sube",
      responsable: "Jefe de Compras",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(200, 185, 0.06),
      wsId: "compras",
    },
    {
      id: "KPI-COMP-002",
      nombre: "Proveedores Activos",
      descripcion: "Número de proveedores habilitados y con contratos vigentes en el registro institucional.",
      meta: 50,
      resultado: 45,
      unidad: "#",
      porcentaje: calcularPorcentaje(45, 50),
      semaforo: calcularSemaforo(calcularPorcentaje(45, 50)),
      tendencia: "estable",
      responsable: "Coordinador de Proveedores",
      periodicidad: "trimestral",
      ultimaActualizacion: "2026-06-30",
      historial: historial(50, 45, 0.04),
      wsId: "compras",
    },
    {
      id: "KPI-COMP-003",
      nombre: "Tiempo Promedio de Compra",
      descripcion: "Promedio de días entre solicitud y recepción del bien o servicio. Indicador inverso: menor es mejor.",
      meta: 10,
      resultado: 14,
      unidad: "días",
      // Inverse: resultado > meta is worse
      porcentaje: calcularPorcentaje(10, 14),
      semaforo: "rojo",
      tendencia: "baja",
      responsable: "Jefe de Compras",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(10, 14, 0.08),
      wsId: "compras",
    },
    {
      id: "KPI-COMP-004",
      nombre: "Ahorro en Adquisiciones",
      descripcion: "Porcentaje de ahorro logrado respecto al presupuesto inicial de compras mediante negociación.",
      meta: 15,
      resultado: 8,
      unidad: "%",
      porcentaje: calcularPorcentaje(8, 15),
      semaforo: "rojo",
      tendencia: "sube",
      responsable: "Jefe de Compras",
      periodicidad: "trimestral",
      ultimaActualizacion: "2026-06-30",
      historial: historial(15, 8, 0.1),
      wsId: "compras",
    },
  ],

  // ── MANTENIMIENTO ─────────────────────────────────────────────────────────
  mant: [
    {
      id: "KPI-MANT-001",
      nombre: "Órdenes de Trabajo Completadas",
      descripcion: "Porcentaje de órdenes de trabajo de mantenimiento completadas en el período.",
      meta: 100,
      resultado: 88,
      unidad: "%",
      porcentaje: calcularPorcentaje(88, 100),
      semaforo: calcularSemaforo(calcularPorcentaje(88, 100)),
      tendencia: "sube",
      responsable: "Jefe de Mantenimiento",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(100, 88, 0.06),
      wsId: "mant",
    },
    {
      id: "KPI-MANT-002",
      nombre: "Tiempo de Respuesta",
      descripcion: "Promedio de horas entre reporte de avería y atención efectiva. Indicador inverso: menor es mejor.",
      meta: 24,
      resultado: 36,
      unidad: "h",
      porcentaje: calcularPorcentaje(24, 36),
      semaforo: "amarillo",
      tendencia: "baja",
      responsable: "Coordinador de Mantenimiento",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(24, 36, 0.09),
      wsId: "mant",
    },
    {
      id: "KPI-MANT-003",
      nombre: "Activos Funcionales",
      descripcion: "Porcentaje de activos institucionales en condición operativa y sin fallas pendientes.",
      meta: 98,
      resultado: 94,
      unidad: "%",
      porcentaje: calcularPorcentaje(94, 98),
      semaforo: calcularSemaforo(calcularPorcentaje(94, 98)),
      tendencia: "estable",
      responsable: "Jefe de Mantenimiento",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(98, 94, 0.03),
      wsId: "mant",
    },
    {
      id: "KPI-MANT-004",
      nombre: "Mantenimientos Preventivos",
      descripcion: "Número de mantenimientos preventivos ejecutados conforme al plan anual.",
      meta: 20,
      resultado: 12,
      unidad: "#",
      porcentaje: calcularPorcentaje(12, 20),
      semaforo: "rojo",
      tendencia: "sube",
      responsable: "Técnico de Mantenimiento",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(20, 12, 0.1),
      wsId: "mant",
    },
  ],

  // ── SALUD SSO ─────────────────────────────────────────────────────────────
  salud: [
    {
      id: "KPI-SSO-001",
      nombre: "Capacitaciones SSO",
      descripcion: "Número de capacitaciones en Seguridad y Salud Ocupacional realizadas en el año.",
      meta: 12,
      resultado: 10,
      unidad: "#",
      porcentaje: calcularPorcentaje(10, 12),
      semaforo: calcularSemaforo(calcularPorcentaje(10, 12)),
      tendencia: "sube",
      responsable: "Oficial de SSO",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(12, 10, 0.06),
      wsId: "salud",
    },
    {
      id: "KPI-SSO-002",
      nombre: "Inspecciones Realizadas",
      descripcion: "Número de inspecciones de seguridad ocupacional ejecutadas en instalaciones.",
      meta: 24,
      resultado: 22,
      unidad: "#",
      porcentaje: calcularPorcentaje(22, 24),
      semaforo: calcularSemaforo(calcularPorcentaje(22, 24)),
      tendencia: "estable",
      responsable: "Inspector SSO",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(24, 22, 0.04),
      wsId: "salud",
    },
    {
      id: "KPI-SSO-003",
      nombre: "EPP Entregado",
      descripcion: "Porcentaje de personal que recibió su equipo de protección personal conforme al plan.",
      meta: 100,
      resultado: 95,
      unidad: "%",
      porcentaje: calcularPorcentaje(95, 100),
      semaforo: calcularSemaforo(calcularPorcentaje(95, 100)),
      tendencia: "sube",
      responsable: "Almacén / SSO",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: historial(100, 95, 0.03),
      wsId: "salud",
    },
    {
      id: "KPI-SSO-004",
      nombre: "Incidentes Laborales",
      descripcion: "Número de incidentes o accidentes laborales registrados. La meta es cero incidentes.",
      meta: 0,
      resultado: 3,
      unidad: "#",
      // Special: any value above 0 is red
      porcentaje: 0,
      semaforo: "rojo",
      tendencia: "baja",
      responsable: "Oficial de SSO",
      periodicidad: "mensual",
      ultimaActualizacion: "2026-06-30",
      historial: MESES.map((periodo, i) => ({ periodo, valor: i < 3 ? 1 : 0, meta: 0 })),
      wsId: "salud",
    },
    {
      id: "KPI-SSO-005",
      nombre: "Planes de Mejora SSO",
      descripcion: "Número de planes de mejora en seguridad ocupacional implementados en el período.",
      meta: 8,
      resultado: 5,
      unidad: "#",
      porcentaje: calcularPorcentaje(5, 8),
      semaforo: "amarillo",
      tendencia: "sube",
      responsable: "Oficial de SSO",
      periodicidad: "trimestral",
      ultimaActualizacion: "2026-06-30",
      historial: historial(8, 5, 0.08),
      wsId: "salud",
    },
  ],
};

// ─── Mock evidence folders ─────────────────────────────────────────────────

const MOCK_EVIDENCIAS: Record<string, CarpetaEvidencia[]> = {
  vraf: [
    { id: "FOLD-VRAF-001", nombre: "Informes Financieros",         driveId: "mock-drive-vraf-01", cantidad: 12, ultimaModificacion: "2026-06-28" },
    { id: "FOLD-VRAF-002", nombre: "Contratos Institucionales",    driveId: "mock-drive-vraf-02", cantidad: 34, ultimaModificacion: "2026-06-25" },
    { id: "FOLD-VRAF-003", nombre: "Auditorías y Dictámenes",      driveId: "mock-drive-vraf-03", cantidad: 8,  ultimaModificacion: "2026-06-10" },
    { id: "FOLD-VRAF-004", nombre: "Resoluciones Administrativas", driveId: "mock-drive-vraf-04", cantidad: 21, ultimaModificacion: "2026-06-20" },
    { id: "FOLD-VRAF-005", nombre: "Presupuesto y Ejecución",      driveId: "mock-drive-vraf-05", cantidad: 15, ultimaModificacion: "2026-06-30" },
  ],
  rrhh: [
    { id: "FOLD-RH-001", nombre: "Expedientes de Personal",       driveId: "mock-drive-rrhh-01", cantidad: 148, ultimaModificacion: "2026-06-29" },
    { id: "FOLD-RH-002", nombre: "Contratos de Trabajo",          driveId: "mock-drive-rrhh-02", cantidad: 147, ultimaModificacion: "2026-06-27" },
    { id: "FOLD-RH-003", nombre: "Capacitaciones y Diplomas",     driveId: "mock-drive-rrhh-03", cantidad: 54,  ultimaModificacion: "2026-06-15" },
    { id: "FOLD-RH-004", nombre: "Evaluaciones de Desempeño",     driveId: "mock-drive-rrhh-04", cantidad: 72,  ultimaModificacion: "2026-06-30" },
    { id: "FOLD-RH-005", nombre: "Acciones de Personal",          driveId: "mock-drive-rrhh-05", cantidad: 19,  ultimaModificacion: "2026-06-22" },
  ],
  conta: [
    { id: "FOLD-CONT-001", nombre: "Estados Financieros",          driveId: "mock-drive-conta-01", cantidad: 8,  ultimaModificacion: "2026-06-30" },
    { id: "FOLD-CONT-002", nombre: "Conciliaciones Bancarias",     driveId: "mock-drive-conta-02", cantidad: 24, ultimaModificacion: "2026-06-28" },
    { id: "FOLD-CONT-003", nombre: "Comprobantes y Vouchers",      driveId: "mock-drive-conta-03", cantidad: 312, ultimaModificacion: "2026-06-30" },
    { id: "FOLD-CONT-004", nombre: "Planillas y Liquidaciones",    driveId: "mock-drive-conta-04", cantidad: 18, ultimaModificacion: "2026-06-25" },
    { id: "FOLD-CONT-005", nombre: "Informes de Auditoría",        driveId: "mock-drive-conta-05", cantidad: 6,  ultimaModificacion: "2026-05-15" },
  ],
  compras: [
    { id: "FOLD-COMP-001", nombre: "Órdenes de Compra",            driveId: "mock-drive-comp-01", cantidad: 185, ultimaModificacion: "2026-06-30" },
    { id: "FOLD-COMP-002", nombre: "Cotizaciones y Ofertas",       driveId: "mock-drive-comp-02", cantidad: 423, ultimaModificacion: "2026-06-29" },
    { id: "FOLD-COMP-003", nombre: "Contratos de Proveedores",     driveId: "mock-drive-comp-03", cantidad: 45,  ultimaModificacion: "2026-06-20" },
    { id: "FOLD-COMP-004", nombre: "Actas de Recepción",           driveId: "mock-drive-comp-04", cantidad: 167, ultimaModificacion: "2026-06-28" },
    { id: "FOLD-COMP-005", nombre: "Licitaciones y Concursos",     driveId: "mock-drive-comp-05", cantidad: 12,  ultimaModificacion: "2026-06-01" },
  ],
  mant: [
    { id: "FOLD-MANT-001", nombre: "Órdenes de Trabajo",           driveId: "mock-drive-mant-01", cantidad: 88,  ultimaModificacion: "2026-06-30" },
    { id: "FOLD-MANT-002", nombre: "Inventario de Activos",        driveId: "mock-drive-mant-02", cantidad: 5,   ultimaModificacion: "2026-05-31" },
    { id: "FOLD-MANT-003", nombre: "Mantenimientos Preventivos",   driveId: "mock-drive-mant-03", cantidad: 24,  ultimaModificacion: "2026-06-25" },
    { id: "FOLD-MANT-004", nombre: "Informes Técnicos",            driveId: "mock-drive-mant-04", cantidad: 32,  ultimaModificacion: "2026-06-22" },
    { id: "FOLD-MANT-005", nombre: "Garantías y Manuales",         driveId: "mock-drive-mant-05", cantidad: 67,  ultimaModificacion: "2026-03-10" },
  ],
  salud: [
    { id: "FOLD-SSO-001", nombre: "Planes SSO",                    driveId: "mock-drive-sso-01", cantidad: 5,  ultimaModificacion: "2026-06-01" },
    { id: "FOLD-SSO-002", nombre: "Registros de Capacitación SSO", driveId: "mock-drive-sso-02", cantidad: 30, ultimaModificacion: "2026-06-15" },
    { id: "FOLD-SSO-003", nombre: "Inspecciones de Seguridad",     driveId: "mock-drive-sso-03", cantidad: 22, ultimaModificacion: "2026-06-28" },
    { id: "FOLD-SSO-004", nombre: "Registros de Incidentes",       driveId: "mock-drive-sso-04", cantidad: 3,  ultimaModificacion: "2026-06-18" },
    { id: "FOLD-SSO-005", nombre: "Entrega de EPP",                driveId: "mock-drive-sso-05", cantidad: 148, ultimaModificacion: "2026-06-10" },
  ],
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns indicators for a workspace unit.
 * Falls back to mock data when GOOGLE_SHEETS_ID_{WSID} env var is absent.
 */
export async function getIndicadores(wsId: string): Promise<IndicadorMonitoreo[]> {
  const envKey = `GOOGLE_SHEETS_ID_${wsId.toUpperCase()}`;
  const sheetsId = process.env[envKey];

  if (sheetsId) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/google/sheets?wsId=${wsId}`, {
      next: { revalidate: 300 }, // 5 min ISR
    });
    if (!res.ok) {
      console.error(`[monitoreo] Sheets fetch failed for ${wsId}: ${res.status}`);
      return MOCK_INDICADORES[wsId] ?? [];
    }
    return res.json() as Promise<IndicadorMonitoreo[]>;
  }

  return MOCK_INDICADORES[wsId] ?? [];
}

/**
 * Returns evidence folders for a workspace unit.
 * Falls back to mock data when GOOGLE_DRIVE_ID_{WSID} env var is absent.
 */
export async function getEvidencias(wsId: string): Promise<CarpetaEvidencia[]> {
  const envKey = `GOOGLE_DRIVE_ID_${wsId.toUpperCase()}`;
  const driveId = process.env[envKey];

  if (driveId) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/google/drive?wsId=${wsId}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`[monitoreo] Drive fetch failed for ${wsId}: ${res.status}`);
      return MOCK_EVIDENCIAS[wsId] ?? [];
    }
    return res.json() as Promise<CarpetaEvidencia[]>;
  }

  return MOCK_EVIDENCIAS[wsId] ?? [];
}
