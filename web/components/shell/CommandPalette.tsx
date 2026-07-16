"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCommandPaletteStore } from "@/hooks/useCommandPalette";
import { usePermissions } from "@/hooks/usePermissions";
import { QUICK_ACTIONS } from "@/lib/permissions";
import { VRAF_WORKSPACE, WORKSPACE_SECTIONS, isWorkspaceId } from "@/config/nav";
import { moduleRegistry } from "@/lib/sdk/registry";
import { GlyphIcon } from "@/components/layout/GlyphIcon";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  icon: string; // SVG path d
  href: string;
  group: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SEARCH_ICON = "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z";

function parseActiveWorkspace(pathname: string): string | null {
  const match = pathname.match(/^\/ws\/([^/]+)/);
  const wsId = match?.[1];
  return wsId && isWorkspaceId(wsId) ? wsId : null;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, query, open, close, setQuery } = useCommandPaletteStore();
  const { hasPermission } = usePermissions();

  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activeWs = parseActiveWorkspace(pathname);

  // ── Build command list ───────────────────────────────────────────────────────

  const workspaces = [VRAF_WORKSPACE, ...moduleRegistry.getWorkspaceUnits()];

  const allCommands: CommandItem[] = [
    // Navegación — workspace units (Core's VRAF + module-registered workspaces)
    ...workspaces.map((u) => ({
      id: `ws-${u.id}`,
      label: u.short,
      icon: u.icon,
      href: `/ws/${u.id}/dashboard`,
      group: "Navegación",
    })),
    // Navegación — Mi Trabajo
    {
      id: "mi-trabajo",
      label: "Mi Trabajo",
      icon: "M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z",
      href: "/mi-trabajo",
      group: "Navegación",
    },
    // Acciones — filtered by permission
    ...QUICK_ACTIONS.filter((a) => hasPermission(a.permission)).map((a) => ({
      id: `action-${a.id}`,
      label: a.label,
      icon: a.icon,
      href: a.href,
      group: "Acciones",
    })),
    // Secciones — workspace sections
    ...WORKSPACE_SECTIONS.map((s) => ({
      id: `section-${s.id}`,
      label: s.label,
      icon: s.icon,
      href: activeWs ? `/ws/${activeWs}/${s.id}` : `/ws/vraf/${s.id}`,
      group: "Secciones",
    })),
  ];

  // ── Filter by query ──────────────────────────────────────────────────────────

  const q = query.trim().toLowerCase();
  const filtered = q
    ? allCommands.filter((c) => c.label.toLowerCase().includes(q))
    : allCommands;

  // Group preserving order
  const groups: { label: string; items: CommandItem[] }[] = [];
  for (const item of filtered) {
    const existing = groups.find((g) => g.label === item.group);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ label: item.group, items: [item] });
    }
  }

  const flatItems = filtered;

  // ── Keyboard global listener ─────────────────────────────────────────────────

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        open();
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, open, close]);

  // Reset highlight when query changes
  useEffect(() => {
    setHighlighted(0);
  }, [query, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // ── Keyboard navigation inside palette ──────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatItems[highlighted];
        if (item) {
          router.push(item.href);
          close();
        }
      }
    },
    [flatItems, highlighted, router, close],
  );

  // Scroll highlighted item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${highlighted}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  if (!isOpen) return null;

  // Build flat index across groups for keyboard highlight tracking
  let flatIdx = 0;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Modal */}
      <div
        className="flex w-full max-w-[560px] flex-col rounded-lg border border-sse-border bg-white shadow-xl"
        onKeyDown={handleKeyDown}
      >
        {/* Search row */}
        <div className="flex items-center gap-3 border-b border-sse-border px-4 py-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-none text-sse-muted"
            aria-hidden="true"
          >
            <path d={SEARCH_ICON} />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar comandos, páginas, acciones…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-sse-ink outline-none placeholder:text-sse-muted"
          />
          <kbd className="hidden rounded border border-sse-border px-1.5 py-0.5 font-mono text-[10px] text-sse-muted sm:inline">
            Esc
          </kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto py-1.5">
          {flatItems.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-sse-muted">
              Sin resultados para &lsquo;{query}&rsquo;
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                {/* Group label */}
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sse-muted">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const idx = flatIdx++;
                  const isHighlighted = idx === highlighted;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-idx={idx}
                      onMouseEnter={() => setHighlighted(idx)}
                      onClick={() => {
                        router.push(item.href);
                        close();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        isHighlighted ? "bg-sse-primary/8" : "hover:bg-sse-primary/5",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 flex-none items-center justify-center rounded-md border border-sse-border",
                          isHighlighted ? "border-sse-primary/20 bg-sse-primary/8" : "bg-sse-surface",
                        )}
                      >
                        <GlyphIcon
                          d={item.icon}
                          size={15}
                          className={isHighlighted ? "text-sse-primary" : "text-sse-muted"}
                        />
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-[13.5px]",
                          isHighlighted ? "font-medium text-sse-ink" : "text-sse-ink",
                        )}
                      >
                        {item.label}
                      </span>
                      {isHighlighted && (
                        <kbd className="rounded border border-sse-border bg-sse-surface px-1.5 py-0.5 font-mono text-[10px] text-sse-muted">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 border-t border-sse-border px-4 py-2">
          <span className="text-[11px] text-sse-muted">
            <kbd className="rounded border border-sse-border bg-sse-surface px-1 py-0.5 font-mono text-[9px]">↑</kbd>
            <kbd className="ml-0.5 rounded border border-sse-border bg-sse-surface px-1 py-0.5 font-mono text-[9px]">↓</kbd>
            {" "}navegar
          </span>
          <span className="text-[11px] text-sse-muted">
            <kbd className="rounded border border-sse-border bg-sse-surface px-1 py-0.5 font-mono text-[9px]">↵</kbd>
            {" "}abrir
          </span>
          <span className="text-[11px] text-sse-muted">
            <kbd className="rounded border border-sse-border bg-sse-surface px-1 py-0.5 font-mono text-[9px]">Esc</kbd>
            {" "}cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
