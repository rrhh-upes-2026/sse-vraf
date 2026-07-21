import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { mantenimientoManifest } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const mantenimientoModule: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [
        { name: "manifest",    ok: true },
        { name: "entities",    ok: mantenimientoManifest.entities.length > 0 },
        { name: "permissions", ok: mantenimientoManifest.permissions.length > 0 },
      ],
    };
  },
};

const validation = ModuleLoader.validate(mantenimientoManifest);
if (!validation.valid) {
  throw new Error(`[Module SDK] Mantenimiento manifest rejected: ${validation.error}`);
}

moduleRegistry.register(mantenimientoManifest, mantenimientoModule);
