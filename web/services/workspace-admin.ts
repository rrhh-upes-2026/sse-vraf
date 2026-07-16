/**
 * Workspace Administration Suite — Mock Service Adapter.
 *
 * Follows the same adapter pattern as other services.
 * Real implementation will proxy to Apps Script via ResourceService.
 */

import type { WorkspaceId } from "@/config/nav";
import type {
  ProcessBlueprint,
  ProcedureBlueprint,
  WorkspaceKPI,
  WorkspaceObjective,
  WorkspaceProject,
  RequestType,
  FormBlueprint,
  DashboardConfig,
  WorkspaceAutomation,
  WorkspaceDocument,
  NotificationRule,
  WorkspaceSettings,
  WorkspaceTemplate,
  WorkspaceUser,
  AuditRecord,
  ObjectLifecycle,
  VersionRecord,
} from "@/types/workspace-admin";

// ── helpers ───────────────────────────────────────────────────────────────────

function makeVersion(v: number, by: string, lifecycle: ObjectLifecycle): VersionRecord {
  return {
    version: v,
    changedBy: by,
    changedAt: "2026-07-01T10:00:00Z",
    summary: v === 1 ? "Creación inicial" : `Actualización a v${v}`,
    lifecycle,
  };
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ── Process Blueprints ────────────────────────────────────────────────────────

const MOCK_BLUEPRINTS: ProcessBlueprint[] = [
  {
    id: "BP-RRHH-26-001",
    wsId: "rrhh",
    nombre: "Gestión de Contratación de Personal",
    descripcion: "Proceso para reclutar, seleccionar e incorporar nuevos empleados a la institución.",
    tipo: "misional",
    objetivo: "Incorporar talento humano calificado alineado a los requerimientos institucionales.",
    alcance: "Desde la identificación de la necesidad hasta la firma del contrato.",
    responsableRol: "HEAD",
    slaDias: 30,
    prioridad: "alta",
    frecuencia: "puntual",
    indicadorIds: ["KPI-RRHH-001"],
    evidenciasRequeridas: ["Solicitud de plaza", "Expediente del candidato", "Contrato firmado"],
    formIds: ["FORM-RRHH-001-v1"],
    lifecycle: "published",
    version: 2,
    publishedVersion: 2,
    runtimeBlueprintId: "RBP-RRHH-26-001",
    history: [makeVersion(1, "admin@upes.edu.sv", "archived"), makeVersion(2, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
    deletedAt: null,
  },
  {
    id: "BP-RRHH-26-002",
    wsId: "rrhh",
    nombre: "Evaluación del Desempeño Anual",
    descripcion: "Proceso de evaluación del desempeño del personal docente y administrativo.",
    tipo: "estrategico",
    objetivo: "Medir y mejorar el desempeño institucional mediante evaluaciones periódicas.",
    alcance: "Todo el personal de planta con más de 6 meses de antigüedad.",
    responsableRol: "ANALYST",
    slaDias: 60,
    prioridad: "alta",
    frecuencia: "anual",
    indicadorIds: ["KPI-RRHH-002"],
    evidenciasRequeridas: ["Instrumento de evaluación", "Autoevaluación", "Informe final"],
    formIds: ["FORM-RRHH-002-v1"],
    lifecycle: "published",
    version: 1,
    publishedVersion: 1,
    runtimeBlueprintId: "RBP-RRHH-26-002",
    history: [makeVersion(1, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-06-15T14:00:00Z",
    deletedAt: null,
  },
  {
    id: "BP-RRHH-26-003",
    wsId: "rrhh",
    nombre: "Gestión de Capacitaciones y Formación",
    descripcion: "Planificación, ejecución y evaluación de programas de capacitación institucional.",
    tipo: "apoyo",
    objetivo: "Fortalecer las competencias del personal mediante formación continua.",
    alcance: "Todo el personal activo de la institución.",
    responsableRol: "ANALYST",
    slaDias: 90,
    prioridad: "media",
    frecuencia: "trimestral",
    indicadorIds: ["KPI-RRHH-003"],
    evidenciasRequeridas: ["Plan de capacitación", "Lista de asistencia", "Evaluación de satisfacción"],
    formIds: [],
    lifecycle: "draft",
    version: 1,
    history: [makeVersion(1, "analista@upes.edu.sv", "draft")],
    createdBy: "analista@upes.edu.sv",
    createdAt: "2026-07-10T11:00:00Z",
    updatedAt: "2026-07-10T11:00:00Z",
    deletedAt: null,
  },
  {
    id: "BP-VRAF-26-001",
    wsId: "vraf",
    nombre: "Gestión Presupuestaria Institucional",
    descripcion: "Proceso de planificación, formulación, ejecución y control del presupuesto.",
    tipo: "estrategico",
    objetivo: "Garantizar el uso eficiente y transparente de los recursos financieros.",
    alcance: "Todas las unidades académicas y administrativas.",
    responsableRol: "HEAD",
    slaDias: 45,
    prioridad: "critica",
    frecuencia: "anual",
    indicadorIds: ["KPI-VRAF-001"],
    evidenciasRequeridas: ["Propuesta presupuestaria", "Resolución de aprobación", "Informe de ejecución"],
    formIds: [],
    lifecycle: "published",
    version: 3,
    publishedVersion: 3,
    runtimeBlueprintId: "RBP-VRAF-26-001",
    history: [
      makeVersion(1, "admin@upes.edu.sv", "archived"),
      makeVersion(2, "admin@upes.edu.sv", "archived"),
      makeVersion(3, "admin@upes.edu.sv", "published"),
    ],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-07-01T08:00:00Z",
    deletedAt: null,
  },
];

// ── KPIs ─────────────────────────────────────────────────────────────────────

const MOCK_KPIS: WorkspaceKPI[] = [
  {
    id: "KPI-RRHH-001",
    wsId: "rrhh",
    nombre: "Tiempo Promedio de Contratación",
    descripcion: "Días hábiles promedio desde apertura de plaza hasta firma de contrato.",
    categoria: "eficiencia",
    formula: "SUM(días_contratación) / COUNT(contrataciones_cerradas)",
    unidadMedida: "días hábiles",
    meta: 25,
    tolerancia: 20,
    frecuencia: "mensual",
    fuenteDatos: "Sistema de Contratación RRHH",
    responsableRol: "HEAD",
    visualizacion: "gauge",
    semaforo: {
      verde: { min: 0, max: 25 },
      amarillo: { min: 25, max: 35 },
      rojo: { min: 35, max: 999 },
    },
    dashboardDestino: "DASH-RRHH-001",
    valorActual: 28,
    tendencia: "baja",
    historico: [
      { fecha: "2026-04-01", valor: 35, semaforo: "rojo" },
      { fecha: "2026-05-01", valor: 31, semaforo: "amarillo" },
      { fecha: "2026-06-01", valor: 28, semaforo: "amarillo" },
      { fecha: "2026-07-01", valor: 28, semaforo: "amarillo" },
    ],
    lifecycle: "published",
    version: 1,
    history: [makeVersion(1, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "KPI-RRHH-002",
    wsId: "rrhh",
    nombre: "Cobertura de Evaluación de Desempeño",
    descripcion: "Porcentaje de empleados evaluados en el ciclo anual.",
    categoria: "gestion",
    formula: "(empleados_evaluados / empleados_elegibles) * 100",
    unidadMedida: "%",
    meta: 95,
    tolerancia: 10,
    frecuencia: "anual",
    fuenteDatos: "Módulo de Evaluaciones RRHH",
    responsableRol: "ANALYST",
    visualizacion: "gauge",
    semaforo: {
      verde: { min: 90, max: 100 },
      amarillo: { min: 75, max: 90 },
      rojo: { min: 0, max: 75 },
    },
    dashboardDestino: "DASH-RRHH-001",
    valorActual: 88,
    tendencia: "sube",
    historico: [
      { fecha: "2025-07-01", valor: 82, semaforo: "amarillo" },
      { fecha: "2026-07-01", valor: 88, semaforo: "amarillo" },
    ],
    lifecycle: "published",
    version: 1,
    history: [makeVersion(1, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "KPI-RRHH-003",
    wsId: "rrhh",
    nombre: "Horas de Capacitación per Cápita",
    descripcion: "Promedio de horas de capacitación recibidas por empleado en el período.",
    categoria: "desempeno",
    formula: "total_horas_capacitacion / total_empleados",
    unidadMedida: "horas",
    meta: 40,
    tolerancia: 25,
    frecuencia: "anual",
    fuenteDatos: "Módulo de Capacitaciones RRHH",
    responsableRol: "ANALYST",
    visualizacion: "bar",
    semaforo: {
      verde: { min: 35, max: 999 },
      amarillo: { min: 20, max: 35 },
      rojo: { min: 0, max: 20 },
    },
    dashboardDestino: "DASH-RRHH-001",
    valorActual: 32,
    tendencia: "sube",
    historico: [
      { fecha: "2025-07-01", valor: 24, semaforo: "amarillo" },
      { fecha: "2026-07-01", valor: 32, semaforo: "amarillo" },
    ],
    lifecycle: "draft",
    version: 1,
    history: [makeVersion(1, "analista@upes.edu.sv", "draft")],
    createdBy: "analista@upes.edu.sv",
    createdAt: "2026-07-10T11:00:00Z",
    updatedAt: "2026-07-10T11:00:00Z",
  },
];

// ── Request Types ─────────────────────────────────────────────────────────────

const MOCK_REQUEST_TYPES: RequestType[] = [
  {
    id: "REQ-RRHH-001",
    wsId: "rrhh",
    nombre: "Solicitud de Permiso Personal",
    descripcion: "Solicitud de permiso con o sin goce de sueldo hasta 3 días hábiles.",
    categoria: "Permisos y Ausencias",
    icon: "M8 7V3m8 4V3m-9 4h10M5 11h14M5 19h14a2 2 0 002-2v-5H3v5a2 2 0 002 2z",
    formFields: [
      { id: "f1", tipo: "fecha", etiqueta: "Fecha de inicio", requerido: true, orden: 1 },
      { id: "f2", tipo: "fecha", etiqueta: "Fecha de fin", requerido: true, orden: 2 },
      { id: "f3", tipo: "select", etiqueta: "Tipo de permiso", requerido: true, opciones: ["Con goce de sueldo", "Sin goce de sueldo", "Por enfermedad"], orden: 3 },
      { id: "f4", tipo: "textarea", etiqueta: "Motivo", requerido: true, orden: 4 },
    ],
    approvalSteps: [
      { id: "a1", nombre: "Aprobación de Jefatura", responsableRol: "HEAD", slaDias: 2, tipo: "simple", notifyOnApprove: true, notifyOnReject: true, orden: 1 },
      { id: "a2", nombre: "Registro RRHH", responsableRol: "ANALYST", slaDias: 1, tipo: "simple", notifyOnApprove: true, notifyOnReject: false, orden: 2 },
    ],
    slaDias: 3,
    responsableRol: "ANALYST",
    evidenciasRequeridas: [],
    notificaciones: { alCrear: true, alAprobar: true, alRechazar: true, alCerrar: true, alVencerSLA: true },
    permisosCrear: ["OPS", "ANALYST", "HEAD", "ADMIN"],
    permisosAprobar: ["HEAD", "ADMIN"],
    lifecycle: "published",
    version: 1,
    history: [makeVersion(1, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-01T08:00:00Z",
  },
  {
    id: "REQ-RRHH-002",
    wsId: "rrhh",
    nombre: "Solicitud de Vacaciones",
    descripcion: "Solicitud de vacaciones anuales de acuerdo al Código de Trabajo.",
    categoria: "Permisos y Ausencias",
    icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707",
    formFields: [
      { id: "f1", tipo: "fecha", etiqueta: "Fecha de inicio de vacaciones", requerido: true, orden: 1 },
      { id: "f2", tipo: "numero", etiqueta: "Días solicitados", requerido: true, orden: 2 },
      { id: "f3", tipo: "textarea", etiqueta: "Observaciones", requerido: false, orden: 3 },
    ],
    approvalSteps: [
      { id: "a1", nombre: "Aprobación de Jefatura", responsableRol: "HEAD", slaDias: 5, tipo: "simple", notifyOnApprove: true, notifyOnReject: true, orden: 1 },
      { id: "a2", nombre: "Verificación de saldo", responsableRol: "ANALYST", slaDias: 2, tipo: "simple", notifyOnApprove: true, notifyOnReject: true, orden: 2 },
    ],
    slaDias: 7,
    responsableRol: "ANALYST",
    evidenciasRequeridas: [],
    notificaciones: { alCrear: true, alAprobar: true, alRechazar: true, alCerrar: true, alVencerSLA: true },
    permisosCrear: ["OPS", "ANALYST", "HEAD", "ADMIN"],
    permisosAprobar: ["HEAD", "ADMIN"],
    lifecycle: "published",
    version: 2,
    history: [makeVersion(1, "admin@upes.edu.sv", "archived"), makeVersion(2, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "REQ-RRHH-003",
    wsId: "rrhh",
    nombre: "Solicitud de Constancia Laboral",
    descripcion: "Emisión de constancia de trabajo para uso personal o institucional.",
    categoria: "Documentos y Certificaciones",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    formFields: [
      { id: "f1", tipo: "select", etiqueta: "Tipo de constancia", requerido: true, opciones: ["Empleo y salario", "Cargo y antigüedad", "Solo empleo"], orden: 1 },
      { id: "f2", tipo: "texto", etiqueta: "Institución destinataria", requerido: true, orden: 2 },
      { id: "f3", tipo: "texto", etiqueta: "Propósito", requerido: false, orden: 3 },
    ],
    approvalSteps: [
      { id: "a1", nombre: "Emisión por RRHH", responsableRol: "ANALYST", slaDias: 2, tipo: "simple", notifyOnApprove: true, notifyOnReject: false, orden: 1 },
    ],
    slaDias: 2,
    responsableRol: "ANALYST",
    evidenciasRequeridas: [],
    notificaciones: { alCrear: true, alAprobar: true, alRechazar: false, alCerrar: true, alVencerSLA: true },
    permisosCrear: ["OPS", "ANALYST", "HEAD", "ADMIN"],
    permisosAprobar: ["ANALYST", "HEAD", "ADMIN"],
    lifecycle: "draft",
    version: 1,
    history: [makeVersion(1, "analista@upes.edu.sv", "draft")],
    createdBy: "analista@upes.edu.sv",
    createdAt: "2026-07-12T09:00:00Z",
    updatedAt: "2026-07-12T09:00:00Z",
  },
];

// ── Automations ───────────────────────────────────────────────────────────────

const MOCK_AUTOMATIONS: WorkspaceAutomation[] = [
  {
    id: "AUTO-RRHH-001",
    wsId: "rrhh",
    nombre: "Alerta de SLA de Contratación",
    descripcion: "Notifica al jefe de RRHH cuando un proceso de contratación está a 3 días de vencer su SLA.",
    trigger: "sla.warning",
    triggerConfig: { days_before: 3, entity_type: "proceso" },
    conditions: [{ field: "blueprintId", operator: "equals", value: "BP-RRHH-26-001" }],
    conditionLogic: "AND",
    actions: [
      {
        id: "ac1",
        tipo: "send_notification",
        config: { roles: ["HEAD"], canal: "both", asunto: "Alerta SLA: Contratación próxima a vencer", mensaje: "El proceso {{nombre}} vence en 3 días hábiles." },
        orden: 1,
      },
    ],
    active: true,
    executionCount: 12,
    lastExecutedAt: "2026-07-14T08:00:00Z",
    lastStatus: "success",
    recentExecutions: [
      { id: "ex1", automationId: "AUTO-RRHH-001", triggeredAt: "2026-07-14T08:00:00Z", status: "success", actionsExecuted: 1 },
      { id: "ex2", automationId: "AUTO-RRHH-001", triggeredAt: "2026-07-07T08:00:00Z", status: "success", actionsExecuted: 1 },
    ],
    lifecycle: "published",
    version: 1,
    history: [makeVersion(1, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-01T08:00:00Z",
  },
  {
    id: "AUTO-RRHH-002",
    wsId: "rrhh",
    nombre: "Notificación de Nueva Solicitud",
    descripcion: "Notifica al responsable cuando se crea una nueva solicitud de permiso o vacaciones.",
    trigger: "request.created",
    conditions: [
      { field: "requestTypeId", operator: "contains", value: "REQ-RRHH" },
    ],
    conditionLogic: "AND",
    actions: [
      {
        id: "ac1",
        tipo: "send_notification",
        config: { roles: ["HEAD", "ANALYST"], canal: "in_app", asunto: "Nueva solicitud recibida", mensaje: "{{solicitante}} envió una solicitud de {{tipo}}." },
        orden: 1,
      },
      {
        id: "ac2",
        tipo: "create_audit_record",
        config: { accion: "solicitud.creada" },
        orden: 2,
      },
    ],
    active: true,
    executionCount: 47,
    lastExecutedAt: "2026-07-15T09:30:00Z",
    lastStatus: "success",
    recentExecutions: [
      { id: "ex1", automationId: "AUTO-RRHH-002", triggeredAt: "2026-07-15T09:30:00Z", status: "success", actionsExecuted: 2 },
      { id: "ex2", automationId: "AUTO-RRHH-002", triggeredAt: "2026-07-14T14:00:00Z", status: "success", actionsExecuted: 2 },
      { id: "ex3", automationId: "AUTO-RRHH-002", triggeredAt: "2026-07-14T11:00:00Z", status: "failed", actionsExecuted: 1, errorMessage: "Rol HEAD sin destinatario activo" },
    ],
    lifecycle: "published",
    version: 1,
    history: [makeVersion(1, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-01T08:00:00Z",
  },
  {
    id: "AUTO-RRHH-003",
    wsId: "rrhh",
    nombre: "Reporte Mensual de Indicadores",
    descripcion: "Genera automáticamente el reporte mensual de KPIs de RRHH el primer día de cada mes.",
    trigger: "date.reached",
    triggerConfig: { cron: "0 6 1 * *" },
    conditions: [],
    conditionLogic: "AND",
    actions: [
      {
        id: "ac1",
        tipo: "generate_report",
        config: { reportTemplateId: "REP-RRHH-001", destinatarios: ["HEAD", "ADMIN"] },
        orden: 1,
      },
    ],
    active: false,
    executionCount: 3,
    lastExecutedAt: "2026-07-01T06:00:00Z",
    lastStatus: "success",
    recentExecutions: [
      { id: "ex1", automationId: "AUTO-RRHH-003", triggeredAt: "2026-07-01T06:00:00Z", status: "success", actionsExecuted: 1 },
    ],
    lifecycle: "draft",
    version: 1,
    history: [makeVersion(1, "admin@upes.edu.sv", "draft")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-15T10:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
];

// ── Users ─────────────────────────────────────────────────────────────────────

const MOCK_USERS: WorkspaceUser[] = [
  {
    id: "USR-RRHH-001",
    wsId: "rrhh",
    nombre: "Lic. María José Hernández",
    email: "mhernandez@upes.edu.sv",
    rol: "HEAD",
    activo: true,
    lastLoginAt: "2026-07-15T08:00:00Z",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-07-01T08:00:00Z",
  },
  {
    id: "USR-RRHH-002",
    wsId: "rrhh",
    nombre: "Ing. Carlos Ramírez",
    email: "cramirez@upes.edu.sv",
    rol: "ANALYST",
    activo: true,
    lastLoginAt: "2026-07-14T16:30:00Z",
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-07-01T08:00:00Z",
  },
  {
    id: "USR-RRHH-003",
    wsId: "rrhh",
    nombre: "Licda. Ana Beatriz Flores",
    email: "aflores@upes.edu.sv",
    rol: "OPS",
    activo: true,
    lastLoginAt: "2026-07-15T09:15:00Z",
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-07-01T08:00:00Z",
  },
  {
    id: "USR-RRHH-004",
    wsId: "rrhh",
    nombre: "Lic. Roberto Castro",
    email: "rcastro@upes.edu.sv",
    rol: "AUDIT",
    activo: false,
    lastLoginAt: "2026-06-20T11:00:00Z",
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-07-10T08:00:00Z",
  },
  {
    id: "USR-RRHH-005",
    wsId: "rrhh",
    nombre: "Admin Plataforma",
    email: "admin@upes.edu.sv",
    rol: "ADMIN",
    activo: true,
    lastLoginAt: "2026-07-15T08:30:00Z",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-01T08:00:00Z",
  },
];

// ── Settings ──────────────────────────────────────────────────────────────────

const MOCK_SETTINGS: Record<WorkspaceId, WorkspaceSettings> = {
  rrhh: {
    wsId: "rrhh",
    nombre: "Recursos Humanos",
    nombreCorto: "RRHH",
    descripcion: "Unidad encargada de la gestión del talento humano institucional.",
    responsableId: "USR-RRHH-001",
    color: "#E54D4D",
    colorFondo: "#FEF0F0",
    icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
    slaDiasDefault: 5,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    defaultDashboardId: "DASH-RRHH-001",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  vraf: {
    wsId: "vraf",
    nombre: "Vicerrectoría Administrativa y Financiera",
    nombreCorto: "VRAF",
    descripcion: "Unidad responsable de la administración financiera y de servicios institucionales.",
    responsableId: "USR-VRAF-001",
    color: "#2E6BE6",
    colorFondo: "#EAF1FE",
    icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
    slaDiasDefault: 5,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  conta: {
    wsId: "conta",
    nombre: "Contabilidad",
    nombreCorto: "CONTA",
    descripcion: "Unidad de contabilidad institucional.",
    responsableId: "USR-CONTA-001",
    color: "#12A150",
    colorFondo: "#EDFAF3",
    icon: "M9 7H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2m-2-4H9m2 0v4m0-4a2 2 0 00-2 2v4h4V5a2 2 0 00-2-2z",
    slaDiasDefault: 3,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  compras: {
    wsId: "compras",
    nombre: "Compras y Adquisiciones",
    nombreCorto: "COMPRAS",
    descripcion: "Unidad de gestión de compras institucionales.",
    responsableId: "USR-COMP-001",
    color: "#E5A100",
    colorFondo: "#FFF8E7",
    icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
    slaDiasDefault: 10,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  mant: {
    wsId: "mant",
    nombre: "Mantenimiento",
    nombreCorto: "MANT",
    descripcion: "Unidad de mantenimiento de infraestructura.",
    responsableId: "USR-MANT-001",
    color: "#5B4FD0",
    colorFondo: "#F0EFFE",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    slaDiasDefault: 7,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  salud: {
    wsId: "salud",
    nombre: "Unidad de Salud",
    nombreCorto: "SALUD",
    descripcion: "Unidad de salud y bienestar institucional.",
    responsableId: "USR-SALUD-001",
    color: "#0F8A8A",
    colorFondo: "#E6F6F6",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    slaDiasDefault: 5,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
};

// ── Audit Records ─────────────────────────────────────────────────────────────

const MOCK_AUDIT: AuditRecord[] = [
  {
    id: "AUD-RRHH-001",
    wsId: "rrhh",
    entityType: "ProcessBlueprint",
    entityId: "BP-RRHH-26-001",
    action: "blueprint.published",
    performedBy: "admin@upes.edu.sv",
    performedAt: "2026-07-01T10:00:00Z",
    after: { lifecycle: "published", version: 2 },
  },
  {
    id: "AUD-RRHH-002",
    wsId: "rrhh",
    entityType: "WorkspaceKPI",
    entityId: "KPI-RRHH-001",
    action: "kpi.created",
    performedBy: "admin@upes.edu.sv",
    performedAt: "2026-06-01T08:00:00Z",
    after: { lifecycle: "draft" },
  },
  {
    id: "AUD-RRHH-003",
    wsId: "rrhh",
    entityType: "RequestType",
    entityId: "REQ-RRHH-002",
    action: "requestType.updated",
    performedBy: "admin@upes.edu.sv",
    performedAt: "2026-07-01T10:00:00Z",
    before: { version: 1 },
    after: { version: 2, lifecycle: "published" },
  },
  {
    id: "AUD-RRHH-004",
    wsId: "rrhh",
    entityType: "WorkspaceUser",
    entityId: "USR-RRHH-004",
    action: "user.deactivated",
    performedBy: "admin@upes.edu.sv",
    performedAt: "2026-07-10T08:00:00Z",
    before: { activo: true },
    after: { activo: false },
  },
  {
    id: "AUD-RRHH-005",
    wsId: "rrhh",
    entityType: "WorkspaceAutomation",
    entityId: "AUTO-RRHH-001",
    action: "automation.published",
    performedBy: "admin@upes.edu.sv",
    performedAt: "2026-06-01T08:00:00Z",
    after: { lifecycle: "published", active: true },
  },
];

// ── Service API ───────────────────────────────────────────────────────────────

export const WorkspaceAdminService = {
  // Blueprints
  listBlueprints: (wsId: WorkspaceId) =>
    delay(MOCK_BLUEPRINTS.filter((b) => b.wsId === wsId && !b.deletedAt)),

  getBlueprint: (id: string) =>
    delay(MOCK_BLUEPRINTS.find((b) => b.id === id) ?? null),

  createBlueprint: (_wsId: WorkspaceId, _data: Partial<ProcessBlueprint>): Promise<ProcessBlueprint> =>
    delay({ ...MOCK_BLUEPRINTS[0], id: `BP-NEW-${Date.now()}` }),

  updateBlueprint: (id: string, _data: Partial<ProcessBlueprint>) =>
    delay(MOCK_BLUEPRINTS.find((b) => b.id === id) ?? null),

  publishBlueprint: (id: string) =>
    delay({ success: true, runtimeBlueprintId: `RBP-${id}` }),

  archiveBlueprint: (id: string) =>
    delay({ success: true, id }),

  duplicateBlueprint: (id: string) =>
    delay({ ...MOCK_BLUEPRINTS.find((b) => b.id === id), id: `BP-COPY-${id}`, lifecycle: "draft" as ObjectLifecycle }),

  deleteBlueprint: (id: string) =>
    delay({ success: true, id, deletedAt: new Date().toISOString() }),

  // KPIs
  listKPIs: (wsId: WorkspaceId) =>
    delay(MOCK_KPIS.filter((k) => k.wsId === wsId)),

  getKPI: (id: string) =>
    delay(MOCK_KPIS.find((k) => k.id === id) ?? null),

  createKPI: (_wsId: WorkspaceId, _data: Partial<WorkspaceKPI>): Promise<WorkspaceKPI> =>
    delay({ ...MOCK_KPIS[0], id: `KPI-NEW-${Date.now()}` }),

  updateKPI: (id: string, _data: Partial<WorkspaceKPI>) =>
    delay(MOCK_KPIS.find((k) => k.id === id) ?? null),

  publishKPI: (id: string) =>
    delay({ success: true, id }),

  // Request Types
  listRequestTypes: (wsId: WorkspaceId) =>
    delay(MOCK_REQUEST_TYPES.filter((r) => r.wsId === wsId)),

  getRequestType: (id: string) =>
    delay(MOCK_REQUEST_TYPES.find((r) => r.id === id) ?? null),

  createRequestType: (_wsId: WorkspaceId, _data: Partial<RequestType>): Promise<RequestType> =>
    delay({ ...MOCK_REQUEST_TYPES[0], id: `REQ-NEW-${Date.now()}` }),

  updateRequestType: (id: string, _data: Partial<RequestType>) =>
    delay(MOCK_REQUEST_TYPES.find((r) => r.id === id) ?? null),

  publishRequestType: (id: string) =>
    delay({ success: true, id }),

  // Automations
  listAutomations: (wsId: WorkspaceId) =>
    delay(MOCK_AUTOMATIONS.filter((a) => a.wsId === wsId)),

  getAutomation: (id: string) =>
    delay(MOCK_AUTOMATIONS.find((a) => a.id === id) ?? null),

  toggleAutomation: (id: string, active: boolean) =>
    delay({ success: true, id, active }),

  // Users
  listUsers: (wsId: WorkspaceId) =>
    delay(MOCK_USERS.filter((u) => u.wsId === wsId)),

  getUser: (id: string) =>
    delay(MOCK_USERS.find((u) => u.id === id) ?? null),

  updateUserRole: (id: string, rol: string) =>
    delay({ success: true, id, rol }),

  toggleUserActive: (id: string, activo: boolean) =>
    delay({ success: true, id, activo }),

  // Settings
  getSettings: (wsId: WorkspaceId) =>
    delay(MOCK_SETTINGS[wsId] ?? null),

  updateSettings: (wsId: WorkspaceId, _data: Partial<WorkspaceSettings>) =>
    delay({ success: true, wsId }),

  // Audit
  listAuditRecords: (wsId: WorkspaceId) =>
    delay(MOCK_AUDIT.filter((a) => a.wsId === wsId)),

  // Template
  exportTemplate: (wsId: WorkspaceId): Promise<WorkspaceTemplate> =>
    delay({
      id: `TMPL-${wsId.toUpperCase()}-26-001`,
      nombre: `Plantilla ${wsId.toUpperCase()} - Julio 2026`,
      descripcion: `Configuración completa del workspace ${wsId.toUpperCase()} exportada el 15/07/2026.`,
      sourceWsId: wsId,
      exportedBy: "admin@upes.edu.sv",
      exportedAt: new Date().toISOString(),
      blueprints: MOCK_BLUEPRINTS.filter((b) => b.wsId === wsId).length,
      kpis: MOCK_KPIS.filter((k) => k.wsId === wsId).length,
      requestTypes: MOCK_REQUEST_TYPES.filter((r) => r.wsId === wsId).length,
      automations: MOCK_AUTOMATIONS.filter((a) => a.wsId === wsId).length,
      forms: 0,
      dashboards: 0,
      schemaVersion: "1.0.0",
    }),
};
