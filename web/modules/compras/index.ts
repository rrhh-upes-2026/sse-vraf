import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { comprasManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const comprasModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest", ok: true },
        { name: "entities", ok: comprasManifest.entities.length > 0 },
        { name: "permissions", ok: comprasManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(comprasManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] Compras manifest rejected: ${validation.error}`);
}

moduleRegistry.register(comprasManifest, comprasModule);
