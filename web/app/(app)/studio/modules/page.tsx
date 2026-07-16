import { moduleRegistry } from "@/lib/sdk/registry";
import { CORE_VERSION } from "@/lib/sdk/loader";
import { GlyphIcon } from "@/components/layout/GlyphIcon";

const STATUS_LABEL: Record<string, string> = {
  enabled:     "Activo",
  disabled:    "Deshabilitado",
  hidden:      "Oculto",
  installed:   "Instalado",
  deprecated:  "Deprecado",
  uninstalled: "No instalado",
};

const STATUS_COLOR: Record<string, string> = {
  enabled:     "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  disabled:    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  hidden:      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  installed:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  deprecated:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  uninstalled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function ModulesPage() {
  const modules = moduleRegistry.getAll();

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sse-text">Module Registry</h1>
          <p className="mt-1 text-sm text-sse-text-muted">
            Módulos instalados en esta instancia · Core v{CORE_VERSION}
          </p>
        </div>
        <span className="rounded-full bg-sse-surface border border-sse-border px-3 py-1 text-xs font-mono text-sse-text-muted">
          {modules.length} módulo{modules.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Module cards */}
      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sse-border px-8 py-16 text-center">
          <p className="text-sm text-sse-text-muted">
            No hay módulos registrados.
          </p>
          <p className="mt-1 text-xs text-sse-text-muted">
            Agrega un módulo en <code className="font-mono">web/modules/_registry.ts</code>.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {modules.map((m) => {
            const { manifest } = m;
            return (
              <div
                key={manifest.id}
                className="rounded-xl border border-sse-border bg-sse-surface p-5"
              >
                {/* Top row */}
                <div className="flex items-start gap-4">
                  <span
                    className="flex size-10 flex-none items-center justify-center rounded-[10px]"
                    style={{
                      background: manifest.workspace.bg,
                      color: manifest.workspace.color,
                    }}
                  >
                    <GlyphIcon d={manifest.icon} size={20} strokeWidth={1.75} />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sse-text">{manifest.name}</span>
                      <code className="rounded bg-sse-border/50 px-1.5 py-0.5 text-[11px] font-mono text-sse-text-muted">
                        v{manifest.version}
                      </code>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLOR[manifest.status] ?? STATUS_COLOR.disabled}`}
                      >
                        {STATUS_LABEL[manifest.status] ?? manifest.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-sse-text-muted">{manifest.description}</p>
                  </div>
                </div>

                {/* Detail grid */}
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-4">
                  <div>
                    <div className="font-medium text-sse-text-muted uppercase tracking-wide text-[10px]">ID</div>
                    <div className="mt-0.5 font-mono text-sse-text">{manifest.id}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sse-text-muted uppercase tracking-wide text-[10px]">Core req.</div>
                    <div className="mt-0.5 font-mono text-sse-text">{manifest.coreVersion}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sse-text-muted uppercase tracking-wide text-[10px]">Workspace</div>
                    <div className="mt-0.5 text-sse-text">{manifest.workspace.full}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sse-text-muted uppercase tracking-wide text-[10px]">Entidades</div>
                    <div className="mt-0.5 text-sse-text">{manifest.entities.length}</div>
                  </div>
                </div>

                {/* Nav extensions */}
                {manifest.navigation.extensions.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-sse-text-muted">
                      Nav Extensions
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {manifest.navigation.extensions.map((ext) => (
                        <span
                          key={ext.id}
                          className="flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-bg px-2 py-1 text-[11px] text-sse-text"
                        >
                          <GlyphIcon d={ext.icon} size={12} strokeWidth={1.75} />
                          {ext.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permissions */}
                {manifest.permissions.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-sse-text-muted">
                      Permisos ({manifest.permissions.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {manifest.permissions.map((p) => (
                        <code
                          key={p.key}
                          title={p.description}
                          className="rounded bg-sse-border/50 px-1.5 py-0.5 text-[11px] font-mono text-sse-text-muted"
                        >
                          {p.key}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer — how to add a module */}
      <div className="mt-8 rounded-lg border border-sse-border bg-sse-surface/50 px-5 py-4 text-xs text-sse-text-muted">
        <strong className="font-semibold text-sse-text">Agregar un módulo →</strong>{" "}
        Ejecuta <code className="font-mono">node scripts/create-module.mjs</code> para scaffoldear la estructura,
        luego importa el módulo en{" "}
        <code className="font-mono">web/modules/_registry.ts</code>.
      </div>
    </div>
  );
}
