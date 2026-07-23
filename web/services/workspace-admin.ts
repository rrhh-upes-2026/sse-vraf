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
  // VRAF users
  { id: "USR-VRAF-001", wsId: "vraf", nombre: "MSc. Luisa Martínez", email: "lmartinez@upes.edu.sv", rol: "HEAD", activo: true, lastLoginAt: "2026-07-15T07:45:00Z", createdAt: "2026-01-10T08:00:00Z", updatedAt: "2026-07-01T08:00:00Z" },
  { id: "USR-VRAF-002", wsId: "vraf", nombre: "Lic. Jorge Domínguez", email: "jdominguez@upes.edu.sv", rol: "ANALYST", activo: true, lastLoginAt: "2026-07-14T15:00:00Z", createdAt: "2026-02-01T08:00:00Z", updatedAt: "2026-07-01T08:00:00Z" },
  { id: "USR-VRAF-003", wsId: "vraf", nombre: "Admin Plataforma", email: "admin@upes.edu.sv", rol: "ADMIN", activo: true, lastLoginAt: "2026-07-15T08:30:00Z", createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z" },
  // CONTA users
  { id: "USR-CONTA-001", wsId: "conta", nombre: "CPA. Elena Vásquez", email: "evasquez@upes.edu.sv", rol: "HEAD", activo: true, lastLoginAt: "2026-07-15T09:00:00Z", createdAt: "2026-01-10T08:00:00Z", updatedAt: "2026-07-01T08:00:00Z" },
  { id: "USR-CONTA-002", wsId: "conta", nombre: "Lic. Pablo Méndez", email: "pmendez@upes.edu.sv", rol: "OPS", activo: true, lastLoginAt: "2026-07-13T14:00:00Z", createdAt: "2026-03-01T08:00:00Z", updatedAt: "2026-07-01T08:00:00Z" },
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
  ime: {
    wsId: "ime",
    nombre: "Gestión de Indicadores",
    nombreCorto: "IME",
    descripcion: "Motor de indicadores institucionales.",
    responsableId: "USR-VRAF-001",
    color: "#7C3AED",
    colorFondo: "#EDE9FE",
    icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  pme: {
    wsId: "pme",
    nombre: "Gestión de Procesos",
    nombreCorto: "PME",
    descripcion: "Motor de procesos, procedimientos y actividades institucionales.",
    responsableId: "USR-VRAF-001",
    color: "#0F766E",
    colorFondo: "#CCFBF1",
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  ape: {
    wsId: "ape",
    nombre: "Planificación Institucional",
    nombreCorto: "APE",
    descripcion: "Motor de planificación de actividades institucionales.",
    responsableId: "USR-VRAF-001",
    color: "#0369A1",
    colorFondo: "#E0F2FE",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  aee: {
    wsId: "aee",
    nombre: "Ejecución Institucional",
    nombreCorto: "AEE",
    descripcion: "Motor de ejecución de actividades institucionales planificadas.",
    responsableId: "USR-VRAF-001",
    color: "#0E7490",
    colorFondo: "#ECFEFF",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  eme: {
    wsId: "eme",
    nombre: "Gestión de Evidencias",
    nombreCorto: "EME",
    descripcion: "Repositorio institucional de evidencias generadas por la ejecución de actividades.",
    responsableId: "USR-VRAF-001",
    color: "#7C3AED",
    colorFondo: "#F5F3FF",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  eip: {
    wsId: "eip",
    nombre: "Executive Intelligence Platform",
    nombreCorto: "EIP",
    descripcion: "Plataforma ejecutiva de inteligencia institucional. Consolida datos de todos los motores para la toma de decisiones estratégicas.",
    responsableId: "USR-VRAF-001",
    color: "#1D4ED8",
    colorFondo: "#EFF6FF",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  cpe: {
    wsId: "cpe",
    nombre: "Cumplimiento Institucional",
    nombreCorto: "CPE",
    descripcion: "Motor analítico de cumplimiento: mide planificación, ejecución, documentación e indicadores.",
    responsableId: "USR-VRAF-001",
    color: "#059669",
    colorFondo: "#ECFDF5",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  iie: {
    wsId: "iie",
    nombre: "Institutional Intelligence Engine",
    nombreCorto: "IIE",
    descripcion: "Motor de inteligencia institucional. Genera diagnósticos, recomendaciones, predicciones y narrativas mediante reglas de negocio configurables. Prepara contratos de integración para IA futura.",
    responsableId: "USR-VRAF-001",
    color: "#6D28D9",
    colorFondo: "#F5F3FF",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-01T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  ioe: {
    wsId: "ioe",
    nombre: "Institutional Orchestration Engine",
    nombreCorto: "IOE",
    descripcion: "Motor de orquestación institucional. Convierte diagnósticos, brechas y alertas en planes de acción ejecutables con hitos, tareas, decisiones y seguimiento trazable.",
    responsableId: "USR-VRAF-001",
    color: "#0F766E",
    colorFondo: "#F0FDFA",
    icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-23T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  aue: {
    wsId: "aue",
    nombre: "Automation & Event Engine",
    nombreCorto: "AUE",
    descripcion: "Event Bus institucional transversal. Registra eventos de cualquier motor, evalúa reglas WHEN/IF/THEN de forma determinista y despacha acciones declarativas. Infraestructura para automatizaciones e integraciones futuras.",
    responsableId: "USR-VRAF-001",
    color: "#7C3AED",
    colorFondo: "#F5F3FF",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-23T10:00:00Z",
    updatedBy: "admin@upes.edu.sv",
  },
  nce: {
    wsId: "nce",
    nombre: "Notification & Communication Engine",
    nombreCorto: "NCE",
    descripcion: "Motor de Notificaciones institucional. Consume eventos del AUE, aplica templates con sustitución {{variable}}, gestiona preferencias por usuario, horario de silencio y genera digests periódicos. Canal interno habilitado; correo y Google Chat como contratos.",
    responsableId: "USR-VRAF-001",
    color: "#0369A1",
    colorFondo: "#F0F9FF",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    slaDiasDefault: 0,
    zonaHoraria: "America/El_Salvador",
    idioma: "es-SV",
    updatedAt: "2026-07-23T10:00:00Z",
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

// ── Forms ─────────────────────────────────────────────────────────────────────

const MOCK_FORMS: FormBlueprint[] = [
  {
    id: "FORM-RRHH-001-v2",
    wsId: "rrhh",
    nombre: "Solicitud de Contratación",
    descripcion: "Formulario para iniciar proceso de contratación de nuevo personal.",
    schema: { fields: [{ type: "text", label: "Cargo solicitado", required: true }, { type: "select", label: "Tipo de contrato", options: ["Tiempo completo", "Medio tiempo", "Por obra"] }, { type: "textarea", label: "Justificación" }] },
    lifecycle: "published",
    version: 2,
    history: [makeVersion(1, "admin@upes.edu.sv", "archived"), makeVersion(2, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "FORM-RRHH-002-v1",
    wsId: "rrhh",
    nombre: "Evaluación de Desempeño 360°",
    descripcion: "Formulario de evaluación multifuente para personal docente y administrativo.",
    schema: { fields: [{ type: "scale", label: "Liderazgo", min: 1, max: 5 }, { type: "scale", label: "Comunicación", min: 1, max: 5 }, { type: "textarea", label: "Comentarios generales" }] },
    lifecycle: "published",
    version: 1,
    history: [makeVersion(1, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-15T09:00:00Z",
  },
  {
    id: "FORM-RRHH-003-v1",
    wsId: "rrhh",
    nombre: "Solicitud de Permiso / Licencia",
    descripcion: "Formulario para solicitudes de permisos, licencias y ausencias justificadas.",
    schema: { fields: [{ type: "select", label: "Tipo de permiso", options: ["Personal", "Médico", "Maternidad/Paternidad", "Estudio"] }, { type: "date", label: "Fecha inicio" }, { type: "date", label: "Fecha fin" }, { type: "file", label: "Documento de soporte" }] },
    lifecycle: "draft",
    version: 1,
    history: [makeVersion(1, "rrhh.admin@upes.edu.sv", "draft")],
    createdBy: "rrhh.admin@upes.edu.sv",
    createdAt: "2026-07-05T14:00:00Z",
    updatedAt: "2026-07-05T14:00:00Z",
  },
];

// ── Documents ─────────────────────────────────────────────────────────────────

const MOCK_DOCUMENTS: WorkspaceDocument[] = [
  {
    id: "DOC-RRHH-001",
    wsId: "rrhh",
    nombre: "Manual de Políticas de Recursos Humanos",
    descripcion: "Marco normativo institucional para la gestión del talento humano.",
    categoria: "manual",
    mimeType: "application/pdf",
    sizeKb: 1240,
    version: 3,
    tags: ["políticas", "normativa", "RRHH"],
    responsableRol: "HEAD",
    lifecycle: "published",
    history: [makeVersion(1, "admin@upes.edu.sv", "archived"), makeVersion(2, "admin@upes.edu.sv", "archived"), makeVersion(3, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "DOC-RRHH-002",
    wsId: "rrhh",
    nombre: "Reglamento Interno de Trabajo",
    descripcion: "Normas de conducta, derechos y obligaciones del personal institucional.",
    categoria: "reglamento",
    mimeType: "application/pdf",
    sizeKb: 890,
    version: 2,
    tags: ["reglamento", "conducta", "obligaciones"],
    responsableRol: "HEAD",
    lifecycle: "published",
    history: [makeVersion(1, "admin@upes.edu.sv", "archived"), makeVersion(2, "admin@upes.edu.sv", "published")],
    createdBy: "admin@upes.edu.sv",
    createdAt: "2025-08-01T08:00:00Z",
    updatedAt: "2026-03-15T09:00:00Z",
  },
  {
    id: "DOC-RRHH-003",
    wsId: "rrhh",
    nombre: "Procedimiento de Reclutamiento y Selección",
    descripcion: "Instructivo detallado para el proceso de reclutamiento de personal.",
    categoria: "procedimiento",
    mimeType: "application/pdf",
    sizeKb: 340,
    version: 1,
    tags: ["reclutamiento", "selección", "procedimiento"],
    responsableRol: "ANALYST",
    lifecycle: "draft",
    history: [makeVersion(1, "rrhh.admin@upes.edu.sv", "draft")],
    createdBy: "rrhh.admin@upes.edu.sv",
    createdAt: "2026-07-10T11:00:00Z",
    updatedAt: "2026-07-10T11:00:00Z",
  },
];

// ── Notification Rules ────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: NotificationRule[] = [
  {
    id: "NOTIF-RRHH-001",
    wsId: "rrhh",
    nombre: "Alerta de vencimiento de SLA",
    descripcion: "Notifica cuando una solicitud está a 24h de vencer su SLA.",
    trigger: "sla.warning",
    conditions: [{ field: "slaDias", operator: "less_than", value: "1" }],
    destinatarioRoles: ["HEAD", "ANALYST"],
    canal: "both",
    asunto: "⚠️ SLA por vencer — {{request.nombre}}",
    mensaje: "La solicitud {{request.nombre}} vence en menos de 24 horas. Responsable: {{request.responsable}}.",
    active: true,
    lifecycle: "published",
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "NOTIF-RRHH-002",
    wsId: "rrhh",
    nombre: "Nuevo proceso publicado",
    descripcion: "Notifica a todos los operadores cuando se publica un proceso nuevo.",
    trigger: "process.created",
    conditions: [{ field: "lifecycle", operator: "equals", value: "published" }],
    destinatarioRoles: ["OPS", "ANALYST"],
    canal: "in_app",
    asunto: "Nuevo proceso disponible: {{process.nombre}}",
    mensaje: "Se ha publicado el proceso {{process.nombre}}. Revisa los nuevos procedimientos en tu workspace.",
    active: true,
    lifecycle: "published",
    createdBy: "admin@upes.edu.sv",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "NOTIF-RRHH-003",
    wsId: "rrhh",
    nombre: "Solicitud aprobada",
    descripcion: "Confirma al solicitante cuando su solicitud es aprobada.",
    trigger: "request.approved",
    conditions: [],
    destinatarioRoles: ["OPS"],
    canal: "email",
    asunto: "Tu solicitud fue aprobada ✓",
    mensaje: "Tu solicitud {{request.nombre}} ha sido aprobada el {{fecha}}. Puedes consultar el detalle en el sistema.",
    active: false,
    lifecycle: "draft",
    createdBy: "rrhh.admin@upes.edu.sv",
    createdAt: "2026-07-05T09:00:00Z",
    updatedAt: "2026-07-05T09:00:00Z",
  },
];

// ── Live adapter routing ──────────────────────────────────────────────────────

import { getAppsScriptClient } from "./adapters/getAppsScriptClient";

// Resolved once at module load — never changes at runtime.
const _isLive =
  typeof window === "undefined"
    ? typeof process !== "undefined" && !!process.env.APPS_SCRIPT_WEB_APP_URL
    : process.env.NEXT_PUBLIC_APPS_SCRIPT_ENABLED === "true";
const _client = () => getAppsScriptClient();

// ── Service API ───────────────────────────────────────────────────────────────

export const WorkspaceAdminService = {
  // Blueprints
  listBlueprints: (wsId: WorkspaceId): Promise<ProcessBlueprint[]> =>
    _isLive
      ? _client().list<ProcessBlueprint>("wsBlueprints", { wsId })
      : delay(MOCK_BLUEPRINTS.filter((b) => b.wsId === wsId && !b.deletedAt)),

  getBlueprint: (id: string): Promise<ProcessBlueprint | null> =>
    _isLive
      ? _client().get<ProcessBlueprint>("wsBlueprints", id)
      : delay(MOCK_BLUEPRINTS.find((b) => b.id === id) ?? null),

  createBlueprint: (wsId: WorkspaceId, data: Partial<ProcessBlueprint>): Promise<ProcessBlueprint> =>
    _isLive
      ? _client().create<ProcessBlueprint>("wsBlueprints", { wsId, ...data })
      : delay({ ...MOCK_BLUEPRINTS[0], id: `BP-NEW-${Date.now()}` }),

  updateBlueprint: (id: string, data: Partial<ProcessBlueprint>): Promise<ProcessBlueprint | null> =>
    _isLive
      ? _client().update<ProcessBlueprint>("wsBlueprints", id, data)
      : delay(MOCK_BLUEPRINTS.find((b) => b.id === id) ?? null),

  publishBlueprint: (id: string): Promise<{ success: boolean; runtimeBlueprintId?: string }> =>
    _isLive
      ? _client().call("wsBlueprints.publish", { id }).then(() => ({ success: true, runtimeBlueprintId: `RBP-${id}` }))
      : delay({ success: true, runtimeBlueprintId: `RBP-${id}` }),

  archiveBlueprint: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsBlueprints.archive", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  duplicateBlueprint: (id: string): Promise<ProcessBlueprint> =>
    _isLive
      ? _client().call<ProcessBlueprint>("wsBlueprints.duplicate", { id })
      : delay({ ...MOCK_BLUEPRINTS.find((b) => b.id === id)!, id: `BP-COPY-${id}`, lifecycle: "draft" as ObjectLifecycle }),

  deleteBlueprint: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().remove("wsBlueprints", id).then(() => ({ success: true, id, deletedAt: new Date().toISOString() }))
      : delay({ success: true, id, deletedAt: new Date().toISOString() }),

  // KPIs
  listKPIs: (wsId: WorkspaceId): Promise<WorkspaceKPI[]> =>
    _isLive
      ? _client().list<WorkspaceKPI>("wsKPIs", { wsId })
      : delay(MOCK_KPIS.filter((k) => k.wsId === wsId)),

  getKPI: (id: string): Promise<WorkspaceKPI | null> =>
    _isLive
      ? _client().get<WorkspaceKPI>("wsKPIs", id)
      : delay(MOCK_KPIS.find((k) => k.id === id) ?? null),

  createKPI: (wsId: WorkspaceId, data: Partial<WorkspaceKPI>): Promise<WorkspaceKPI> =>
    _isLive
      ? _client().create<WorkspaceKPI>("wsKPIs", { wsId, ...data })
      : delay({ ...MOCK_KPIS[0], id: `KPI-NEW-${Date.now()}` }),

  updateKPI: (id: string, data: Partial<WorkspaceKPI>): Promise<WorkspaceKPI | null> =>
    _isLive
      ? _client().update<WorkspaceKPI>("wsKPIs", id, data)
      : delay(MOCK_KPIS.find((k) => k.id === id) ?? null),

  publishKPI: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsKPIs.publish", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  archiveKPI: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsKPIs.archive", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  duplicateKPI: (id: string): Promise<WorkspaceKPI> =>
    _isLive
      ? _client().call<WorkspaceKPI>("wsKPIs.duplicate", { id })
      : (() => {
          const src = MOCK_KPIS.find((k) => k.id === id);
          return delay({ ...(src ?? MOCK_KPIS[0]), id: `KPI-NEW-${Date.now()}`, nombre: `Copia de ${src?.nombre ?? "KPI"}`, lifecycle: "draft" as const, version: 1 });
        })(),

  // Request Types
  listRequestTypes: (wsId: WorkspaceId): Promise<RequestType[]> =>
    _isLive
      ? _client().list<RequestType>("wsRequestTypes", { wsId })
      : delay(MOCK_REQUEST_TYPES.filter((r) => r.wsId === wsId)),

  getRequestType: (id: string): Promise<RequestType | null> =>
    _isLive
      ? _client().get<RequestType>("wsRequestTypes", id)
      : delay(MOCK_REQUEST_TYPES.find((r) => r.id === id) ?? null),

  createRequestType: (wsId: WorkspaceId, data: Partial<RequestType>): Promise<RequestType> =>
    _isLive
      ? _client().create<RequestType>("wsRequestTypes", { wsId, ...data })
      : delay({ ...MOCK_REQUEST_TYPES[0], id: `REQ-NEW-${Date.now()}` }),

  updateRequestType: (id: string, data: Partial<RequestType>): Promise<RequestType | null> =>
    _isLive
      ? _client().update<RequestType>("wsRequestTypes", id, data)
      : delay(MOCK_REQUEST_TYPES.find((r) => r.id === id) ?? null),

  publishRequestType: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsRequestTypes.publish", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  archiveRequestType: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsRequestTypes.archive", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  duplicateRequestType: (id: string): Promise<RequestType> =>
    _isLive
      ? _client().call<RequestType>("wsRequestTypes.duplicate", { id })
      : (() => {
          const src = MOCK_REQUEST_TYPES.find((r) => r.id === id);
          return delay({ ...(src ?? MOCK_REQUEST_TYPES[0]), id: `REQ-NEW-${Date.now()}`, nombre: `Copia de ${src?.nombre ?? "Solicitud"}`, lifecycle: "draft" as const, version: 1 });
        })(),

  // Automations
  listAutomations: (wsId: WorkspaceId): Promise<WorkspaceAutomation[]> =>
    _isLive
      ? _client().list<WorkspaceAutomation>("wsAutomations", { wsId })
      : delay(MOCK_AUTOMATIONS.filter((a) => a.wsId === wsId)),

  getAutomation: (id: string): Promise<WorkspaceAutomation | null> =>
    _isLive
      ? _client().get<WorkspaceAutomation>("wsAutomations", id)
      : delay(MOCK_AUTOMATIONS.find((a) => a.id === id) ?? null),

  createAutomation: (wsId: WorkspaceId, data: Partial<WorkspaceAutomation>): Promise<WorkspaceAutomation> =>
    _isLive
      ? _client().create<WorkspaceAutomation>("wsAutomations", { wsId, ...data })
      : delay({ ...MOCK_AUTOMATIONS[0], id: `AUTO-NEW-${Date.now()}`, lifecycle: "draft" as const, active: false }),

  updateAutomation: (id: string, data: Partial<WorkspaceAutomation>): Promise<WorkspaceAutomation | null> =>
    _isLive
      ? _client().update<WorkspaceAutomation>("wsAutomations", id, data)
      : delay(MOCK_AUTOMATIONS.find((a) => a.id === id) ?? null),

  publishAutomation: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsAutomations.publish", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  archiveAutomation: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsAutomations.archive", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  toggleAutomation: (id: string, active: boolean): Promise<{ success: boolean; id: string; active: boolean }> =>
    _isLive
      ? _client().call("wsAutomations.toggleActive", { id, active }).then(() => ({ success: true, id, active }))
      : delay({ success: true, id, active }),

  // Users
  listUsers: (wsId: WorkspaceId): Promise<WorkspaceUser[]> =>
    _isLive
      ? _client().list<WorkspaceUser>("wsUsers", { wsId })
      : delay(MOCK_USERS.filter((u) => u.wsId === wsId)),

  getUser: (id: string): Promise<WorkspaceUser | null> =>
    _isLive
      ? _client().get<WorkspaceUser>("wsUsers", id)
      : delay(MOCK_USERS.find((u) => u.id === id) ?? null),

  createUser: (wsId: WorkspaceId, data: Partial<WorkspaceUser>): Promise<WorkspaceUser> =>
    _isLive
      ? _client().create<WorkspaceUser>("wsUsers", { wsId, ...data })
      : delay({ ...MOCK_USERS[0], id: `USR-NEW-${Date.now()}` }),

  updateUserRole: (id: string, rol: string): Promise<{ success: boolean; id: string; rol: string }> =>
    _isLive
      ? _client().update("wsUsers", id, { rol }).then(() => ({ success: true, id, rol }))
      : delay({ success: true, id, rol }),

  toggleUserActive: (id: string, activo: boolean): Promise<{ success: boolean; id: string; activo: boolean }> =>
    _isLive
      ? _client().call("wsUsers.toggleActive", { id, active: activo }).then(() => ({ success: true, id, activo }))
      : delay({ success: true, id, activo }),

  deleteUser: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().remove("wsUsers", id).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  // Settings
  getSettings: (wsId: WorkspaceId): Promise<WorkspaceSettings | null> =>
    _isLive
      ? _client().get<WorkspaceSettings>("wsSettings", wsId).then((r) => r ?? null)
      : delay(MOCK_SETTINGS[wsId] ?? null),

  updateSettings: (wsId: WorkspaceId, data: Partial<WorkspaceSettings>): Promise<{ success: boolean; wsId: string }> =>
    _isLive
      ? _client().call("wsSettings.upsertByWsId", { wsId, ...data }).then(() => ({ success: true, wsId }))
      : delay({ success: true, wsId }),

  // Forms
  listForms: (wsId: WorkspaceId): Promise<FormBlueprint[]> =>
    _isLive
      ? _client().list<FormBlueprint>("wsForms", { wsId })
      : delay(MOCK_FORMS.filter((f) => f.wsId === wsId)),

  getForm: (id: string): Promise<FormBlueprint | null> =>
    _isLive
      ? _client().get<FormBlueprint>("wsForms", id)
      : delay(MOCK_FORMS.find((f) => f.id === id) ?? null),

  createForm: (wsId: WorkspaceId, data: Partial<FormBlueprint>): Promise<FormBlueprint> =>
    _isLive
      ? _client().create<FormBlueprint>("wsForms", { wsId, ...data })
      : delay({ ...MOCK_FORMS[0], id: `FORM-NEW-${Date.now()}`, lifecycle: "draft" as const, version: 1 }),

  updateForm: (id: string, data: Partial<FormBlueprint>): Promise<FormBlueprint | null> =>
    _isLive
      ? _client().update<FormBlueprint>("wsForms", id, data)
      : delay(MOCK_FORMS.find((f) => f.id === id) ?? null),

  publishForm: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsForms.publish", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  archiveForm: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsForms.archive", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  duplicateForm: (id: string): Promise<FormBlueprint> =>
    _isLive
      ? _client().call<FormBlueprint>("wsForms.duplicate", { id })
      : (() => {
          const src = MOCK_FORMS.find((f) => f.id === id);
          return delay({ ...(src ?? MOCK_FORMS[0]), id: `FORM-NEW-${Date.now()}`, nombre: `Copia de ${src?.nombre ?? "Formulario"}`, lifecycle: "draft" as const, version: 1 });
        })(),

  // Documents
  listDocuments: (wsId: WorkspaceId): Promise<WorkspaceDocument[]> =>
    _isLive
      ? _client().list<WorkspaceDocument>("wsDocuments", { wsId })
      : delay(MOCK_DOCUMENTS.filter((d) => d.wsId === wsId)),

  getDocument: (id: string): Promise<WorkspaceDocument | null> =>
    _isLive
      ? _client().get<WorkspaceDocument>("wsDocuments", id)
      : delay(MOCK_DOCUMENTS.find((d) => d.id === id) ?? null),

  createDocument: (wsId: WorkspaceId, data: Partial<WorkspaceDocument>): Promise<WorkspaceDocument> =>
    _isLive
      ? _client().create<WorkspaceDocument>("wsDocuments", { wsId, ...data })
      : delay({ ...MOCK_DOCUMENTS[0], id: `DOC-NEW-${Date.now()}`, lifecycle: "draft" as const }),

  archiveDocument: (id: string): Promise<{ success: boolean; id: string }> =>
    _isLive
      ? _client().call("wsDocuments.archive", { id }).then(() => ({ success: true, id }))
      : delay({ success: true, id }),

  // Notification Rules
  listNotificationRules: (wsId: WorkspaceId): Promise<NotificationRule[]> =>
    _isLive
      ? _client().list<NotificationRule>("wsNotifRules", { wsId })
      : delay(MOCK_NOTIFICATIONS.filter((n) => n.wsId === wsId)),

  createNotificationRule: (wsId: WorkspaceId, data: Partial<NotificationRule>): Promise<NotificationRule> =>
    _isLive
      ? _client().create<NotificationRule>("wsNotifRules", { wsId, ...data })
      : delay({ ...MOCK_NOTIFICATIONS[0], id: `NOTIF-NEW-${Date.now()}` }),

  updateNotificationRule: (id: string, data: Partial<NotificationRule>): Promise<NotificationRule | null> =>
    _isLive
      ? _client().update<NotificationRule>("wsNotifRules", id, data)
      : delay(MOCK_NOTIFICATIONS.find((n) => n.id === id) ?? null),

  toggleNotificationRule: (id: string, active: boolean): Promise<{ success: boolean; id: string; active: boolean }> =>
    _isLive
      ? _client().call("wsNotifRules.toggleActive", { id, active }).then(() => ({ success: true, id, active }))
      : delay({ success: true, id, active }),

  // Audit
  listAuditRecords: (wsId: WorkspaceId): Promise<AuditRecord[]> =>
    _isLive
      ? _client().list<AuditRecord>("historial", { wsId })
      : delay(MOCK_AUDIT.filter((a) => a.wsId === wsId)),

  // Template
  exportTemplate: (wsId: WorkspaceId): Promise<WorkspaceTemplate> => {
    if (_isLive) {
      return Promise.all([
        _client().list<ProcessBlueprint>("wsBlueprints", { wsId }),
        _client().list<WorkspaceKPI>("wsKPIs", { wsId }),
        _client().list<RequestType>("wsRequestTypes", { wsId }),
        _client().list<WorkspaceAutomation>("wsAutomations", { wsId }),
        _client().list<FormBlueprint>("wsForms", { wsId }),
      ]).then(([blueprints, kpis, requestTypes, automations, forms]) => ({
        id: `TMPL-${wsId.toUpperCase()}-${Date.now()}`,
        nombre: `Plantilla ${wsId.toUpperCase()} - ${new Date().toLocaleDateString("es-SV")}`,
        descripcion: `Configuración completa del workspace ${wsId.toUpperCase()}.`,
        sourceWsId: wsId,
        exportedBy: "",
        exportedAt: new Date().toISOString(),
        blueprints: blueprints.length,
        kpis: kpis.length,
        requestTypes: requestTypes.length,
        automations: automations.length,
        forms: forms.length,
        dashboards: 0,
        schemaVersion: "1.0.0",
      }));
    }
    return delay({
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
    });
  },
};
