"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EvidenciaIndicadorMeta {
  descripcion?: string; // What evidence should be uploaded for this indicator
}

interface EvidenciaMetaState {
  overrides: Record<string, EvidenciaIndicadorMeta>; // key: `${wsId}:${indicadorDriveId}`
  setMeta(wsId: string, indicadorId: string, meta: EvidenciaIndicadorMeta): void;
  getMeta(wsId: string, indicadorId: string): EvidenciaIndicadorMeta;
}

export const useEvidenciaMetaStore = create<EvidenciaMetaState>()(
  persist(
    (set, get) => ({
      overrides: {},
      setMeta(wsId, indicadorId, meta) {
        const key = `${wsId}:${indicadorId}`;
        set((s) => ({
          overrides: { ...s.overrides, [key]: { ...s.overrides[key], ...meta } },
        }));
      },
      getMeta(wsId, indicadorId) {
        return get().overrides[`${wsId}:${indicadorId}`] ?? {};
      },
    }),
    { name: "sse-vraf-evidencia-meta" },
  ),
);
