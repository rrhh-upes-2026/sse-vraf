"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BlueprintRegistryService } from "@/services/studio";
import type { BlueprintMetadata, BlueprintLifecycleTransition } from "@/types/studio";
import { canTransition, applyTransition } from "@/lib/studio/blueprintLifecycle";

// ── query keys ────────────────────────────────────────────────────────────────

export const registryKeys = {
  all:    () => ["blueprintRegistry"] as const,
  list:   (filter?: { category?: string; status?: string }) =>
            ["blueprintRegistry", "list", filter] as const,
  detail: (id: string) => ["blueprintRegistry", "item", id] as const,
};

// ── hooks ─────────────────────────────────────────────────────────────────────

export function useBlueprintRegistry(filter?: { category?: string; status?: string }) {
  return useQuery({
    queryKey: registryKeys.list(filter),
    queryFn:  () => BlueprintRegistryService.list(filter),
  });
}

export function useBlueprint(blueprintId: string | undefined) {
  return useQuery({
    queryKey: registryKeys.detail(blueprintId ?? ""),
    queryFn:  () => BlueprintRegistryService.get(blueprintId as string),
    enabled:  Boolean(blueprintId),
  });
}

export function useBlueprintLifecycle(blueprintId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: registryKeys.all() });
  };

  const transition = useMutation({
    mutationFn: async ({
      blueprint,
      action,
    }: {
      blueprint: BlueprintMetadata;
      action: BlueprintLifecycleTransition;
    }) => {
      if (!canTransition(blueprint.status, action)) {
        throw new Error(
          `La transición "${action}" no está permitida desde el estado "${blueprint.status}".`,
        );
      }
      const newStatus = applyTransition(blueprint.status, action);
      return BlueprintRegistryService.update(blueprintId, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(action === "publish" && {
          publishedVersion: blueprint.currentVersion,
        }),
      });
    },
    onSuccess: invalidate,
  });

  const setMaturity = useMutation({
    mutationFn: (level: import("@/types/studio").MaturityLevel) =>
      BlueprintRegistryService.update(blueprintId, {
        maturityLevel: level,
        updatedAt: new Date().toISOString(),
      }),
    onSuccess: invalidate,
  });

  return { transition, setMaturity };
}
