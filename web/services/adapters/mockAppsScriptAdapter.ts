import type { EntityName, IAppsScriptClient, ListQuery } from "./types";
import {
  mockActividades,
  mockCapacitaciones,
  mockEmpleados,
  mockEvaluaciones,
  mockEvidencias,
  mockFormularios,
  mockIndicadores,
  mockNotificaciones,
  mockObjetivos,
  mockPlanes,
  mockProcesos,
  mockProyectos,
  mockSolicitudes,
  mockSolicitudesContratacion,
  mockUnidades,
  mockUsuarios,
} from "@/lib/mock-data";
import { mockWorkflowBlueprints, mockWorkflowInstances } from "@/lib/mock-workflow-data";
import { mockBlueprintRegistry, mockInstanceSummaries } from "@/lib/mock-studio-data";

type Row = { id: string } & Record<string, unknown>;

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedFor(entity: EntityName): Row[] {
  switch (entity) {
    case "planes":
      return mockPlanes as unknown as Row[];
    case "objetivos":
      return mockObjetivos as unknown as Row[];
    case "proyectos":
      return mockProyectos as unknown as Row[];
    case "procesos":
      return mockProcesos as unknown as Row[];
    case "actividades":
      return mockActividades as unknown as Row[];
    case "evidencias":
      return mockEvidencias as unknown as Row[];
    case "indicadores":
      return mockIndicadores as unknown as Row[];
    case "solicitudes":
      return mockSolicitudes as unknown as Row[];
    case "usuarios":
      return mockUsuarios as unknown as Row[];
    case "unidades":
      return mockUnidades as unknown as Row[];
    case "formularios":
      return mockFormularios as unknown as Row[];
    case "empleados":
      return mockEmpleados as unknown as Row[];
    case "capacitaciones":
      return mockCapacitaciones as unknown as Row[];
    case "evaluaciones":
      return mockEvaluaciones as unknown as Row[];
    case "solicitudesContratacion":
      return mockSolicitudesContratacion as unknown as Row[];
    case "notificaciones":
      return mockNotificaciones as unknown as Row[];
    case "workflowBlueprints":
      return mockWorkflowBlueprints as unknown as Row[];
    case "workflowInstances":
      return mockWorkflowInstances as unknown as Row[];
    case "blueprintRegistry":
      return mockBlueprintRegistry as unknown as Row[];
    case "instanceSummaries":
      return mockInstanceSummaries as unknown as Row[];
    case "historial":
      return [];
    default:
      return [];
  }
}

function matchesQuery(row: Row, query?: ListQuery) {
  if (!query) return true;
  return Object.entries(query).every(([key, value]) => {
    if (value === undefined) return true;
    return row[key] === value;
  });
}

/**
 * In-memory stand-in for the Apps Script Web App. Same contract as
 * HttpAppsScriptAdapter, so every consumer above this layer is unaffected
 * when the real backend replaces it (see getAppsScriptClient()).
 */
export class MockAppsScriptAdapter implements IAppsScriptClient {
  private store = new Map<EntityName, Row[]>();

  private table(entity: EntityName): Row[] {
    if (!this.store.has(entity)) {
      this.store.set(entity, [...seedFor(entity)]);
    }
    return this.store.get(entity)!;
  }

  async list<T>(entity: EntityName, query?: ListQuery): Promise<T[]> {
    await delay();
    return this.table(entity).filter((row) => matchesQuery(row, query)) as unknown as T[];
  }

  async get<T>(entity: EntityName, id: string): Promise<T | null> {
    await delay();
    return (this.table(entity).find((row) => row.id === id) as unknown as T) ?? null;
  }

  async create<T extends { id?: string }>(entity: EntityName, payload: Partial<T>): Promise<T> {
    await delay();
    const table = this.table(entity);
    const id = (payload as Row).id ?? `${entity.toUpperCase()}-${table.length + 1}`;
    const row = { ...payload, id } as Row;
    table.push(row);
    return row as unknown as T;
  }

  async update<T>(entity: EntityName, id: string, patch: Partial<T>): Promise<T> {
    await delay();
    const table = this.table(entity);
    const idx = table.findIndex((row) => row.id === id);
    if (idx === -1) throw new Error(`${entity} ${id} no encontrado`);
    table[idx] = { ...table[idx], ...patch } as Row;
    return table[idx] as unknown as T;
  }

  async remove(entity: EntityName, id: string): Promise<void> {
    await delay();
    const table = this.table(entity);
    const idx = table.findIndex((row) => row.id === id);
    if (idx !== -1) table.splice(idx, 1);
  }

  async call<T>(action: string, params?: Record<string, unknown>): Promise<T> {
    await delay();
    const [entity, verb] = action.split(".");
    const entityName = entity as EntityName;

    switch (verb) {
      case "publish":
      case "archive":
      case "restore": {
        const id = params?.id as string;
        const lc = verb === "restore" ? "draft" : verb;
        return this.update<T>(entityName, id, { lifecycle: lc } as unknown as Partial<T>);
      }
      case "duplicate": {
        const id = params?.id as string;
        const original = await this.get<Row>(entityName, id);
        if (!original) throw new Error(`${entityName} ${id} not found`);
        const copy: Row = {
          ...original,
          id: `${entityName.toUpperCase()}-COPY-${Date.now()}`,
          nombre: `Copia de ${(original as Record<string, unknown>).nombre ?? ""}`,
          lifecycle: "draft",
        };
        const table = this.table(entityName);
        table.push(copy);
        return copy as unknown as T;
      }
      case "toggleActive": {
        const id = params?.id as string;
        const row = await this.get<Row>(entityName, id);
        if (!row) throw new Error(`${entityName} ${id} not found`);
        const active = !(row.active === true || row.active === "true" || row.activo === true || row.activo === "true");
        return this.update<T>(entityName, id, { active, activo: active } as unknown as Partial<T>);
      }
      case "recordKPIValue": {
        const id = params?.id as string;
        return this.update<T>(entityName, id, { valorActual: params?.valor } as unknown as Partial<T>);
      }
      case "recordExecution": {
        const id = params?.id as string;
        const row = await this.get<Row>(entityName, id);
        if (!row) throw new Error(`${entityName} ${id} not found`);
        const count = (Number(row.executionCount) || 0) + 1;
        return this.update<T>(entityName, id, { executionCount: count, lastStatus: params?.status } as unknown as Partial<T>);
      }
      case "getHistory": {
        const id = params?.id as string;
        const row = await this.get<Row>(entityName, id);
        return (row ? [] : []) as unknown as T;
      }
      default:
        throw new Error(`MockAppsScriptAdapter: unknown action ${action}`);
    }
  }
}
