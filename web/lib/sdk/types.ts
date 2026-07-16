export type ModuleStatus =
  | "installed"
  | "enabled"
  | "disabled"
  | "hidden"
  | "deprecated"
  | "uninstalled";

/** Workspace visual + identity metadata — used in module manifests and nav config. */
export interface WorkspaceUnit {
  id: string;
  short: string;
  full: string;
  color: string;
  bg: string;
  /** SVG path `d` attribute, 24×24 viewBox */
  icon: string;
}

/** Sidebar link contributed by a module for its workspace. */
export interface NavigationExtension {
  id: string;
  label: string;
  /** SVG path `d` attribute, 24×24 viewBox */
  icon: string;
  /** Path segment appended to /ws/[wsId]/ */
  href: string;
  /** Lower = higher in the list */
  order?: number;
}

export interface PermissionDefinition {
  key: string;
  description: string;
}

export interface EntityDefinition {
  id: string;
  sheetName: string;
  label: string;
}

export interface FeatureFlagDefinition {
  key: string;
  envVar: string;
  description: string;
}

/**
 * Declarative description of a module — identity, workspace, nav, permissions,
 * entities, feature flags, and inter-module dependencies.
 *
 * Invariants enforced by ModuleLoader.validate():
 *   - id, version, coreVersion must be non-empty strings
 *   - coreVersion must be a semver range satisfied by the running Core
 *   - workspace.id must be non-empty
 */
export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  /** Semver range the module requires from the Core (e.g. "^1.0.0"). */
  coreVersion: string;
  description: string;
  icon: string;
  workspace: WorkspaceUnit;
  permissions: PermissionDefinition[];
  entities: EntityDefinition[];
  navigation: {
    extensions: NavigationExtension[];
  };
  featureFlags: FeatureFlagDefinition[];
  /** IDs of other modules this module depends on (must be registered first). */
  dependencies: string[];
  status: ModuleStatus;
}

export interface ModuleHealthCheck {
  name: string;
  ok: boolean;
  message?: string;
}

export interface ModuleHealthResult {
  healthy: boolean;
  checks: ModuleHealthCheck[];
}

/** Lifecycle hooks the module must implement. */
export interface ModuleAPI {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  health(): Promise<ModuleHealthResult>;
}

/** A validated, registered module — what the registry stores. */
export interface RegisteredModule {
  manifest: ModuleManifest;
  api: ModuleAPI;
  registeredAt: string;
}
