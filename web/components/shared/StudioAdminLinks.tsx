"use client";

import Link from "next/link";
import { ADMIN_TOOLS, STUDIO_TOOLS } from "@/config/nav";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Studio/Administración are functional areas (§03) but the prototype never
 * gives them a top-level sidebar rail — they're reached from a workspace's
 * Configuración screen, gated to Administrador General (§16 RBAC: Process
 * Builder / Form Builder are ADMIN-only). This reproduces that entry point.
 */
export function StudioAdminLinks() {
  const role = useRoleStore((s) => s.role);
  if (role !== "admin") return null;

  return (
    <div className="mt-8 flex w-full max-w-3xl flex-col gap-6">
      <ToolGrid heading="Studio" tools={STUDIO_TOOLS} base="/studio" />
      <ToolGrid heading="Administración" tools={ADMIN_TOOLS} base="/admin" />
    </div>
  );
}

function ToolGrid({
  heading,
  tools,
  base,
}: {
  heading: string;
  tools: { id: string; slug: string; label: string; description: string; color: string }[];
  base: string;
}) {
  return (
    <div>
      <div className="mb-2 font-mono-sse text-[9.5px] font-bold uppercase tracking-[.8px] text-sse-muted">
        {heading}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`${base}/${tool.slug}`}
            className="rounded-[13px] border border-sse-border bg-white p-4 text-left transition hover:shadow-[0_1px_2px_rgba(16,24,40,.04)]"
            style={{ borderTopColor: tool.color, borderTopWidth: 3 }}
          >
            <div className="text-[12.5px] font-bold text-sse-ink">{tool.label}</div>
            <div className="mt-1 text-[11px] leading-relaxed text-sse-muted">
              {tool.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
