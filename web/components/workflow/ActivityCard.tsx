"use client";

import { useState } from "react";
import type { InstanceActivity, ActivityType, ActivityState } from "@/types/workflow";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, fmtShortDate } from "@/lib/utils";

// ── activity type icons ───────────────────────────────────────────────────────

const TYPE_ICON: Record<ActivityType, string> = {
  task:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  form:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  approval:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  evidence:
    "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13",
  review:
    "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
};

const TYPE_LABEL: Record<ActivityType, string> = {
  task:     "Tarea",
  form:     "Formulario",
  approval: "Aprobación",
  evidence: "Evidencia",
  review:   "Revisión",
};

// ── estado maps ───────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<ActivityState, BadgeVariant> = {
  pendiente:   "gray",
  en_progreso: "info",
  completada:  "success",
  bloqueada:   "warning",
  cancelada:   "danger",
};

const ESTADO_LABEL: Record<ActivityState, string> = {
  pendiente:   "Pendiente",
  en_progreso: "En progreso",
  completada:  "Completada",
  bloqueada:   "Bloqueada",
  cancelada:   "Cancelada",
};

// ── helpers ───────────────────────────────────────────────────────────────────

function dueDateColorClass(dateStr: string): string {
  const diffDays = (new Date(dateStr).getTime() - Date.now()) / 86_400_000;
  if (diffDays < 0)  return "text-sse-sem-red-fg";
  if (diffDays <= 3) return "text-sse-sem-amber-fg";
  return "text-sse-muted";
}

function relativeTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1)    return "justo ahora";
  if (diffMin < 60)   return `hace ${diffMin}m`;
  if (diffMin < 1440) return `hace ${Math.floor(diffMin / 60)}h`;
  const d = Math.floor(diffMin / 1440);
  return d === 1 ? "hace 1 día" : `hace ${d} días`;
}

function fileBasename(path: string): string {
  try {
    return decodeURIComponent(path.split("/").pop() ?? path);
  } catch {
    return path;
  }
}

// ── props ─────────────────────────────────────────────────────────────────────

interface ActivityCardProps {
  activity:     InstanceActivity;
  stageId:      string;
  onComplete:   (data?: Record<string, unknown>) => void;
  onReopen:     () => void;
  onAddComment: (texto: string) => void;
}

// ── component ─────────────────────────────────────────────────────────────────

export function ActivityCard({
  activity,
  onComplete,
  onReopen,
  onAddComment,
}: ActivityCardProps) {
  const [commentText,  setCommentText]  = useState("");
  const [showComments, setShowComments] = useState(false);

  const canComplete =
    activity.estado === "pendiente" || activity.estado === "en_progreso";
  const isCompleted = activity.estado === "completada";
  const hasComments = (activity.comments?.length ?? 0) > 0;

  function handleSendComment() {
    const text = commentText.trim();
    if (!text) return;
    onAddComment(text);
    setCommentText("");
  }

  const iconBg = isCompleted
    ? "bg-sse-sem-green-bg"
    : "bg-sse-pill-blue-bg";

  const iconColor = isCompleted
    ? "text-sse-sem-green-fg"
    : "text-sse-primary";

  return (
    <div
      className={cn(
        "border border-sse-border rounded-md p-3 space-y-2 transition-colors",
        isCompleted ? "bg-sse-surface opacity-80" : "bg-sse-surface",
      )}
    >
      {/* ── Header row ── */}
      <div className="flex items-start gap-2.5">
        {/* Type icon */}
        <div
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
            iconBg,
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className={cn("w-3.5 h-3.5", iconColor)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={TYPE_ICON[activity.type] ?? TYPE_ICON.task}
            />
          </svg>
        </div>

        {/* Label + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-medium text-sse-ink leading-snug">
              {activity.label}
            </span>
            <Badge variant={ESTADO_BADGE[activity.estado]}>
              {ESTADO_LABEL[activity.estado]}
            </Badge>
            {!activity.required && (
              <span className="text-[10px] text-sse-muted border border-sse-border rounded-sm px-1 py-px">
                Opcional
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[11px] text-sse-muted">
              {TYPE_LABEL[activity.type]}
            </span>
            {activity.assigneeName && (
              <span className="text-[11px] text-sse-muted flex items-center gap-0.5">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                {activity.assigneeName}
              </span>
            )}
            {activity.dueDate && (
              <span className={cn("text-[11px] flex items-center gap-0.5", dueDateColorClass(activity.dueDate))}>
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5">
                  <path
                    fillRule="evenodd"
                    d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3A2 2 0 0 1 14 5v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                {fmtShortDate(activity.dueDate)}
              </span>
            )}
            {isCompleted && activity.completedAt && (
              <span className="text-[11px] text-sse-sem-green-fg">
                Completada {relativeTime(activity.completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Comments toggle */}
          <button
            type="button"
            onClick={() => setShowComments((p) => !p)}
            className={cn(
              "flex items-center gap-0.5 h-7 px-2 rounded-sm text-[11px] transition-colors",
              showComments
                ? "bg-sse-pill-blue-bg text-sse-primary"
                : "text-sse-muted hover:text-sse-ink hover:bg-sse-pill-gray-bg",
            )}
            title="Comentarios"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {hasComments && (
              <span className="text-[10px] font-semibold">{activity.comments!.length}</span>
            )}
          </button>

          {canComplete && (
            <Button size="sm" variant="primary" onClick={() => onComplete()} className="h-7 px-2.5 text-[11px]">
              Completar
            </Button>
          )}

          {isCompleted && (
            <Button size="sm" variant="outline" onClick={onReopen} className="h-7 px-2.5 text-[11px]">
              Reabrir
            </Button>
          )}
        </div>
      </div>

      {/* ── Evidence attachments ── */}
      {activity.type === "evidence" && (activity.attachments?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-9">
          {activity.attachments!.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-sse-pill-blue-bg text-sse-pill-blue-fg text-[10px] font-medium hover:underline max-w-[180px]"
              title={fileBasename(url)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3 h-3 shrink-0">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="truncate">{fileBasename(url)}</span>
            </a>
          ))}
        </div>
      )}

      {/* ── Comments panel ── */}
      {showComments && (
        <div className="pl-9 space-y-2 pt-2 border-t border-sse-border">
          {/* Existing comments */}
          {(activity.comments ?? []).map((c) => (
            <div key={c.id} className="rounded-sm bg-sse-shell-canvas px-2.5 py-1.5">
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-[11px] font-semibold text-sse-ink">{c.authorName}</span>
                <span className="text-[10px] text-sse-muted">{relativeTime(c.creadoEn)}</span>
              </div>
              <p className="text-[12px] text-sse-ink leading-snug break-words">{c.texto}</p>
            </div>
          ))}

          {/* New comment input */}
          <div className="flex items-end gap-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
              placeholder="Agregar comentario… (Enter para enviar)"
              rows={2}
              className="flex-1 resize-none rounded-sm border border-sse-border bg-sse-surface px-2.5 py-1.5 text-[12px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              className="h-[52px] px-3"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path
                  fillRule="evenodd"
                  d="M8 14a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V13.5a.5.5 0 0 0 .5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
