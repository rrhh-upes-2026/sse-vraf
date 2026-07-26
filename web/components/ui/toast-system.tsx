"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

// Module-level store — no context needed; works across any tree depth.
let _toasts: ToastItem[] = [];
let _listeners: Array<(toasts: ToastItem[]) => void> = [];
let _nextId = 0;

function notify() {
  const snapshot = [..._toasts];
  _listeners.forEach((l) => l(snapshot));
}

function dismiss(id: number) {
  _toasts = _toasts.filter((t) => t.id !== id);
  notify();
}

function add(type: ToastType, message: string) {
  const id = ++_nextId;
  _toasts = [..._toasts, { id, type, message }];
  notify();
  setTimeout(() => dismiss(id), 4500);
}

export const toast = {
  success: (message: string) => add("success", message),
  error:   (message: string) => add("error", message),
  info:    (message: string) => add("info", message),
};

const ICONS: Record<ToastType, string> = {
  success: "M5 13l4 4L19 7",
  error:   "M6 18L18 6M6 6l12 12",
  info:    "M13 16h-1v-4h-1m1-4h.01",
};

const COLORS: Record<ToastType, string> = {
  success: "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]",
  error:   "bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]",
  info:    "bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "stroke-[#16a34a]",
  error:   "stroke-[#dc2626]",
  info:    "stroke-[#2563eb]",
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    _listeners.push(setToasts);
    return () => {
      _listeners = _listeners.filter((l) => l !== setToasts);
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 shadow-md",
            "max-w-[340px] pointer-events-auto",
            COLORS[t.type],
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-4 h-4 shrink-0 mt-0.5", ICON_COLORS[t.type])}
          >
            <path d={ICONS[t.type]} />
          </svg>
          <p className="text-[12.5px] font-medium leading-snug flex-1">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 opacity-50 hover:opacity-80 transition-opacity"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
