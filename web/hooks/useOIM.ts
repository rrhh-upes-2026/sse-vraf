"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  runOIMMigration,
  getOIMPreview,
  listOIMReports,
  mergeOIMCatalogs,
} from "@/services/oim";
import type { OIMRunParams } from "@/types/oim";

const K = {
  preview: ["oim", "preview"]        as const,
  reports: ["oim", "reports"]        as const,
};

export function useOIMPreview() {
  return useQuery({ queryKey: K.preview, queryFn: getOIMPreview });
}

export function useOIMReports() {
  return useQuery({ queryKey: K.reports, queryFn: listOIMReports });
}

export function useRunOIMMigration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: OIMRunParams) => runOIMMigration(params),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["oim", "reports"] });
      void qc.invalidateQueries({ queryKey: ["ide"] });
    },
  });
}

export function useMergeOIMCatalogs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mergeOIMCatalogs,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["fmi"] });
    },
  });
}
