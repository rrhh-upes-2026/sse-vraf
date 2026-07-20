import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { contabilidadManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const contabilidadModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",     ok: true },
        { name: "entities",     ok: contabilidadManifest.entities.length > 0 },
        { name: "permissions",  ok: contabilidadManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(contabilidadManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] Contabilidad manifest rejected: ${validation.error}`);
}

moduleRegistry.register(contabilidadManifest, contabilidadModule);
