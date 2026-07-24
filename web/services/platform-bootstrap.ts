/**
 * Platform Bootstrap Service — calls BootstrapController on the GAS backend.
 *
 * In mock mode (no APPS_SCRIPT_WEB_APP_URL env var), every step resolves with
 * a simulated success result after a short delay so the wizard UI can be
 * demoed without a live backend.
 */

import { getAppsScriptClient } from "./adapters/getAppsScriptClient";

export interface StepLog {
  level: "info" | "success" | "warn" | "error";
  message: string;
  timestamp: string;
}

export interface StepResult {
  step: number;
  status: "ok" | "warning" | "error";
  logs: StepLog[];
  data: Record<string, unknown>;
  errors: string[];
}

export interface PlatformStatus {
  installed: boolean;
  version: string | null;
  installDate: string | null;
}

const _isLive =
  typeof window === "undefined"
    ? typeof process !== "undefined" && !!process.env.APPS_SCRIPT_WEB_APP_URL
    : !!process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

function mockDelay<T>(value: T, ms = 1200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function mockStep(
  step: number,
  logs: StepLog[],
  data: Record<string, unknown> = {},
): Promise<StepResult> {
  return mockDelay({ step, status: "ok" as const, logs, data, errors: [] });
}

function ts(): string {
  return new Date().toISOString();
}

function log(level: StepLog["level"], message: string): StepLog {
  return { level, message, timestamp: ts() };
}

// ── Mock implementations ───────────────────────────────────────────────────

const MOCK_STEPS: Record<string, () => Promise<StepResult>> = {
  validate: () =>
    mockStep(1, [
      log("info", "Iniciando validación del entorno de la plataforma..."),
      log("success", "Spreadsheet conectado: SSE-VRAF Platform (1BxKm...)"),
      log("success", "Carpeta Drive raíz: SSE Platform (0ByKm...)"),
      log("success", "Propiedad ADMIN_EMAIL = admin@upes.edu.sv"),
      log("warn", "Propiedad GMAIL_ENABLED no configurada (se usará valor por defecto)"),
      log("success", "Sesión Google activa: admin@upes.edu.sv"),
      log("success", "LockService disponible"),
      log("success", "CacheService disponible"),
      log("success", "Entorno validado correctamente — listo para instalación"),
    ], { spreadsheetId: "1BxKm_DEMO", driveFolderId: "0ByKm_DEMO" }),

  initDatabase: () =>
    mockStep(2, [
      log("info", "Inicializando base de datos en Google Sheets..."),
      log("success", "Hoja 'planes' creada"),
      log("success", "Hoja 'procesos' creada"),
      log("success", "Hoja 'wsBlueprints' creada"),
      log("success", "Hoja 'wsKPIs' creada"),
      log("success", "Hoja 'wsForms' creada"),
      log("success", "Hoja 'wsRequestTypes' creada"),
      log("success", "Hoja 'wsAutomations' creada"),
      log("success", "Hoja 'wsUsers' creada"),
      log("success", "Hoja 'wsSettings' creada"),
      log("success", "42 hojas creadas correctamente"),
    ], { sheetsCreated: 42, sheetsVerified: 0, totalEntities: 42 }),

  initDrive: () =>
    mockStep(3, [
      log("info", "Creando jerarquía de carpetas institucionales en Google Drive..."),
      log("success", "Carpeta raíz: SSE Platform"),
      log("success", "Carpeta de sistema creada: Config"),
      log("success", "Carpeta de sistema creada: Database"),
      log("success", "Carpeta de sistema creada: Templates"),
      log("success", "Carpeta de sistema creada: Documents"),
      log("success", "Carpeta de sistema creada: Reports"),
      log("success", "Carpeta de sistema creada: Backups"),
      log("success", "Workspace RRHH: 7 sub-carpetas"),
      log("success", "Workspace VRAF: 7 sub-carpetas"),
      log("success", "Workspace CONTA: 7 sub-carpetas"),
      log("success", "Workspace COMPRAS: 7 sub-carpetas"),
      log("success", "Workspace MANT: 7 sub-carpetas"),
      log("success", "Workspace SALUD: 7 sub-carpetas"),
      log("success", "Jerarquía Drive inicializada correctamente"),
    ]),

  installTemplates: () =>
    mockStep(4, [
      log("info", "Instalando módulo RRHH como primer módulo operativo..."),
      log("info", "Instalando procesos RRHH..."),
      log("success", "6 procesos instalados"),
      log("info", "Instalando indicadores KPI..."),
      log("success", "6 indicadores instalados"),
      log("info", "Instalando formularios..."),
      log("success", "5 formularios instalados"),
      log("info", "Instalando tipos de solicitud..."),
      log("success", "5 tipos de solicitud instalados"),
      log("info", "Instalando automatizaciones..."),
      log("success", "4 automatizaciones instaladas"),
      log("info", "Instalando reglas de notificación..."),
      log("success", "3 reglas de notificación instaladas"),
      log("success", "Módulo RRHH instalado: 6 procesos, 6 KPIs, 5 formularios, 5 tipos de solicitud"),
    ], { blueprints: 6, kpis: 6, forms: 5, requestTypes: 5, automations: 4, notifRules: 3 }),

  createAdmin: () =>
    mockStep(5, [
      log("info", "Configurando administrador de la plataforma..."),
      log("info", "Administrador identificado: admin@upes.edu.sv"),
      log("success", "Administrador creado en workspace RRHH"),
      log("success", "Administrador creado en workspace VRAF"),
      log("success", "Administrador creado en workspace CONTA"),
      log("success", "Administrador creado en workspace COMPRAS"),
      log("success", "Administrador creado en workspace MANT"),
      log("success", "Administrador creado en workspace SALUD"),
      log("success", "Administrador configurado: 6 creado(s), 0 actualizado(s)"),
    ], { email: "admin@upes.edu.sv", workspaces: 6, created: 6, updated: 0 }),

  configure: () =>
    mockStep(6, [
      log("info", "Aplicando configuración inicial de la plataforma..."),
      log("success", "Configuración inicial creada: RRHH"),
      log("success", "Configuración inicial creada: VRAF"),
      log("success", "Configuración inicial creada: CONTA"),
      log("success", "Configuración inicial creada: COMPRAS"),
      log("success", "Configuración inicial creada: MANT"),
      log("success", "Configuración inicial creada: SALUD"),
      log("success", "Propiedades de plataforma guardadas"),
      log("success", "Configuración aplicada: 6 workspace(s) nuevo(s), 0 actualizado(s)"),
    ], { workspacesConfigured: 6, platformVersion: "1.0.0" }),

  healthCheck: () =>
    mockStep(7, [
      log("info", "Ejecutando verificación de salud de la plataforma..."),
      log("success", "Base de datos: 42 hojas presentes — OK"),
      log("success", "Drive: carpeta raíz accesible — SSE Platform"),
      log("success", "Configuración de workspaces: 6/6 configurados"),
      log("success", "Procesos RRHH instalados: 6"),
      log("success", "Usuarios administradores: 6"),
      log("success", "Plataforma marcada como instalada — versión 1.0.0"),
      log("success", "Verificación de salud completada: todos los sistemas OK"),
    ], { checks: { sheets: "ok", drive: "ok", settings: "ok", blueprints: "ok", adminUsers: "ok", properties: "ok" } }),

  liveTest: () =>
    mockStep(8, [
      log("info", "Ejecutando prueba en vivo — se crearán y eliminarán datos de prueba..."),
      log("success", "Empleado de prueba creado: EMP-26-TEST01"),
      log("success", "Proceso de prueba creado: PROC-26-TEST01"),
      log("success", "Notificación de prueba creada: NOTIF-26-TEST01"),
      log("success", "Registro de auditoría creado correctamente"),
      log("info", "Limpiando datos de prueba..."),
      log("success", "3 registro(s) de prueba eliminado(s)"),
      log("success", "Prueba en vivo completada — todos los sistemas respondieron correctamente"),
    ], { cleaned: 3 }),

  report: () =>
    mockStep(9, [
      log("info", "Generando reporte de instalación..."),
      log("success", "Procesos: 6 registros"),
      log("success", "Indicadores: 6 registros"),
      log("success", "Formularios: 5 registros"),
      log("success", "Tipos de Solicitud: 5 registros"),
      log("success", "Automatizaciones: 4 registros"),
      log("success", "Usuarios: 6 registros"),
      log("success", "Reglas de Notificación: 3 registros"),
      log("success", "Configuraciones de Workspace: 6 registros"),
      log("success", "Hojas de cálculo: 42 creadas"),
      log("success", "Carpeta Drive: SSE Platform"),
      log("success", "Plataforma SSE-VRAF v1.0.0 instalada correctamente. Total: 41 registros en 42 hojas."),
    ], {
      platformVersion: "1.0.0",
      installDate: ts(),
      sheetsTotal: 42,
      components: { blueprints: 6, kpis: 6, forms: 5, requestTypes: 5, automations: 4, users: 6, notifRules: 3, settings: 6 },
    }),
};

const STEP_VERBS = [
  "validate",
  "initDatabase",
  "initDrive",
  "installTemplates",
  "createAdmin",
  "configure",
  "healthCheck",
  "liveTest",
  "report",
] as const;

type StepVerb = (typeof STEP_VERBS)[number];

// ── Public API ─────────────────────────────────────────────────────────────

export async function getPlatformStatus(): Promise<PlatformStatus> {
  if (_isLive) {
    return getAppsScriptClient().call<PlatformStatus>("platform.getStatus");
  }
  return mockDelay({ installed: false, version: null, installDate: null }, 300);
}

export async function runStep(verb: StepVerb, params?: Record<string, unknown>): Promise<StepResult> {
  if (_isLive) {
    return getAppsScriptClient().call<StepResult>(`platform.${verb}`, params);
  }
  const mockFn = MOCK_STEPS[verb];
  if (!mockFn) throw new Error(`Unknown step: ${verb}`);
  return mockFn();
}

export const WIZARD_STEPS: { verb: StepVerb; label: string; description: string }[] = [
  { verb: "validate",         label: "Validar entorno",          description: "Verifica Script Properties, Drive y credenciales" },
  { verb: "initDatabase",     label: "Inicializar base de datos", description: "Crea todas las hojas de cálculo con encabezados" },
  { verb: "initDrive",        label: "Inicializar Drive",         description: "Crea la jerarquía de carpetas institucionales" },
  { verb: "installTemplates", label: "Instalar plantillas",       description: "Instala el módulo RRHH como primer módulo operativo" },
  { verb: "createAdmin",      label: "Crear administrador",       description: "Configura el usuario administrador en los 6 workspaces" },
  { verb: "configure",        label: "Configurar plataforma",     description: "Aplica la configuración inicial de cada workspace" },
  { verb: "healthCheck",      label: "Verificación de salud",     description: "Valida que todos los componentes respondan correctamente" },
  { verb: "liveTest",         label: "Prueba en vivo",            description: "Crea y elimina datos de prueba para confirmar operación" },
  { verb: "report",           label: "Reporte de instalación",    description: "Genera el resumen completo de lo instalado" },
];
