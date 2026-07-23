import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { eipManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const eipModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",     ok: true },
        { name: "permissions",  ok: eipManifest.permissions.length > 0 },
        { name: "read-only",    ok: eipManifest.entities.length === 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(eipManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] EIP manifest rejected: ${validation.error}`);
}

moduleRegistry.register(eipManifest, eipModule);
