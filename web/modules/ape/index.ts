import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { apeManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const apeModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",    ok: true },
        { name: "entities",    ok: apeManifest.entities.length > 0 },
        { name: "permissions", ok: apeManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(apeManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] APE manifest rejected: ${validation.error}`);
}

moduleRegistry.register(apeManifest, apeModule);
