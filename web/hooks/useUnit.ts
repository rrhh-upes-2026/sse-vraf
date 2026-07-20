"use client";

/**
 * useUnit — React hook for consuming Organizational Unit context.
 *
 * Fetches unit definition, navigation, and optional sub-resources from the
 * registry. Results are cached by SWR key so concurrent consumers share
 * the same fetch. Falls back gracefully when the backend is unavailable or
 * the unit key is not yet registered.
 *
 * Usage:
 *   const { unit, navigation, isLoading } = useUnit("rrhh");
 *   const { workflows } = useUnit("rrhh", { include: ["workflows"] });
 */

import { useState, useEffect } from "react";
import type {
  UnitDefinition,
  NavigationItem,
  WorkflowDefinition,
  ReportDefinition,
  CatalogDefinition,
} from "@/lib/unit-types";

export interface UseUnitOptions {
  /** Which sub-resources to fetch alongside the base unit definition. */
  include?: Array<"navigation" | "workflows" | "reports" | "catalogs">;
  /** Caller's role — used to filter nav items and reports. */
  userRole?: string;
  /** Workspace id passed to permission-gated queries. */
  wsId?: string;
}

export interface UseUnitResult {
  unit: UnitDefinition | null;
  navigation: NavigationItem[];
  workflows: WorkflowDefinition[];
  reports: ReportDefinition[];
  catalogs: CatalogDefinition[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Simple in-memory request cache keyed by cache key string.
const _cache = new Map<string, { ts: number; value: unknown }>();
const CACHE_TTL_MS = 60_000;

async function appsScriptCall<T>(
  action: string,
  params: Record<string, unknown>
): Promise<T> {
  const res = await fetch("/api/apps-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  if (!res.ok) throw new Error(`${action} HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success)
    throw new Error(json.errors?.[0]?.message ?? `${action} failed`);
  return json.data as T;
}

async function cachedCall<T>(
  cacheKey: string,
  action: string,
  params: Record<string, unknown>
): Promise<T> {
  const now = Date.now();
  const cached = _cache.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL_MS) return cached.value as T;
  const value = await appsScriptCall<T>(action, params);
  _cache.set(cacheKey, { ts: now, value });
  return value;
}

export function useUnit(
  unitKey: string,
  options: UseUnitOptions = {}
): UseUnitResult {
  const { include = [], userRole, wsId } = options;

  const [state, setState] = useState<Omit<UseUnitResult, "refetch">>({
    unit: null,
    navigation: [],
    workflows: [],
    reports: [],
    catalogs: [],
    isLoading: true,
    error: null,
  });

  const [tick, setTick] = useState(0);
  const refetch = () => setTick((t) => t + 1);

  useEffect(() => {
    if (!unitKey) return;
    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const roleKey = userRole ?? "any";
        const baseParams: Record<string, unknown> = { unitKey };
        if (wsId) baseParams.wsId = wsId;

        const [unit, navigation, workflows, reports, catalogs] =
          await Promise.all([
            cachedCall<UnitDefinition | null>(
              `unit:${unitKey}`,
              "registry.getUnit",
              baseParams
            ),
            include.includes("navigation") || true
              ? cachedCall<NavigationItem[]>(
                  `nav:${unitKey}:${roleKey}`,
                  "registry.getNavigation",
                  { ...baseParams, userRole }
                )
              : Promise.resolve<NavigationItem[]>([]),
            include.includes("workflows")
              ? cachedCall<WorkflowDefinition[]>(
                  `workflows:${unitKey}`,
                  "registry.getWorkflows",
                  baseParams
                )
              : Promise.resolve<WorkflowDefinition[]>([]),
            include.includes("reports")
              ? cachedCall<ReportDefinition[]>(
                  `reports:${unitKey}:${roleKey}`,
                  "registry.getReports",
                  { ...baseParams, userRole }
                )
              : Promise.resolve<ReportDefinition[]>([]),
            include.includes("catalogs")
              ? cachedCall<CatalogDefinition[]>(
                  `catalogs:${unitKey}`,
                  "registry.getCatalogs",
                  baseParams
                )
              : Promise.resolve<CatalogDefinition[]>([]),
          ]);

        if (!cancelled) {
          setState({
            unit,
            navigation,
            workflows,
            reports,
            catalogs,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitKey, userRole, wsId, tick]);

  return { ...state, refetch };
}
