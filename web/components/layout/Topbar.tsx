"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { computeBreadcrumb } from "@/lib/breadcrumb";
import { GlyphIcon } from "@/components/layout/GlyphIcon";
import { useCommandPaletteStore } from "@/hooks/useCommandPalette";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationCenter } from "@/components/shell/NotificationCenter";

export function Topbar() {
  const pathname = usePathname();
  const { crumbA, crumbB } = computeBreadcrumb(pathname);
  const openPalette = useCommandPaletteStore((s) => s.open);
  const { unreadCount } = useNotifications();
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

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
        onClick={openPalette}
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
        <span className="text-[12.5px]">Buscar…</span>
      </button>

      <button
        type="button"
        title="Notificaciones"
        onClick={() => setNotificationPanelOpen((prev) => !prev)}
        className="relative flex size-9 items-center justify-center rounded-[9px] border border-sse-shell-border bg-white text-sse-bell-icon"
      >
        <GlyphIcon d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-[3px] -top-[3px] flex h-[15px] min-w-[15px] items-center justify-center rounded-[8px] border-2 border-white bg-sse-danger text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
    </header>
  );
}
