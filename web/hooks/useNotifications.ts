"use client";

import { create } from "zustand";
import type { Notificacion } from "@/types/notifications";
import { mockNotificaciones } from "@/lib/mock-data";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

interface NotificationStore {
  notifications: Notificacion[];
  markRead: (id: string) => void;
  markAllRead: (usuarioId: string) => void;
  push: (n: Notificacion) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [...mockNotificaciones],
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, leida: true } : n,
      ),
    })),
  markAllRead: (usuarioId) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.usuarioId === usuarioId ? { ...n, leida: true } : n,
      ),
    })),
  push: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
}));

export function useNotifications() {
  const { data: session } = useSession();
  const usuarioId = session?.user?.usuarioId ?? "";
  const store = useNotificationStore();

  const mine = useMemo(
    () => store.notifications.filter((n) => n.usuarioId === usuarioId),
    [store.notifications, usuarioId],
  );

  const unreadCount = useMemo(() => mine.filter((n) => !n.leida).length, [mine]);

  return {
    notifications: mine,
    unreadCount,
    markRead:    store.markRead,
    markAllRead: () => store.markAllRead(usuarioId),
  };
}
