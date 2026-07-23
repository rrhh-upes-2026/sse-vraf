import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { emeManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const emeModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",    ok: true },
        { name: "entities",    ok: emeManifest.entities.length > 0 },
        { name: "permissions", ok: emeManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(emeManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] EME manifest rejected: ${validation.error}`);
}

moduleRegistry.register(emeManifest, emeModule);
