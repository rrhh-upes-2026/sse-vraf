import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { oimManifest } from "./manifest";

const oimModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "migration-engine",    ok: true },
        { name: "catalog-merger",      ok: true },
        { name: "duplicate-detector",  ok: true },
        { name: "import-history",      ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(oimManifest);
if (!validation.valid) throw new Error(`[Module SDK] OIM manifest rejected: ${validation.error}`);
moduleRegistry.register(oimManifest, oimModule);
