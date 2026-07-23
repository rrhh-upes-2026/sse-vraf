import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { ioeManifest } from "./manifest";

const ioeModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "orchestration-engine", ok: true },
        { name: "dependency-tracker",   ok: true },
        { name: "calendar-builder",     ok: true },
        { name: "auto-generation",      ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(ioeManifest);
if (!validation.valid) throw new Error(`[Module SDK] IOE manifest rejected: ${validation.error}`);
moduleRegistry.register(ioeManifest, ioeModule);
