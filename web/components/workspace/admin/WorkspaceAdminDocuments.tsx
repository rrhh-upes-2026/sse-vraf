"use client";

import { useState, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useDocuments, lifecycleBadge } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { WorkspaceDocument, DocumentCategory, DocumentComment } from "@/types/workspace-admin";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { DocumentPreview } from "@/components/ui/DocumentPreview";
import { useGWPUploadFile } from "@/hooks/useGWP";
import { fmtShortDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast-system";

// ── Catalog constants ──────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatSize(sizeKb?: number): string {
  if (!sizeKb) return "—";
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb} KB`;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
  });
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-b border-sse-border last:border-0">
          {[160, 90, 50, 60, 100, 70, 80].map((w, j) => (
            <td key={j} className="py-3 px-3 first:px-4 last:px-4">
              <div className="h-4 animate-pulse rounded bg-sse-shell-canvas" style={{ width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Upload Modal ───────────────────────────────────────────────────────────────

interface UploadModalProps {
  wsId: WorkspaceId;
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

function UploadModal({ wsId, userEmail, onClose, onSuccess }: UploadModalProps) {
  const [nombre, setNombre]       = useState("");
  const [categoria, setCategoria] = useState<DocumentCategory>("manual");
  const [tagsRaw, setTagsRaw]     = useState("");
  const [file, setFile]           = useState<File | null>(null);
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState("");
  const upload = useGWPUploadFile();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !file) {
      setError("Nombre y archivo son requeridos.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      const driveFile = await upload.mutateAsync({
        userId:   userEmail,
        name:     file.name,
        mimeType: file.type || "application/octet-stream",
        content:  base64,
      });
      await WorkspaceAdminService.createDocument(wsId, {
        nombre:       nombre.trim(),
        categoria,
        tags:         tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
        driveFileId:  driveFile.id,
        mimeType:     file.type,
        sizeKb:       Math.round(file.size / 1024),
        lifecycle:    "draft",
        version:      1,
        history:      [],
        responsableRol: "admin",
        createdBy:    userEmail,
        createdAt:    new Date().toISOString(),
        updatedAt:    new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el documento.");
    } finally {
      setBusy(false);
    }
  }, [nombre, file, categoria, tagsRaw, userEmail, wsId, upload, onSuccess, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-sse-surface border border-sse-border rounded-lg w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sse-border">
          <h2 className="text-[15px] font-semibold text-sse-ink">Subir Documento</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-sse-hover text-sse-muted hover:text-sse-ink transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide block mb-1.5">
              Nombre del documento *
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Manual de Procedimientos RRHH"
              className="w-full px-3 py-2 text-[13px] bg-sse-shell-canvas border border-sse-border rounded text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide block mb-1.5">
              Categoría *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as DocumentCategory)}
              className="w-full px-3 py-2 text-[13px] bg-sse-shell-canvas border border-sse-border rounded text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
            >
              {(Object.entries(CATEGORY_LABELS) as [string, string][])
                .filter(([k]) => k !== "all")
                .map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide block mb-1.5">
              Tags <span className="normal-case font-normal">(separados por coma)</span>
            </label>
            <input
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="Ej. rrhh, 2026, vigente"
              className="w-full px-3 py-2 text-[13px] bg-sse-shell-canvas border border-sse-border rounded text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide block mb-1.5">
              Archivo *
            </label>
            <Dropzone
              fileName={file?.name}
              onFileSelect={setFile}
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
            />
          </div>

          {error && (
            <p className="text-[12px] text-sse-danger">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={busy || !nombre.trim() || !file}
            >
              {busy ? "Subiendo…" : "Subir documento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Document Row ───────────────────────────────────────────────────────────────

interface DocumentRowProps {
  doc: WorkspaceDocument;
  userEmail: string;
  onAction: () => void;
  onPreview: (doc: WorkspaceDocument) => void;
}

function DocumentRow({ doc, userEmail, onAction, onPreview }: DocumentRowProps) {
  const { hasPermission }                   = usePermissions();
  const canManage                           = hasPermission("ws.documents.manage");
  const [busy, setBusy]                     = useState(false);
  const [expanded, setExpanded]             = useState(false);
  const [comments, setComments]             = useState<DocumentComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment]         = useState("");

  const loadComments = useCallback(async () => {
    if (commentsLoaded) return;
    try {
      const data = await WorkspaceAdminService.listDocumentComments(doc.id);
      setComments(data);
    } finally {
      setCommentsLoaded(true);
    }
  }, [doc.id, commentsLoaded]);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!expanded) loadComments();
    setExpanded((v) => !v);
  }

  async function handlePublish(e: React.MouseEvent) {
    e.stopPropagation();
    setBusy(true);
    await WorkspaceAdminService.publishDocument(doc.id);
    setBusy(false);
    onAction();
  }

  async function handleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    setBusy(true);
    try {
      await WorkspaceAdminService.archiveDocument(doc.id);
      toast.success(`"${doc.nombre}" archivado.`);
      onAction();
    } catch {
      toast.error("No se pudo archivar. Intente nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeprecate(e: React.MouseEvent) {
    e.stopPropagation();
    setBusy(true);
    try {
      await WorkspaceAdminService.deprecateDocument(doc.id);
      toast.success(`"${doc.nombre}" marcado como deprecado.`);
      onAction();
    } catch {
      toast.error("No se pudo deprecar. Intente nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddComment(e: React.MouseEvent) {
    e.stopPropagation();
    if (!newComment.trim()) return;
    const comment = await WorkspaceAdminService.addDocumentComment({
      documentId: doc.id,
      wsId:       doc.wsId,
      autor:      userEmail,
      autorId:    userEmail,
      texto:      newComment.trim(),
    });
    setComments((prev) => [...prev, comment]);
    setNewComment("");
  }

  const { label: lcLabel, color: lcColor } = lifecycleBadge(doc.lifecycle);
  const catColor = CATEGORY_COLORS[doc.categoria];

  return (
    <>
      {/* Main row */}
      <tr className="border-b border-sse-border hover:bg-sse-shell-canvas/60 transition-colors">
        {/* Name + expand */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              className="shrink-0 text-sse-muted hover:text-sse-ink transition-colors"
              title={expanded ? "Colapsar" : "Expandir detalles"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <div>
              <p className="text-[13px] font-medium text-sse-ink leading-snug">{doc.nombre}</p>
              <p className="text-[10px] text-sse-muted mt-0.5 font-mono">{doc.id}</p>
            </div>
          </div>
        </td>

        {/* Category */}
        <td className="py-3 px-3">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: `${catColor}18`, color: catColor }}
          >
            {CATEGORY_LABELS[doc.categoria]}
          </span>
        </td>

        {/* Version */}
        <td className="py-3 px-3">
          <span className="text-[12px] text-sse-muted tabular-nums">v{doc.version}</span>
        </td>

        {/* Size */}
        <td className="py-3 px-3">
          <span className="text-[12px] text-sse-muted tabular-nums">{formatSize(doc.sizeKb)}</span>
        </td>

        {/* Tags */}
        <td className="py-3 px-3">
          <div className="flex flex-wrap gap-1">
            {doc.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-sse-hover px-1.5 py-0.5 rounded text-sse-ink">
                {tag}
              </span>
            ))}
          </div>
        </td>

        {/* Lifecycle */}
        <td className="py-3 px-3">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: `${lcColor}18`, color: lcColor }}
          >
            {lcLabel}
          </span>
        </td>

        {/* Actions */}
        <td className="py-3 px-4">
          <div className="flex items-center justify-end gap-1">
            {/* Preview */}
            {doc.driveFileId && (
              <button
                onClick={(e) => { e.stopPropagation(); onPreview(doc); }}
                className="p-1 rounded text-sse-muted hover:text-sse-ink hover:bg-sse-hover transition-colors"
                title="Vista previa"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}

            {/* Download */}
            {doc.driveFileId && (
              <a
                href={`https://drive.google.com/uc?export=download&id=${doc.driveFileId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-sse-muted hover:text-sse-ink hover:bg-sse-hover transition-colors"
                title="Descargar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </a>
            )}

            {/* State transitions */}
            {canManage && !busy && (
              <>
                {doc.lifecycle === "draft" && (
                  <button
                    onClick={handlePublish}
                    className="text-[11px] font-medium text-sse-primary hover:underline ml-1"
                  >
                    Publicar
                  </button>
                )}
                {doc.lifecycle === "published" && (
                  <button
                    onClick={handleArchive}
                    className="text-[11px] text-sse-muted hover:text-sse-ink ml-1"
                  >
                    Archivar
                  </button>
                )}
                {(doc.lifecycle === "published" || doc.lifecycle === "archived") && (
                  <button
                    onClick={handleDeprecate}
                    className="text-[11px] text-sse-muted hover:text-sse-danger ml-1"
                  >
                    Deprecar
                  </button>
                )}
              </>
            )}
            {busy && (
              <div className="w-3.5 h-3.5 border border-sse-primary border-t-transparent rounded-full animate-spin ml-1" />
            )}
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-sse-border bg-sse-shell-canvas/40">
          <td colSpan={7} className="px-8 py-4">
            <div className="grid grid-cols-2 gap-6">

              {/* Version history */}
              <div>
                <p className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide mb-2">
                  Historial de versiones
                </p>
                {doc.history.length === 0 ? (
                  <p className="text-[12px] text-sse-muted italic">Sin historial registrado.</p>
                ) : (
                  <div className="space-y-2">
                    {doc.history.map((v, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-[12px]">
                        <span className="font-mono text-sse-primary shrink-0 w-8">v{v.version}</span>
                        <span className="text-sse-muted shrink-0 w-20">
                          {v.changedAt ? fmtShortDate(v.changedAt) : "—"}
                        </span>
                        <span className="text-sse-ink flex-1">{v.summary || "—"}</span>
                        <span className="text-sse-muted shrink-0 text-[10px]">{v.changedBy}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drive metadata if available */}
                {doc.driveFileId && (
                  <div className="mt-3 pt-3 border-t border-sse-border">
                    <p className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide mb-1.5">
                      Archivo en Drive
                    </p>
                    <a
                      href={`https://drive.google.com/file/d/${doc.driveFileId}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-sse-primary hover:underline flex items-center gap-1"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Abrir en Google Drive
                    </a>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div>
                <p className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide mb-2">
                  Comentarios
                  {commentsLoaded && (
                    <span className="ml-1 font-normal normal-case text-sse-muted">({comments.length})</span>
                  )}
                </p>

                {!commentsLoaded ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-10 animate-pulse rounded bg-sse-hover" />
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-[12px] text-sse-muted italic mb-3">Sin comentarios aún.</p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-sse-surface border border-sse-border rounded p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-sse-ink">{c.autor}</span>
                          <span className="text-[10px] text-sse-muted">{fmtShortDate(c.createdAt)}</span>
                        </div>
                        <p className="text-[12px] text-sse-ink/80 leading-snug">{c.texto}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* New comment input */}
                <div className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(e as unknown as React.MouseEvent);
                      }
                    }}
                    placeholder="Añadir comentario…"
                    className="flex-1 px-2.5 py-1.5 text-[12px] bg-sse-surface border border-sse-border rounded text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-3 py-1.5 text-[11px] font-semibold bg-sse-primary text-white rounded hover:bg-sse-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    Enviar
                  </button>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function WorkspaceAdminDocuments({ wsId }: { wsId: WorkspaceId }) {
  const { user }                          = useSession();
  const { hasPermission }                 = usePermissions();
  const { data: documents, loading, refetch } = useDocuments(wsId);
  const [catFilter, setCatFilter]         = useState<DocumentCategory | "all">("all");
  const [uploading, setUploading]         = useState(false);
  const [previewDoc, setPreviewDoc]       = useState<WorkspaceDocument | null>(null);

  const canManage    = hasPermission("ws.documents.manage");
  const userEmail    = user?.email ?? "admin@upes.edu.sv";

  const filtered = (documents ?? []).filter(
    (d) => catFilter === "all" || d.categoria === catFilter
  );

  const countFor = (cat: DocumentCategory | "all") =>
    cat === "all"
      ? (documents?.length ?? 0)
      : (documents ?? []).filter((d) => d.categoria === cat).length;

  const TABLE_HEADERS = ["Nombre", "Categoría", "Versión", "Tamaño", "Tags", "Estado", "Acciones"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Gestión de Documentos</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Repositorio de documentos institucionales con control de versiones y flujo de aprobación.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="sm" onClick={() => setUploading(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Subir Documento
          </Button>
        )}
      </div>

      {/* Category filter */}
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

      {/* Table */}
      <div className="bg-sse-surface rounded-md border border-sse-border overflow-x-auto">
        {loading ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border">
                {TABLE_HEADERS.map((h) => (
                  <th key={h} className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide py-2.5 px-3 first:px-4 last:px-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody><SkeletonRows /></tbody>
          </table>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-10 text-sse-border">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-[13px] font-medium text-sse-muted">
              No hay documentos{catFilter !== "all" ? ` de tipo &quot;${CATEGORY_LABELS[catFilter]}&quot;` : ""}
            </p>
            {canManage && catFilter === "all" && (
              <Button variant="primary" size="sm" className="mt-2" onClick={() => setUploading(true)}>
                Subir primer documento
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border">
                {TABLE_HEADERS.map((h) => (
                  <th key={h} className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide py-2.5 px-3 first:px-4 last:px-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  userEmail={userEmail}
                  onAction={refetch}
                  onPreview={setPreviewDoc}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload modal */}
      {uploading && (
        <UploadModal
          wsId={wsId}
          userEmail={userEmail}
          onClose={() => setUploading(false)}
          onSuccess={refetch}
        />
      )}

      {/* Document preview overlay */}
      {previewDoc && previewDoc.driveFileId && (
        <DocumentPreview
          driveFileId={previewDoc.driveFileId}
          fileName={previewDoc.nombre}
          mimeType={previewDoc.mimeType}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
