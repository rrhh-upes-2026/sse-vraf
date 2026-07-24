import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  OIMPreviewRow,
  OIMMigrationReport,
  OIMImportHistory,
  OIMRunParams,
} from "@/types/oim";

const WS = "oim";
const c = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

export const runOIMMigration    = (params: OIMRunParams)  => c().call<OIMMigrationReport>(`${WS}.runMigration`,    p(params));
export const getOIMPreview      = ()                       => c().call<OIMPreviewRow[]>(`${WS}.getPreview`,         {});
export const listOIMReports     = ()                       => c().call<OIMImportHistory[]>(`${WS}.listReports`,     {});
export const mergeOIMCatalogs   = ()                       => c().call<{ merged: number; skipped: number }>(`${WS}.mergeVRAFCatalogs`, {});
