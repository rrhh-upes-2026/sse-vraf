"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EntityService } from "@/services/entityService";
import type { ListQuery } from "@/services/adapters/types";

/**
 * Generic Hooks-layer wrapper around an EntityService. Feature code should
 * call these (or a thin named wrapper like `useProcesos`) instead of
 * reaching into services/ directly, so components stay agnostic of
 * TanStack Query specifics.
 *
 * For new domains, prefer createEntityHooks() over copy-pasting the three-function pattern.
 */
export function useEntityList<T>(key: string, service: EntityService<T>, query?: ListQuery) {
  return useQuery({
    queryKey: [key, "list", query],
    queryFn: () => service.list(query),
  });
}

export function useEntityItem<T>(key: string, service: EntityService<T>, id: string | undefined) {
  return useQuery({
    queryKey: [key, "item", id],
    queryFn: () => service.get(id as string),
    enabled: Boolean(id),
  });
}

export function useEntityMutations<T extends { id: string }>(
  key: string,
  service: EntityService<T>,
) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [key] });

  const create = useMutation({
    mutationFn: (payload: Partial<T>) => service.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<T> }) => service.update(id, patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

/**
 * Factory that produces the standard (useList, useItem, useActions) triple for
 * any entity. New domain modules should use this instead of the three-function
 * boilerplate — it keeps future entity hooks to a single statement.
 */
export function createEntityHooks<T extends { id: string }>(
  key: string,
  service: EntityService<T>,
) {
  function useList(query?: ListQuery) {
    return useEntityList<T>(key, service, query);
  }
  function useItem(id?: string) {
    return useEntityItem<T>(key, service, id);
  }
  function useActions() {
    return useEntityMutations<T>(key, service);
  }
  return { useList, useItem, useActions };
}
