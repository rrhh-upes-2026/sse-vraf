import type { ModuleManifest } from "./types";
import { satisfies } from "./version";

/** Semver of the running Core — bump this on breaking Core changes. */
export const CORE_VERSION = "1.0.0";

export const ModuleLoader = {
  /**
   * Validate a manifest before registration.
   * Returns { valid: true } or { valid: false, error: string }.
   */
  validate(manifest: ModuleManifest): { valid: boolean; error?: string } {
    if (!manifest.id?.trim()) return { valid: false, error: "manifest.id is required" };
    if (!manifest.name?.trim()) return { valid: false, error: "manifest.name is required" };
    if (!manifest.version?.trim()) return { valid: false, error: "manifest.version is required" };
    if (!manifest.coreVersion?.trim()) {
      return { valid: false, error: "manifest.coreVersion is required" };
    }
    if (!manifest.workspace?.id?.trim()) {
      return { valid: false, error: "manifest.workspace.id is required" };
    }

    let compatible: boolean;
    try {
      compatible = satisfies(CORE_VERSION, manifest.coreVersion);
    } catch {
      return {
        valid: false,
        error: `manifest.coreVersion "${manifest.coreVersion}" is not a valid semver range`,
      };
    }

    if (!compatible) {
      return {
        valid: false,
        error: `Core v${CORE_VERSION} does not satisfy required range "${manifest.coreVersion}"`,
      };
    }

    return { valid: true };
  },
};
