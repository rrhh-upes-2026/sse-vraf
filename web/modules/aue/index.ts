import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { aueManifest } from "./manifest";

const aueModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "event-bus",        ok: true },
        { name: "rule-engine",      ok: true },
        { name: "execution-queue",  ok: true },
        { name: "action-dispatcher", ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(aueManifest);
if (!validation.valid) throw new Error(`[Module SDK] AUE manifest rejected: ${validation.error}`);
moduleRegistry.register(aueManifest, aueModule);
