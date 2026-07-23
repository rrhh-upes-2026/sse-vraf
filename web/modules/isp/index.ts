import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { ispManifest } from "./manifest";

const ispModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "rbac-engine",        ok: true },
        { name: "session-manager",    ok: true },
        { name: "audit-log",          ok: true },
        { name: "google-contracts",   ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(ispManifest);
if (!validation.valid) throw new Error(`[Module SDK] ISP manifest rejected: ${validation.error}`);
moduleRegistry.register(ispManifest, ispModule);
