import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import type { ModuleAPI } from "@/lib/sdk/types";
import { iceManifest } from "./manifest";

const iceModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "period-service",     ok: true },
        { name: "capture-service",    ok: true },
        { name: "variable-capture",   ok: true },
        { name: "approval-flow",      ok: true },
        { name: "calculation-engine", ok: true },
        { name: "evidence-linker",    ok: true },
        { name: "audit-trail",        ok: true },
        { name: "lock-service",       ok: true },
      ],
    };
  },
};

const validation = ModuleLoader.validate(iceManifest);
if (!validation.valid) throw new Error(`[Module SDK] ICE manifest rejected: ${validation.error}`);
moduleRegistry.register(iceManifest, iceModule);
