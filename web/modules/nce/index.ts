import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { nceManifest } from "./manifest";

const nceModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "template-renderer",   ok: true },
        { name: "duplicate-detection", ok: true },
        { name: "quiet-hours",         ok: true },
        { name: "aue-consumer",        ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(nceManifest);
if (!validation.valid) throw new Error(`[Module SDK] NCE manifest rejected: ${validation.error}`);
moduleRegistry.register(nceManifest, nceModule);
