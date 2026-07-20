/**
 * TypeScript interfaces for the Organizational Domain Framework.
 *
 * These mirror the UnitDefinition shape returned by the GAS OrgUnitRegistry.
 * Handler functions are replaced with { registered: true } by _safeExport_
 * before serialisation, so they never appear here.
 */

export interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  requiredRoles?: string[];
  comingSoon?: boolean;
  children?: NavigationItem[];
}

export interface WorkflowStep {
  etapa: string;
  paso: number;
  label: string;
  nextEtapa: string | null;
  requiredDocs: string[];
  handler?: string;
}

export interface WorkflowDefinition {
  key: string;
  label: string;
  entity: string;
  initialEtapa: string;
  steps: WorkflowStep[];
}

export interface AutomationDefinition {
  key: string;
  label: string;
  trigger: string;
  action: string;
  active: boolean;
  config: Record<string, unknown>;
}

export interface ReportDefinition {
  key: string;
  label: string;
  description?: string;
  entity: string;
  requiredRoles: string[];
  format: "table" | "chart" | "table_chart";
}

export interface CatalogDefinition {
  key: string;
  label: string;
  values: string[];
}

export interface UnitOwner {
  rol: string;
  label: string;
}

export interface UnitRole {
  key: string;
  label: string;
}

export interface UnitPermissions {
  [role: string]: string[];
}

export interface UnitSettings {
  [key: string]: string | number | boolean;
}

export interface HandlerRef {
  registered: true;
}

export interface UnitDefinition {
  key: string;
  label: string;
  description: string;
  version: string;
  enabled: boolean;
  icon: string;
  color: string;
  owner: UnitOwner;

  navigation: NavigationItem[];
  modules: string[];
  workflows: WorkflowDefinition[];
  automations: AutomationDefinition[];
  reports: ReportDefinition[];
  catalogs: CatalogDefinition[];
  permissions: UnitPermissions;
  roles: UnitRole[];
  entities: string[];
  settings: UnitSettings;

  /** Handler presence-only map returned by the safe serialiser. */
  handlers?: Record<string, HandlerRef>;
}

/** Flat map of all units keyed by unit key. */
export type UnitRegistry = Record<string, UnitDefinition>;

/** Navigation map returned by getAllNavigation. */
export type AllNavigation = Record<string, NavigationItem[]>;
