import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { aeeManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const aeeModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",    ok: true },
        { name: "entities",    ok: aeeManifest.entities.length > 0 },
        { name: "permissions", ok: aeeManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(aeeManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] AEE manifest rejected: ${validation.error}`);
}

moduleRegistry.register(aeeManifest, aeeModule);
