import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { rrhhManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const rrhhModule: ModuleAPI = {
  async initialize() {
    // No async initialization required for RRHH v1.
  },
  async shutdown() {
    // No teardown required.
  },
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest", ok: true },
        { name: "entities", ok: rrhhManifest.entities.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(rrhhManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] RRHH manifest rejected: ${validation.error}`);
}

moduleRegistry.register(rrhhManifest, rrhhModule);
