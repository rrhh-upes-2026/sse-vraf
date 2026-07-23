import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { pmeManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const pmeModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",    ok: true },
        { name: "entities",    ok: pmeManifest.entities.length > 0 },
        { name: "permissions", ok: pmeManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(pmeManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] PME manifest rejected: ${validation.error}`);
}

moduleRegistry.register(pmeManifest, pmeModule);
