#!/usr/bin/env node
/**
 * Module Generator — scaffolds a new SSE Platform module.
 *
 * Usage:
 *   node scripts/create-module.mjs
 *
 * Produces:
 *   web/modules/<id>/manifest.ts   — ModuleManifest declaration
 *   web/modules/<id>/index.ts      — side-effect registration
 *
 * Then manually add `import "./<id>";` to web/modules/_registry.ts.
 */

import { createInterface } from "node:readline";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

function slug(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function camel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function pascal(s) {
  const c = camel(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

console.log("\n  SSE Platform · Module Generator\n  --------------------------------\n");

const id         = slug(await ask("  Module ID (e.g. compras):             "));
const name       = (await ask("  Display name (e.g. Compras):           ")).trim();
const desc       = (await ask("  Short description:                     ")).trim();
const wsShort    = (await ask("  Workspace short name:                  ")).trim() || name;
const wsFull     = (await ask("  Workspace full name:                   ")).trim() || name;
const wsColor    = (await ask("  Workspace accent color (#hex) [#2E6BE6]: ")).trim() || "#2E6BE6";
const wsBg       = (await ask("  Workspace bg color (#hex) [#EAF1FE]:    ")).trim() || "#EAF1FE";

rl.close();

if (!id || !name) {
  console.error("\n  Error: id and name are required.\n");
  process.exit(1);
}

const repoRoot   = resolve(import.meta.dirname, "..");
const moduleDir  = join(repoRoot, "web", "modules", id);
const varName    = camel(id) + "Manifest";
const ModuleName = pascal(id);

if (existsSync(moduleDir)) {
  console.error(`\n  Error: web/modules/${id} already exists.\n`);
  process.exit(1);
}

mkdirSync(moduleDir, { recursive: true });

// manifest.ts
writeFileSync(
  join(moduleDir, "manifest.ts"),
  `import type { ModuleManifest } from "@/lib/sdk/types";

export const ${varName}: ModuleManifest = {
  id: "${id}",
  name: "${name}",
  version: "0.1.0",
  coreVersion: "^1.0.0",
  description: "${desc}",
  icon: "M12 4v16M4 12h16", // TODO: replace with a meaningful icon path

  workspace: {
    id: "${id}",
    short: "${wsShort}",
    full: "${wsFull}",
    color: "${wsColor}",
    bg: "${wsBg}",
    icon: "M12 4v16M4 12h16", // TODO: replace with workspace icon
  },

  permissions: [
    { key: "${id}.view", description: "Ver el workspace de ${name}" },
    { key: "${id}.edit", description: "Crear y editar registros de ${name}" },
  ],

  entities: [
    // TODO: add entity definitions
    // { id: "myEntity", sheetName: "MyEntity", label: "My Entity" },
  ],

  navigation: {
    extensions: [
      // TODO: add sidebar nav extensions
      // {
      //   id: "main",
      //   label: "${name}",
      //   icon: "M12 4v16M4 12h16",
      //   href: "main",
      //   order: 1,
      // },
    ],
  },

  featureFlags: [
    {
      key: "${id}.enabled",
      envVar: "NEXT_PUBLIC_FLAG_${id.toUpperCase().replace(/-/g, '_')}",
      description: "Habilitar el módulo ${name}",
    },
  ],

  dependencies: [],
  status: "enabled",
};
`,
);

// index.ts
writeFileSync(
  join(moduleDir, "index.ts"),
  `import { moduleRegistry } from "@/lib/sdk/registry";
import { ModuleLoader } from "@/lib/sdk/loader";
import { ${varName} } from "./manifest";
import type { ModuleAPI } from "@/lib/sdk/types";

const ${camel(id)}Module: ModuleAPI = {
  async initialize() {},
  async shutdown() {},
  async health() {
    return {
      healthy: true,
      checks: [{ name: "manifest", ok: true }],
    };
  },
};

const validation = ModuleLoader.validate(${varName});
if (!validation.valid) {
  throw new Error(\`[Module SDK] ${ModuleName} manifest rejected: \${validation.error}\`);
}

moduleRegistry.register(${varName}, ${camel(id)}Module);
`,
);

console.log(`
  Created:
    web/modules/${id}/manifest.ts
    web/modules/${id}/index.ts

  Next steps:
    1. Edit the manifest to add real entities, permissions, and nav extensions.
    2. Add this line to web/modules/_registry.ts:
         import "./${id}";
    3. Add NEXT_PUBLIC_FLAG_${id.toUpperCase().replace(/-/g, '_')}=true to .env.local
    4. Build and verify: cd web && npm run build
`);
