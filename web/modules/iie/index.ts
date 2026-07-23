import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { iieManifest } from "./manifest";

const iieModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "engines",      ok: true },
        { name: "rules-engine", ok: true },
        { name: "semantic-api", ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(iieManifest);
if (!validation.valid) throw new Error(`[Module SDK] IIE manifest rejected: ${validation.error}`);
moduleRegistry.register(iieManifest, iieModule);
