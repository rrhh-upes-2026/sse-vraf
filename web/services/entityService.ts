import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type { EntityName, ListQuery } from "./adapters/types";

export interface EntityService<T> {
  list: (query?: ListQuery) => Promise<T[]>;
  get: (id: string) => Promise<T | null>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, patch: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

/**
 * Builds a typed CRUD service for one entity, bound to whichever adapter
 * getAppsScriptClient() currently resolves. Services carry no business
 * rules yet (R02/R03/etc. land with their owning feature sprint) — they
 * only exist so UI/Hooks never talk to the adapter directly.
 */
export function createEntityService<T extends { id: string }>(
  entity: EntityName,
): EntityService<T> {
  return {
    list: (query) => getAppsScriptClient().list<T>(entity, query),
    get: (id) => getAppsScriptClient().get<T>(entity, id),
    create: (payload) => getAppsScriptClient().create<T>(entity, payload),
    update: (id, patch) => getAppsScriptClient().update<T>(entity, id, patch),
    remove: (id) => getAppsScriptClient().remove(entity, id),
  };
}
