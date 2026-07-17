"use client";

/**
 * TanStack Query hooks for the No-Code Builder SDK.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BuilderSDK } from "@/services/builder-sdk";
import type { BuilderConfig, BuilderTipo } from "@/types/builders";

// ── Query keys ────────────────────────────────────────────────────────────────

export const BUILDER_KEYS = {
  all:  ["builders"] as const,
  list: (wsId: string, tipo: BuilderTipo) => ["builders", wsId, tipo] as const,
  item: (wsId: string, tipo: BuilderTipo, id: string) => ["builders", wsId, tipo, id] as const,
};

// ── List ──────────────────────────────────────────────────────────────────────

export function useBuilderList<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo) {
  return useQuery({
    queryKey: BUILDER_KEYS.list(wsId, tipo),
    queryFn: () => BuilderSDK.list<T>(wsId, tipo),
  });
}

// ── Single item ───────────────────────────────────────────────────────────────

export function useBuilderItem<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo, id: string | null) {
  return useQuery({
    queryKey: BUILDER_KEYS.item(wsId, tipo, id ?? ""),
    queryFn: () => BuilderSDK.get<T>(wsId, tipo, id!),
    enabled: !!id,
  });
}

// ── Save ──────────────────────────────────────────────────────────────────────

export function useBuilderSave<T extends BuilderConfig>(wsId: string, tipo: BuilderTipo) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: Omit<T, "createdAt" | "updatedAt"> & { id?: string }) =>
      BuilderSDK.save<T>(wsId, config as Parameters<typeof BuilderSDK.save<T>>[1]),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: BUILDER_KEYS.list(wsId, tipo) });
      qc.setQueryData(BUILDER_KEYS.item(wsId, tipo, saved.id), saved);
    },
  });
}

// ── Publish ───────────────────────────────────────────────────────────────────

export function useBuilderPublish(wsId: string, tipo: BuilderTipo) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BuilderSDK.publish(wsId, tipo, id),
    onSuccess: (published) => {
      qc.invalidateQueries({ queryKey: BUILDER_KEYS.list(wsId, tipo) });
      qc.setQueryData(BUILDER_KEYS.item(wsId, tipo, published.id), published);
    },
  });
}

// ── Duplicate ─────────────────────────────────────────────────────────────────

export function useBuilderDuplicate(wsId: string, tipo: BuilderTipo) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BuilderSDK.duplicate(wsId, tipo, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUILDER_KEYS.list(wsId, tipo) });
    },
  });
}

// ── Archive ───────────────────────────────────────────────────────────────────

export function useBuilderArchive(wsId: string, tipo: BuilderTipo) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BuilderSDK.archive(wsId, tipo, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUILDER_KEYS.list(wsId, tipo) });
    },
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function useBuilderDelete(wsId: string, tipo: BuilderTipo) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BuilderSDK.delete(wsId, tipo, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUILDER_KEYS.list(wsId, tipo) });
    },
  });
}

// ── Version history ───────────────────────────────────────────────────────────

export function useBuilderVersionHistory(wsId: string, id: string | null) {
  return useQuery({
    queryKey: ["builders", wsId, "versions", id ?? ""],
    queryFn: () => BuilderSDK.getVersionHistory(wsId, id!),
    enabled: !!id,
  });
}
