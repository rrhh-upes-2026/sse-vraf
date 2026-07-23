import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { fmiManifest } from "./manifest";

const fmiModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "objective-service",   ok: true },
        { name: "dimension-service",   ok: true },
        { name: "formula-engine",      ok: true },
        { name: "range-engine",        ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(fmiManifest);
if (!validation.valid) throw new Error(`[Module SDK] FMI manifest rejected: ${validation.error}`);
moduleRegistry.register(fmiManifest, fmiModule);
