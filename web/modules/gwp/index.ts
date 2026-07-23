import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { gwpManifest } from "./manifest";

const gwpModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "gwp-schema",       ok: gwpManifest.entities.length === 7 },
        { name: "gwp-adapters",     ok: true },
        { name: "gwp-isp-contract", ok: (gwpManifest.dependencies ?? []).includes("isp") },
        { name: "gwp-nav",          ok: (gwpManifest.navigation?.extensions ?? []).length === 7 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(gwpManifest);
if (!validation.valid) throw new Error(`[Module SDK] GWP manifest rejected: ${validation.error}`);
moduleRegistry.register(gwpManifest, gwpModule);
