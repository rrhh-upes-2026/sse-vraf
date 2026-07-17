"use client";

/**
 * BuilderShell — shared layout for all No-Code Builders.
 * Left panel: list of saved configs. Right: canvas / editor.
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BUILDER_REGISTRY, type BuilderMeta, type BuilderBase, type BuilderStatus } from "@/types/builders";

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<BuilderStatus, string> = {
  draft:     "#E5A100",
  published: "#22c55e",
  archived:  "rgba(255,255,255,0.25)",
};

const STATUS_LABEL: Record<BuilderStatus, string> = {
  draft:     "Borrador",
  published: "Publicado",
  archived:  "Archivado",
};

export function StatusBadge({ status }: { status: BuilderStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.05em",
        color: c,
        background: c + "20",
        padding: "2px 6px",
        borderRadius: 4,
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

// ── Config list item ──────────────────────────────────────────────────────────

interface ConfigItemProps {
  config: BuilderBase;
  isSelected: boolean;
  onSelect: () => void;
  color: string;
}

export function ConfigItem({ config, isSelected, onSelect, color }: ConfigItemProps) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 8,
        background: isSelected ? color + "15" : "transparent",
        border: `1px solid ${isSelected ? color + "40" : "transparent"}`,
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: "white", lineHeight: 1.3 }}>
          {config.nombre}
        </span>
        <StatusBadge status={config.status} />
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}>
        v{config.version}
      </div>
    </button>
  );
}

// ── Builder Shell ─────────────────────────────────────────────────────────────

interface BuilderShellProps {
  wsId: string;
  meta: BuilderMeta;
  items: BuilderBase[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onNew: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function BuilderShell({
  wsId,
  meta,
  items,
  selectedId,
  onSelect,
  onNew,
  isLoading,
  children,
}: BuilderShellProps) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0, overflow: "hidden" }}>
      {/* ── Left sidebar ── */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: "16px 14px 10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: meta.color + "25",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <path d={meta.icono} stroke={meta.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.2 }}>
                {meta.nombre}
              </div>
            </div>
          </div>

          <button
            onClick={onNew}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              padding: "7px 12px",
              borderRadius: 8,
              background: meta.color,
              border: "none",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Nuevo
          </button>
        </div>

        {/* Item list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 12px" }}>
          {isLoading ? (
            <div style={{ padding: "20px 0", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              Cargando…
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
                No hay configuraciones guardadas
              </div>
              <button
                onClick={onNew}
                style={{
                  fontSize: 11,
                  color: meta.color,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Crear la primera
              </button>
            </div>
          ) : (
            items.map((item) => (
              <ConfigItem
                key={item.id}
                config={item}
                isSelected={item.id === selectedId}
                onSelect={() => onSelect(item.id)}
                color={meta.color}
              />
            ))
          )}
        </div>

        {/* Back to hub */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link
            href={`/ws/${wsId}/admin/builders`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Todos los constructores
          </Link>
        </div>
      </div>

      {/* ── Main canvas ── */}
      <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
