"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { BlueprintMetadata } from "@/types/studio";

interface SectionProps {
  title: string;
  items: string[];
}

function DependencySection({ title, items }: SectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-sse-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-sse-surface hover:bg-sse-border transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-sse-ink">{title}</span>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sse-pill-gray-bg text-[11px] font-medium text-sse-ink">
            {items.length}
          </span>
        </div>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn("w-4 h-4 text-sse-muted transition-transform", open && "rotate-180")}
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="px-4 py-3 border-t border-sse-border">
          {items.length === 0 ? (
            <p className="text-[12px] text-sse-muted">Ninguna</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-2 py-0.5 rounded-sm bg-sse-pill-gray-bg text-[11px] font-mono text-sse-ink"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DependencyViewProps {
  blueprint: BlueprintMetadata;
}

export function DependencyView({ blueprint }: DependencyViewProps) {
  return (
    <div className="space-y-2">
      <DependencySection title="Formularios" items={blueprint.formIds} />
      <DependencySection title="Indicadores" items={blueprint.indicatorIds} />
      <DependencySection title="Reportes" items={blueprint.reportIds} />
      <DependencySection title="Permisos requeridos" items={blueprint.permissionsRequired as string[]} />
    </div>
  );
}
