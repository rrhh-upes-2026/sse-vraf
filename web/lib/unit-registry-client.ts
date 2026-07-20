/**
 * Unit Registry API client — thin wrapper around registry.* GAS actions.
 *
 * All calls route through the existing /api/apps-script proxy, so no new
 * API routes are needed. Import and use from server components or hooks.
 */

import type {
  UnitDefinition,
  NavigationItem,
  WorkflowDefinition,
  ReportDefinition,
  CatalogDefinition,
  UnitPermissions,
  UnitSettings,
  AllNavigation,
} from "./unit-types";

// ── Internal fetch helper ─────────────────────────────────────────────────────

async function callRegistry<T>(
  verb: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch("/api/apps-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: `registry.${verb}`, params }),
  });

  if (!response.ok) {
    throw new Error(`registry.${verb} HTTP ${response.status}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.errors?.[0]?.message ?? `registry.${verb} failed`);
  }

  return json.data as T;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Return the full definition of every registered unit. */
export async function listUnits(): Promise<UnitDefinition[]> {
  return callRegistry<UnitDefinition[]>("listUnits");
}

/** Return the definition for a single unit by key. */
export async function getUnit(unitKey: string): Promise<UnitDefinition | null> {
  return callRegistry<UnitDefinition | null>("getUnit", { unitKey });
}

/**
 * Return navigation items for a single unit, filtered by the caller's role.
 * Pass userRole = undefined to receive unfiltered (admin-level) nav.
 */
export async function getNavigation(
  unitKey: string,
  userRole?: string
): Promise<NavigationItem[]> {
  return callRegistry<NavigationItem[]>("getNavigation", { unitKey, userRole });
}

/**
 * Return navigation for ALL enabled units, keyed by unit key.
 * Used to build the global sidebar without unit-specific code on the frontend.
 */
export async function getAllNavigation(
  userRole?: string
): Promise<AllNavigation> {
  return callRegistry<AllNavigation>("getAllNavigation", { userRole });
}

/** Return the list of enabled module keys for a unit. */
export async function getModules(unitKey: string): Promise<string[]> {
  return callRegistry<string[]>("getModules", { unitKey });
}

/** Return all workflow definitions registered for a unit. */
export async function getWorkflows(
  unitKey: string
): Promise<WorkflowDefinition[]> {
  return callRegistry<WorkflowDefinition[]>("getWorkflows", { unitKey });
}

/** Return report definitions, optionally filtered by role. */
export async function getReports(
  unitKey: string,
  userRole?: string
): Promise<ReportDefinition[]> {
  return callRegistry<ReportDefinition[]>("getReports", { unitKey, userRole });
}

/** Return catalog definitions for a unit. */
export async function getCatalogs(
  unitKey: string
): Promise<CatalogDefinition[]> {
  return callRegistry<CatalogDefinition[]>("getCatalogs", { unitKey });
}

/** Return the role-permission matrix for a unit. */
export async function getPermissions(
  unitKey: string
): Promise<UnitPermissions> {
  return callRegistry<UnitPermissions>("getPermissions", { unitKey });
}

/** Return the unit's settings object. */
export async function getSettings(unitKey: string): Promise<UnitSettings> {
  return callRegistry<UnitSettings>("getSettings", { unitKey });
}
