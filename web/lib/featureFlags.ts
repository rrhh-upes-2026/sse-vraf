/**
 * Feature Flag service. Flags are read from NEXT_PUBLIC_FLAG_* environment
 * variables — no code change required to toggle features between deployments.
 *
 * To enable a flag:
 *   In .env.local (development):  NEXT_PUBLIC_FLAG_STUDIO=true
 *   In Vercel project settings:   Add the env var and redeploy
 *
 * All flags default to false (disabled) unless explicitly set to "true" or "1".
 * Sprint 3 (Mi Trabajo) is always enabled — it's the base module.
 */

export type FeatureFlag =
  | "studio.enabled"
  | "reports.enabled"
  | "dashboard.enabled"
  | "processBuilder.enabled"
  | "formBuilder.enabled"
  | "dataStudio.enabled"
  | "miTrabajo.enabled"
  | "miTrabajo.indicators"
  | "miTrabajo.alerts"
  | "miTrabajo.quickActions"
  | "rrhh.enabled"
  | "rrhh.employees"
  | "rrhh.hiring"
  | "rrhh.training"
  | "rrhh.evaluations"
  | "rrhh.commandPalette"
  | "rrhh.notifications"
  | "rrhh.globalSearch";

const FLAG_ENV_MAP: Record<FeatureFlag, string> = {
  "miTrabajo.enabled":      "NEXT_PUBLIC_FLAG_MI_TRABAJO",
  "miTrabajo.indicators":   "NEXT_PUBLIC_FLAG_MI_TRABAJO_INDICATORS",
  "miTrabajo.alerts":       "NEXT_PUBLIC_FLAG_MI_TRABAJO_ALERTS",
  "miTrabajo.quickActions": "NEXT_PUBLIC_FLAG_MI_TRABAJO_QUICK_ACTIONS",
  "studio.enabled":         "NEXT_PUBLIC_FLAG_STUDIO",
  "reports.enabled":        "NEXT_PUBLIC_FLAG_REPORTS",
  "dashboard.enabled":      "NEXT_PUBLIC_FLAG_DASHBOARD",
  "processBuilder.enabled": "NEXT_PUBLIC_FLAG_PROCESS_BUILDER",
  "formBuilder.enabled":    "NEXT_PUBLIC_FLAG_FORM_BUILDER",
  "dataStudio.enabled":     "NEXT_PUBLIC_FLAG_DATA_STUDIO",
  "rrhh.enabled":           "NEXT_PUBLIC_FLAG_RRHH",
  "rrhh.employees":         "NEXT_PUBLIC_FLAG_RRHH_EMPLOYEES",
  "rrhh.hiring":            "NEXT_PUBLIC_FLAG_RRHH_HIRING",
  "rrhh.training":          "NEXT_PUBLIC_FLAG_RRHH_TRAINING",
  "rrhh.evaluations":       "NEXT_PUBLIC_FLAG_RRHH_EVALUATIONS",
  "rrhh.commandPalette":    "NEXT_PUBLIC_FLAG_RRHH_COMMAND_PALETTE",
  "rrhh.notifications":     "NEXT_PUBLIC_FLAG_RRHH_NOTIFICATIONS",
  "rrhh.globalSearch":      "NEXT_PUBLIC_FLAG_RRHH_GLOBAL_SEARCH",
};

// Flags that are always enabled — these are core platform capabilities, not optional modules.
const ALWAYS_ENABLED = new Set<FeatureFlag>([
  "miTrabajo.enabled",
  "miTrabajo.indicators",
  "miTrabajo.alerts",
  "miTrabajo.quickActions",
]);

/**
 * Check whether a feature flag is enabled. Safe to call on both server and
 * client (NEXT_PUBLIC_* vars are inlined at build time on the client).
 *
 * Mi Trabajo is always enabled — it is the base platform module.
 * All other flags require an explicit env var: NEXT_PUBLIC_FLAG_* = "true" | "1"
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  if (ALWAYS_ENABLED.has(flag)) return true;
  const envKey = FLAG_ENV_MAP[flag];
  if (!envKey) return false;
  const val = process.env[envKey];
  return val === "true" || val === "1";
}
