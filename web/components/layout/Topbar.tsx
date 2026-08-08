"use client";

import { usePathname } from "next/navigation";
import { computeBreadcrumb } from "@/lib/breadcrumb";
import { GlyphIcon } from "@/components/layout/GlyphIcon";
import { useCommandPaletteStore } from "@/hooks/useCommandPalette";

export function Topbar() {
  const pathname = usePathname();
  const { crumbA, crumbB } = computeBreadcrumb(pathname);
  const open = useCommandPaletteStore((s) => s.open);

  return (
    <header className="flex h-[60px] flex-none items-center gap-4 border-b border-sse-shell-border bg-white px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-[12px] font-semibold text-sse-muted">{crumbA}</span>
        {crumbB && (
          <>
            <GlyphIcon
              d="M9 6l6 6-6 6"
              size={14}
              strokeWidth={2}
              className="text-sse-crumb-chevron"
            />
            <span className="text-[14px] font-bold text-sse-ink">{crumbB}</span>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={open}
        className="flex h-9 w-[240px] cursor-pointer items-center gap-2.5 rounded-[9px] border border-sse-shell-border bg-sse-shell-search-bg px-[13px] text-sse-muted"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
        <span className="flex-1 text-left text-[12.5px]">Buscar en todos los workspaces…</span>
        <kbd className="rounded border border-sse-shell-border px-1 py-0.5 text-[10px]">⌘K</kbd>
      </button>
    </header>
  );
}
