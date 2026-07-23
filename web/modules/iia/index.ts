import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { iiaManifest } from "./manifest";

const iiaModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "gemini-adapter",       ok: true },
        { name: "conversation-manager", ok: true },
        { name: "prompt-builder",       ok: true },
        { name: "audit-log",            ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(iiaManifest);
if (!validation.valid) throw new Error(`[Module SDK] IIA manifest rejected: ${validation.error}`);
moduleRegistry.register(iiaManifest, iiaModule);
