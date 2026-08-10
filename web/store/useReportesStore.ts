"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InformeAnalizado } from "@/services/reportes";

interface ReportesState {
  analyses: Record<string, InformeAnalizado>; // key: fileId
  setAnalysis(fileId: string, data: InformeAnalizado): void;
  getAnalysis(fileId: string): InformeAnalizado | undefined;
  removeAnalysis(fileId: string): void;
}

export const useReportesStore = create<ReportesState>()(
  persist(
    (set, get) => ({
      analyses: {},

      setAnalysis(fileId, data) {
        set((s) => ({ analyses: { ...s.analyses, [fileId]: data } }));
      },

      getAnalysis(fileId) {
        return get().analyses[fileId];
      },

      removeAnalysis(fileId) {
        set((s) => {
          const next = { ...s.analyses };
          delete next[fileId];
          return { analyses: next };
        });
      },
    }),
    { name: "sse-vraf-reportes" },
  ),
);
