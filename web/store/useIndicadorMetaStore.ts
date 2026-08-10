"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IndicadorMeta {
  descripcion?: string;
  formula?: string;
  fechaEntrega?: string; // ISO date YYYY-MM-DD — stored locally only
}

interface IndicadorMetaState {
  overrides: Record<string, IndicadorMeta>; // key: `${wsId}:${indicadorId}`
  setMeta(wsId: string, indicadorId: string, meta: IndicadorMeta): void;
  getMeta(wsId: string, indicadorId: string): IndicadorMeta;
}

export const useIndicadorMetaStore = create<IndicadorMetaState>()(
  persist(
    (set, get) => ({
      overrides: {},
      setMeta(wsId, indicadorId, meta) {
        const key = `${wsId}:${indicadorId}`;
        set((s) => ({
          overrides: {
            ...s.overrides,
            [key]: { ...s.overrides[key], ...meta },
          },
        }));
      },
      getMeta(wsId, indicadorId) {
        return get().overrides[`${wsId}:${indicadorId}`] ?? {};
      },
    }),
    { name: "sse-vraf-indicador-meta" },
  ),
);
