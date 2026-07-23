import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { cpeManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const cpeModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",    ok: true },
        { name: "entities",    ok: cpeManifest.entities.length > 0 },
        { name: "permissions", ok: cpeManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(cpeManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] CPE manifest rejected: ${validation.error}`);
}

moduleRegistry.register(cpeManifest, cpeModule);
