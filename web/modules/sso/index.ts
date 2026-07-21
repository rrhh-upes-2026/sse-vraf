import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { ssoManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const ssoModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",    ok: true },
        { name: "entities",    ok: ssoManifest.entities.length > 0 },
        { name: "permissions", ok: ssoManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(ssoManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] SSO manifest rejected: ${validation.error}`);
}

moduleRegistry.register(ssoManifest, ssoModule);
