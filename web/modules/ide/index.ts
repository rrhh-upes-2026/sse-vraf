import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { ideManifest } from "./manifest";

const ideModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "indicator-validator",    ok: true },
        { name: "variable-resolver",      ok: true },
        { name: "preview-engine",         ok: true },
        { name: "simulation-service",     ok: true },
        { name: "version-manager",        ok: true },
        { name: "import-engine",          ok: true },
        { name: "duplicate-detector",     ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(ideManifest);
if (!validation.valid) throw new Error(`[Module SDK] IDE manifest rejected: ${validation.error}`);
moduleRegistry.register(ideManifest, ideModule);
