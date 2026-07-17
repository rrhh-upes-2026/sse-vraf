/**
 * Builder SDK — Sprint 16 Production Infrastructure
 *
 * Mock-first adapter. When APPS_SCRIPT_WEB_APP_URL is set, all operations
 * delegate to the Google Apps Script backend (BuilderController.js) via
 * getAppsScriptClient().call("builder.*", params).
 *
 * The GAS backend stores configs in WSBuilderConfigs sheet with configJson
 * holding the full typed object, enabling all 10 builder types without
 * separate sheets.
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
import { getAppsScriptClient } from "./adapters/getAppsScriptClient";

const _isLive =
  typeof window === "undefined"
    ? !!process.env.APPS_SCRIPT_WEB_APP_URL
    : process.env.NEXT_PUBLIC_APPS_SCRIPT_ENABLED === "true";

// ── In-memory store (mock mode only) ─────────────────────────────────────────

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

// ── Seed data (mock mode only) ────────────────────────────────────────────────

function _ensureSeeded(wsId: string) {
  const processKey = _key(wsId, "process", "demo-process-1");
  if (_store.has(processKey)) return;

  const now = new Date().toISOString();

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

const gas = () => getAppsScriptClient();

export const BuilderSDK = {

  async list<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo): Promise<T[]> {
    if (_isLive) {
      return gas().call<T[]>("builder.list", { wsId, tipo });
    }
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

  async get<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo, id: string): Promise<T | null> {
    if (_isLive) {
      return gas().call<T | null>("builder.get", { wsId, tipo, id });
    }
    _ensureSeeded(wsId);
    return (_store.get(_key(wsId, tipo, id)) as T) ?? null;
  },

  async save<T extends BuilderConfig>(
    wsId: string,
    config: Omit<T, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ): Promise<T> {
    if (_isLive) {
      return gas().call<T>("builder.save", { ...config, wsId });
    }
    const now = new Date().toISOString();
    const id  = config.id ?? _nextId();
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

  async publish<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo, id: string): Promise<T> {
    if (_isLive) {
      return gas().call<T>("builder.publish", { wsId, tipo, id });
    }
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

  async archive(wsId: string, tipo: BuilderTipo, id: string): Promise<void> {
    if (_isLive) {
      await gas().call<void>("builder.archive", { wsId, tipo, id });
      return;
    }
    const existing = _store.get(_key(wsId, tipo, id));
    if (!existing) return;
    _store.set(_key(wsId, tipo, id), { ...existing, status: "archived", updatedAt: new Date().toISOString() });
  },

  async duplicate<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo, id: string): Promise<T> {
    if (_isLive) {
      return gas().call<T>("builder.duplicate", { wsId, tipo, id });
    }
    const existing = _store.get(_key(wsId, tipo, id)) as T | undefined;
    if (!existing) throw new Error(`Builder config ${id} not found`);
    const now   = new Date().toISOString();
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

  async delete(wsId: string, tipo: BuilderTipo, id: string): Promise<void> {
    if (_isLive) {
      await gas().call<void>("builder.delete", { wsId, tipo, id });
      return;
    }
    _store.delete(_key(wsId, tipo, id));
  },

  async saveCatalogEntry(wsId: string, catalogId: string, entry: EntradaCatalogo): Promise<EntradaCatalogo> {
    if (_isLive) {
      return gas().call<EntradaCatalogo>("builder.saveCatalogEntry", { wsId, catalogId, entry });
    }
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
    if (_isLive) {
      await gas().call<void>("builder.deleteCatalogEntry", { wsId, catalogId, entryId });
      return;
    }
    const catalog = _store.get(_key(wsId, "catalog", catalogId)) as CatalogConfig | undefined;
    if (!catalog) return;
    catalog.entradas  = catalog.entradas.filter((e) => e.id !== entryId);
    catalog.updatedAt = new Date().toISOString();
    _store.set(_key(wsId, "catalog", catalogId), catalog);
  },

  async getProcessList(wsId: string): Promise<ProcessConfig[]> {
    if (_isLive) {
      return gas().call<ProcessConfig[]>("builder.getProcessList", { wsId });
    }
    return BuilderSDK.list<ProcessConfig>(wsId, "process");
  },

  async getFormList(wsId: string): Promise<FormConfig[]> {
    if (_isLive) {
      return gas().call<FormConfig[]>("builder.getFormList", { wsId });
    }
    return BuilderSDK.list<FormConfig>(wsId, "form");
  },

  async getKPIList(wsId: string): Promise<KPIConfig[]> {
    if (_isLive) {
      return gas().call<KPIConfig[]>("builder.getKPIList", { wsId });
    }
    return BuilderSDK.list<KPIConfig>(wsId, "kpi");
  },

  async getNotificationList(wsId: string): Promise<NotificationConfig[]> {
    if (_isLive) {
      return gas().call<NotificationConfig[]>("builder.getNotificationList", { wsId });
    }
    return BuilderSDK.list<NotificationConfig>(wsId, "notification");
  },

  async getVersionHistory(wsId: string, id: string): Promise<Array<{ version: number; status: string; createdAt: string }>> {
    if (_isLive) {
      return gas().call("builder.getVersionHistory", { wsId, id });
    }
    return []; // mock: no history
  },

  async restoreVersion<T extends BuilderConfig>(wsId: string, id: string, version: number): Promise<T> {
    if (_isLive) {
      return gas().call<T>("builder.restoreVersion", { wsId, id, version });
    }
    throw new Error("restoreVersion not available in mock mode");
  },
};
