/**
 * Builder SDK — Sprint 15.5 No-Code Builder Suite
 *
 * Mock-first adapter. When APPS_SCRIPT_WEB_APP_URL is set, delegates to GAS.
 * All builder configs are stored in-memory keyed by wsId+tipo+id.
 */

import type {
  BuilderConfig,
  BuilderTipo,
  ProcessConfig,
  FormConfig,
  KPIConfig,
  CatalogConfig,
  AutomationConfig,
  NotificationConfig,
  ReportConfig,
  DashboardConfig,
  PermissionConfig,
  ProcedureConfig,
  EntradaCatalogo,
} from "@/types/builders";

const _isLive = !!process.env.APPS_SCRIPT_WEB_APP_URL;

// ── In-memory store ───────────────────────────────────────────────────────────

const _store = new Map<string, BuilderConfig>();

function _key(wsId: string, tipo: BuilderTipo, id: string) {
  return `${wsId}:${tipo}:${id}`;
}

function _listKey(wsId: string, tipo: BuilderTipo) {
  return `${wsId}:${tipo}:`;
}

function _nextId() {
  return `bldr-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

function _ensureSeeded(wsId: string) {
  const processKey = _key(wsId, "process", "demo-process-1");
  if (_store.has(processKey)) return;

  const now = new Date().toISOString();

  // Demo Process
  const demoProcess: ProcessConfig = {
    id: "demo-process-1",
    wsId,
    nombre: "Contratación de Personal",
    descripcion: "PRO-TH-001 — Procedimiento de Reclutamiento, Selección y Contratación",
    version: 3,
    status: "published",
    tipo: "process",
    etapas: [
      {
        id: "etapa-1",
        nombre: "Identificación de Necesidad",
        descripcion: "El jefe de área identifica la necesidad de contratación",
        orden: 1,
        responsable: "jefe_area",
        diasLimite: 2,
        validaciones: [],
        evidencias: [],
        documentos: [],
        acciones: [],
        esDecision: true,
        opcionSi: "Plaza existente → Requisición",
        opcionNo: "Nueva plaza → Proyecto",
      },
      {
        id: "etapa-2",
        nombre: "Requisición de Personal",
        descripcion: "RR. HH. elabora el formulario de requisición",
        orden: 2,
        responsable: "jefe_rrhh",
        diasLimite: 3,
        validaciones: [],
        evidencias: [],
        documentos: [],
        acciones: [],
        esDecision: false,
      },
    ],
    roles: ["jefe_area", "jefe_rrhh", "rector", "candidato"],
    kpiIds: [],
    notificacionIds: [],
    creadoPor: "sistema",
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  // Demo Form
  const demoForm: FormConfig = {
    id: "demo-form-1",
    wsId,
    nombre: "Formulario de Requisición de Personal",
    descripcion: "Captura los datos requeridos para la requisición",
    version: 2,
    status: "published",
    tipo: "form",
    campos: [
      {
        id: "f-1",
        tipo: "texto",
        etiqueta: "Nombre del puesto",
        requerido: true,
        orden: 1,
        reglas: [{ tipo: "requerido", mensaje: "El nombre del puesto es obligatorio" }],
        ancho: "full",
      },
      {
        id: "f-2",
        tipo: "select",
        etiqueta: "Tipo de contratación",
        requerido: true,
        orden: 2,
        opciones: [
          { valor: "permanente", etiqueta: "Permanente" },
          { valor: "interino", etiqueta: "Interino" },
          { valor: "eventual", etiqueta: "Eventual" },
        ],
        reglas: [],
        ancho: "half",
      },
    ],
    permiteGuardadoParcial: true,
    requiereFirma: true,
    creadoPor: "sistema",
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  // Demo Catalog: Departments
  const demoCatalogDepts: CatalogConfig = {
    id: "demo-catalog-dept",
    wsId,
    nombre: "Departamentos y Facultades",
    version: 1,
    status: "published",
    tipo: "catalog",
    tipoCatalogo: "departamentos",
    tieneJerarquia: true,
    atributosPersonalizados: [{ nombre: "Código institucional", tipo: "texto" }],
    entradas: [
      { id: "d-1", codigo: "DTAI", nombre: "Dirección de Tecnología y Administración Informática", activo: true, orden: 1, atributos: { "Código institucional": "DTAI-001" } },
      { id: "d-2", codigo: "FIET", nombre: "Facultad de Ingeniería y Especializaciones Tecnológicas", activo: true, orden: 2, atributos: { "Código institucional": "FIET-001" } },
      { id: "d-3", codigo: "FCEA", nombre: "Facultad de Ciencias Económicas y Administrativas", activo: true, orden: 3, atributos: { "Código institucional": "FCEA-001" } },
      { id: "d-4", codigo: "RRHH", nombre: "Recursos Humanos", activo: true, orden: 4, atributos: { "Código institucional": "RRHH-001" } },
    ],
    creadoPor: "sistema",
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  // Demo KPI
  const demoKPI: KPIConfig = {
    id: "demo-kpi-1",
    wsId,
    nombre: "Tiempo promedio de contratación",
    descripcion: "Días promedio desde identificación de necesidad hasta firma de contrato",
    version: 1,
    status: "published",
    tipo: "kpi",
    tipoKPI: "tiempo",
    formula: "PROMEDIO(dias_proceso)",
    variables: [
      {
        id: "v-1",
        nombre: "dias_proceso",
        descripcion: "Días totales por proceso de contratación",
        fuente: "proceso",
        campoFuente: "diasTotales",
        tipo: "promedio",
      },
    ],
    unidad: "días",
    valorObjetivo: 45,
    umbrales: {
      verde:    { min: 0,  max: 45 },
      amarillo: { min: 46, max: 60 },
      rojo:     { min: 61, max: 999 },
    },
    frecuenciaCalculo: "mensual",
    historico: [
      { fecha: "2026-01", valor: 52 },
      { fecha: "2026-02", valor: 48 },
      { fecha: "2026-03", valor: 43 },
      { fecha: "2026-04", valor: 47 },
      { fecha: "2026-05", valor: 41 },
      { fecha: "2026-06", valor: 39 },
    ],
    creadoPor: "sistema",
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  _store.set(_key(wsId, "process", demoProcess.id), demoProcess);
  _store.set(_key(wsId, "form", demoForm.id), demoForm);
  _store.set(_key(wsId, "catalog", demoCatalogDepts.id), demoCatalogDepts);
  _store.set(_key(wsId, "kpi", demoKPI.id), demoKPI);
}

// ── SDK ───────────────────────────────────────────────────────────────────────

export const BuilderSDK = {
  // List all configs of a given type
  async list<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo): Promise<T[]> {
    if (_isLive) throw new Error("GAS not implemented yet");
    _ensureSeeded(wsId);
    const prefix = _listKey(wsId, tipo);
    const results: T[] = [];
    for (const [k, v] of _store.entries()) {
      if (k.startsWith(prefix)) results.push(v as T);
    }
    return results.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  // Get a single config
  async get<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo, id: string): Promise<T | null> {
    if (_isLive) throw new Error("GAS not implemented yet");
    _ensureSeeded(wsId);
    return (_store.get(_key(wsId, tipo, id)) as T) ?? null;
  },

  // Create or update
  async save<T extends BuilderConfig>(wsId: string, config: Omit<T, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<T> {
    if (_isLive) throw new Error("GAS not implemented yet");
    const now = new Date().toISOString();
    const id   = config.id ?? _nextId();
    const existing = _store.get(_key(wsId, config.tipo as BuilderTipo, id));
    const saved: T = {
      ...config,
      id,
      wsId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    } as unknown as T;
    _store.set(_key(wsId, config.tipo as BuilderTipo, id), saved);
    return saved;
  },

  // Publish (bumps version, sets status=published)
  async publish<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo, id: string): Promise<T> {
    if (_isLive) throw new Error("GAS not implemented yet");
    const existing = _store.get(_key(wsId, tipo, id)) as T | undefined;
    if (!existing) throw new Error(`Builder config ${id} not found`);
    const published = {
      ...existing,
      status: "published" as const,
      version: existing.version + 1,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _store.set(_key(wsId, tipo, id), published);
    return published as T;
  },

  // Archive
  async archive(wsId: string, tipo: BuilderTipo, id: string): Promise<void> {
    const existing = _store.get(_key(wsId, tipo, id));
    if (!existing) return;
    _store.set(_key(wsId, tipo, id), { ...existing, status: "archived", updatedAt: new Date().toISOString() });
  },

  // Duplicate
  async duplicate<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo, id: string): Promise<T> {
    if (_isLive) throw new Error("GAS not implemented yet");
    const existing = _store.get(_key(wsId, tipo, id)) as T | undefined;
    if (!existing) throw new Error(`Builder config ${id} not found`);
    const now = new Date().toISOString();
    const newId = _nextId();
    const copy: T = {
      ...existing,
      id: newId,
      nombre: `${existing.nombre} (copia)`,
      status: "draft",
      version: 1,
      createdAt: now,
      updatedAt: now,
      publishedAt: undefined,
    } as unknown as T;
    _store.set(_key(wsId, tipo, newId), copy);
    return copy;
  },

  // Delete
  async delete(wsId: string, tipo: BuilderTipo, id: string): Promise<void> {
    _store.delete(_key(wsId, tipo, id));
  },

  // Catalog-specific: save a single entry
  async saveCatalogEntry(wsId: string, catalogId: string, entry: EntradaCatalogo): Promise<EntradaCatalogo> {
    const catalog = _store.get(_key(wsId, "catalog", catalogId)) as CatalogConfig | undefined;
    if (!catalog) throw new Error(`Catalog ${catalogId} not found`);
    const idx = catalog.entradas.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      catalog.entradas[idx] = entry;
    } else {
      catalog.entradas.push(entry);
    }
    catalog.updatedAt = new Date().toISOString();
    _store.set(_key(wsId, "catalog", catalogId), catalog);
    return entry;
  },

  async deleteCatalogEntry(wsId: string, catalogId: string, entryId: string): Promise<void> {
    const catalog = _store.get(_key(wsId, "catalog", catalogId)) as CatalogConfig | undefined;
    if (!catalog) return;
    catalog.entradas = catalog.entradas.filter((e) => e.id !== entryId);
    catalog.updatedAt = new Date().toISOString();
    _store.set(_key(wsId, "catalog", catalogId), catalog);
  },

  // Get all process configs (for cross-builder references)
  async getProcessList(wsId: string): Promise<ProcessConfig[]> {
    return BuilderSDK.list<ProcessConfig>(wsId, "process");
  },

  // Get all form configs
  async getFormList(wsId: string): Promise<FormConfig[]> {
    return BuilderSDK.list<FormConfig>(wsId, "form");
  },

  // Get all KPI configs
  async getKPIList(wsId: string): Promise<KPIConfig[]> {
    return BuilderSDK.list<KPIConfig>(wsId, "kpi");
  },

  // Get all notification configs
  async getNotificationList(wsId: string): Promise<NotificationConfig[]> {
    return BuilderSDK.list<NotificationConfig>(wsId, "notification");
  },
};
