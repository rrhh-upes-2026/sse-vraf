"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useDocuments, lifecycleBadge } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { WorkspaceDocument, DocumentCategory } from "@/types/workspace-admin";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS: Record<DocumentCategory | "all", string> = {
  all: "Todos",
  politica: "Política",
  manual: "Manual",
  procedimiento: "Procedimiento",
  instructivo: "Instructivo",
  formato: "Formato",
  reglamento: "Reglamento",
  otro: "Otro",
};

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  politica: "#E54D4D",
  manual: "#2E6BE6",
  procedimiento: "#5B4FD0",
  instructivo: "#12A150",
  formato: "#0F8A8A",
  reglamento: "#E5A100",
  otro: "#637083",
};

const FILTER_CATEGORIES: Array<DocumentCategory | "all"> = [
  "all", "manual", "reglamento", "procedimiento", "instructivo", "formato",
];

function formatSize(sizeKb?: number): string {
  if (!sizeKb) return "—";
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb} KB`;
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-b border-sse-border last:border-0">
          {[160, 90, 50, 60, 100, 70, 60].map((w, j) => (
            <td key={j} className="py-3 px-3 first:px-4 last:px-4">
              <div className="h-4 animate-pulse rounded bg-sse-shell-canvas" style={{ width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function DocumentRow({ doc, onAction }: { doc: WorkspaceDocument; onAction: () => void }) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("ws.documents.manage");
  const [busy, setBusy] = useState(false);

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Archivar el documento "${doc.nombre}"?`)) return;
    setBusy(true);
    await WorkspaceAdminService.archiveDocument(doc.id);
    setBusy(false);
    onAction();
  };

  const { label: lcLabel, color: lcColor } = lifecycleBadge(doc.lifecycle);
  const catColor = CATEGORY_COLORS[doc.categoria];

  return (
    <tr className="border-b border-sse-border last:border-0 hover:bg-sse-shell-canvas transition-colors">
      <td className="py-3 px-4">
        <p className="text-[13px] font-medium text-sse-ink leading-snug">{doc.nombre}</p>
        <p className="text-[10px] text-sse-muted mt-0.5 font-mono">{doc.id}</p>
      </td>
      <td className="py-3 px-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: `${catColor}18`, color: catColor }}
        >
          {CATEGORY_LABELS[doc.categoria]}
        </span>
      </td>
      <td className="py-3 px-3">
        <span className="text-[12px] text-sse-muted tabular-nums">v{doc.version}</span>
      </td>
      <td className="py-3 px-3">
        <span className="text-[12px] text-sse-muted tabular-nums">{formatSize(doc.sizeKb)}</span>
      </td>
      <td className="py-3 px-3">
        <div className="flex flex-wrap gap-1">
          {doc.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-sse-hover px-1.5 py-0.5 rounded text-sse-ink"
            >
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="py-3 px-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: `${lcColor}18`, color: lcColor }}
        >
          {lcLabel}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        {canManage && doc.lifecycle !== "archived" && (
          <button
            onClick={handleArchive}
            disabled={busy}
            className="text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-50"
          >
            Archivar
          </button>
        )}
      </td>
    </tr>
  );
}

export function WorkspaceAdminDocuments({ wsId }: { wsId: WorkspaceId }) {
  const { hasPermission } = usePermissions();
  const { data: documents, loading, refetch } = useDocuments(wsId);
  const [catFilter, setCatFilter] = useState<DocumentCategory | "all">("all");

  const canManage = hasPermission("ws.documents.manage");

  const filtered = (documents ?? []).filter(
    (d) => catFilter === "all" || d.categoria === catFilter
  );

  const countFor = (cat: DocumentCategory | "all") =>
    cat === "all"
      ? (documents?.length ?? 0)
      : (documents ?? []).filter((d) => d.categoria === cat).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Gestión de Documentos</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Repositorio de documentos institucionales con control de versiones.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Subir Documento
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {FILTER_CATEGORIES.map((cat) => {
          const count = countFor(cat);
          return (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={
                "px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors " +
                (catFilter === cat
                  ? "bg-sse-primary/10 text-sse-primary"
                  : "text-sse-muted hover:bg-sse-shell-canvas hover:text-sse-ink")
              }
            >
              {CATEGORY_LABELS[cat]}
              <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-sse-surface rounded-md border border-sse-border overflow-x-auto">
        {loading ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border">
                {["Nombre", "Categoría", "Versión", "Tamaño", "Tags", "Estado", ""].map((h) => (
                  <th key={h} className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide py-2.5 px-3 first:px-4 last:px-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SkeletonRows />
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-10 text-sse-border">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-[13px] font-medium text-sse-muted">
              No hay documentos{catFilter !== "all" ? ` de tipo "${CATEGORY_LABELS[catFilter]}"` : ""}
            </p>
            {canManage && catFilter === "all" && (
              <Button variant="primary" size="sm" className="mt-2">Subir primer documento</Button>
            )}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border">
                {["Nombre", "Categoría", "Versión", "Tamaño", "Tags", "Estado", ""].map((h) => (
                  <th key={h} className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide py-2.5 px-3 first:px-4 last:px-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} onAction={refetch} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
