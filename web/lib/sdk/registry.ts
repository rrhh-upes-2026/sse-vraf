import type {
  WorkspaceUnit,
  NavigationExtension,
  ModuleManifest,
  ModuleAPI,
  RegisteredModule,
} from "./types";

// Module-level Map — O(1) lookup, singleton per JS context (server or client).
const _modules = new Map<string, RegisteredModule>();

export const moduleRegistry = {
  /**
   * Register a module. Idempotent: a second call with the same id is a no-op.
   * Call this as a side-effect import from modules/_registry.ts.
   */
  register(manifest: ModuleManifest, api: ModuleAPI): void {
    if (_modules.has(manifest.id)) return;
    _modules.set(manifest.id, {
      manifest,
      api,
      registeredAt: new Date().toISOString(),
    });
  },

  getAll(): RegisteredModule[] {
    return Array.from(_modules.values());
  },

  getById(id: string): RegisteredModule | undefined {
    return _modules.get(id);
  },

  /** Workspace units contributed by enabled modules (excludes Core's built-in VRAF). */
  getWorkspaceUnits(): WorkspaceUnit[] {
    return Array.from(_modules.values())
      .filter((m) => m.manifest.status === "enabled")
      .map((m) => m.manifest.workspace);
  },

  getWorkspaceUnit(id: string): WorkspaceUnit | undefined {
    return Array.from(_modules.values()).find(
      (m) => m.manifest.workspace.id === id && m.manifest.status === "enabled",
    )?.manifest.workspace;
  },

  /** True if any enabled module owns this workspace id. */
  isModuleWorkspace(id: string): boolean {
    return Array.from(_modules.values()).some(
      (m) => m.manifest.workspace.id === id && m.manifest.status === "enabled",
    );
  },

  /** Navigation extensions contributed by the module that owns `workspaceId`. */
  getNavigationExtensions(workspaceId: string): NavigationExtension[] {
    for (const mod of _modules.values()) {
      if (
        mod.manifest.workspace.id === workspaceId &&
        mod.manifest.status === "enabled"
      ) {
        return [...mod.manifest.navigation.extensions].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
      }
    }
    return [];
  },
};
