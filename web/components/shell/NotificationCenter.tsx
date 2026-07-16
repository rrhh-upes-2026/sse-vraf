"use client";

import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notificacion, NotificacionCategoria, NotificacionPrioridad } from "@/types/notifications";
import { cn } from "@/lib/utils";

// ── Types & constants ──────────────────────────────────────────────────────────

interface NotificationCenterProps {
  isOpen: boolean;
  onClose(): void;
}

// SVG path per category (24x24 viewBox, stroke-based)
const CATEGORY_ICONS: Record<NotificacionCategoria, string> = {
  proceso:    "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  actividad:  "M12 8v4l3 3M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z",
  evidencia:  "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  indicador:  "M4 20a8 8 0 1 1 16 0M12 14l4-4",
  solicitud:  "M4 13h4l2 3h4l2-3h4M5 5h14v13H5z",
  rrhh:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  sistema:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12a8 8 0 0 1 16 0",
};

// Priority dot colors
const PRIORITY_DOT: Record<NotificacionPrioridad, string> = {
  alta:  "bg-sse-sem-red-fg",
  media: "bg-sse-sem-amber-fg",
  baja:  "bg-sse-pill-gray-bg",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  if (Number.isNaN(diffMs)) return "";

  const diffSec = Math.floor(diffMs / 1_000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60)  return "ahora mismo";
  if (diffMin < 60)  return `hace ${diffMin} min`;
  if (diffHr < 24)   return `hace ${diffHr} h`;
  if (diffDay === 1) return "ayer";
  if (diffDay < 7)   return `hace ${diffDay} días`;

  // Fall back to locale date
  try {
    return new Intl.DateTimeFormat("es-SV", { day: "numeric", month: "short" }).format(then);
  } catch {
    return `hace ${diffDay} días`;
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CategoryIcon({ categoria }: { categoria: NotificacionCategoria }) {
  const d = CATEGORY_ICONS[categoria];
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-sse-muted"
    >
      <path d={d} />
    </svg>
  );
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notificacion;
  onRead(id: string, url?: string): void;
}) {
  return (
    <button
      type="button"
      onClick={() => onRead(notification.id, notification.accionUrl)}
      className={cn(
        "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-sse-surface",
        !notification.leida && "bg-sse-primary/5",
      )}
    >
      {/* Priority dot */}
      <div className="mt-1.5 flex flex-none flex-col items-center gap-1.5">
        <span
          className={cn(
            "size-2 rounded-full flex-none",
            PRIORITY_DOT[notification.prioridad],
          )}
          aria-label={`Prioridad ${notification.prioridad}`}
        />
        <CategoryIcon categoria={notification.categoria} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] leading-tight",
            notification.leida ? "font-normal text-sse-ink" : "font-medium text-sse-ink",
          )}
        >
          {notification.titulo}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-sse-muted">
          {notification.mensaje}
        </p>
        <p className="mt-1 text-[10.5px] text-sse-muted">
          {formatRelativeTime(notification.creadoEn)}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.leida && (
        <span className="mt-1.5 size-1.5 flex-none rounded-full bg-sse-primary" />
      )}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  if (!isOpen) return null;

  function handleRead(id: string, url?: string) {
    markRead(id);
    if (url) {
      router.push(url);
      onClose();
    }
  }

  return (
    <>
      {/* Click-outside overlay (invisible) */}
      <div
        className="fixed inset-0 z-30"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Notificaciones"
        className="absolute right-0 top-full z-40 mt-2 flex w-[360px] flex-col overflow-hidden rounded-lg border border-sse-border bg-white shadow-xl"
        style={{ maxHeight: 480 }}
      >
        {/* Header */}
        <div className="flex flex-none items-center justify-between border-b border-sse-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-semibold text-sse-ink">
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sse-sem-red-bg px-1.5 text-[10px] font-bold text-sse-sem-red-fg">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11.5px] font-medium text-sse-primary transition-colors hover:underline"
            >
              Marcar todo leído
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto divide-y divide-sse-border">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sse-muted"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              <p className="text-[13px] text-sse-muted">Sin notificaciones nuevas</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={handleRead}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex-none border-t border-sse-border px-4 py-2.5">
            <button
              type="button"
              onClick={() => {
                router.push("/mi-trabajo?tab=notificaciones");
                onClose();
              }}
              className="w-full text-center text-[12px] font-medium text-sse-primary transition-colors hover:underline"
            >
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>
    </>
  );
}
