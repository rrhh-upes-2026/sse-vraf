"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const WIDTH = { md: "max-w-[520px]", lg: "max-w-[680px]", xl: "max-w-[860px]" };

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  width = "lg",
  children,
  footer,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 z-50 flex h-screen w-full flex-col bg-sse-surface shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-300",
            WIDTH[width],
          )}
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between border-b border-sse-border px-6 py-4">
            <div>
              <Dialog.Title className="text-[15px] font-semibold text-sse-ink">
                {title}
              </Dialog.Title>
              {subtitle && (
                <Dialog.Description className="mt-0.5 text-[12px] text-sse-muted">
                  {subtitle}
                </Dialog.Description>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 flex size-7 items-center justify-center rounded-md text-sse-muted hover:bg-sse-shell-canvas hover:text-sse-ink"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-sse-border px-6 py-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Drawer Tabs ───────────────────────────────────────────────────────────────

interface DrawerTabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export function DrawerTabs({ tabs, active, onChange }: DrawerTabsProps) {
  return (
    <div className="flex shrink-0 gap-0 border-b border-sse-border px-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative py-2.5 pr-4 text-[12.5px] font-medium transition-colors",
            active === t.id
              ? "text-sse-primary after:absolute after:bottom-0 after:left-0 after:right-4 after:h-[2px] after:bg-sse-primary"
              : "text-sse-muted hover:text-sse-ink",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Section helpers inside drawer ─────────────────────────────────────────────

export function DrawerSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {title && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-sse-muted">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

export function DrawerField({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[12px] font-medium text-sse-ink">
        {label}
        {required && <span className="ml-0.5 text-sse-sem-red-fg">*</span>}
      </label>
      {children}
    </div>
  );
}
