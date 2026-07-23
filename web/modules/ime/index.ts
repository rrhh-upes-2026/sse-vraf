import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { imeManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const imeModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",    ok: true },
        { name: "entities",    ok: imeManifest.entities.length > 0 },
        { name: "permissions", ok: imeManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(imeManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] IME manifest rejected: ${validation.error}`);
}

moduleRegistry.register(imeManifest, imeModule);
