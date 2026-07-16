"use client";

import type { TimelineEntry, WorkflowEventType } from "@/types/workflow";
import { cn } from "@/lib/utils";

// ── event type → color tokens ─────────────────────────────────────────────────
// Maps each event type to Tailwind classes so no inline style is needed.

interface DotStyle {
  bg:     string;
  border: string;
  icon:   string;
}

const EVENT_DOT: Record<WorkflowEventType, DotStyle> = {
  WorkflowCreated:    { bg: "bg-sse-pill-blue-bg",   border: "border-sse-primary",          icon: "text-sse-primary" },
  WorkflowStarted:    { bg: "bg-sse-pill-blue-bg",   border: "border-sse-primary",          icon: "text-sse-primary" },
  WorkflowCompleted:  { bg: "bg-sse-sem-green-bg",   border: "border-sse-sem-green-border", icon: "text-sse-sem-green-fg" },
  WorkflowCancelled:  { bg: "bg-sse-sem-red-bg",     border: "border-sse-sem-red-border",   icon: "text-sse-sem-red-fg" },
  WorkflowBlocked:    { bg: "bg-sse-sem-amber-bg",   border: "border-sse-sem-amber-border", icon: "text-sse-sem-amber-fg" },
  WorkflowResumed:    { bg: "bg-sse-pill-blue-bg",   border: "border-sse-primary",          icon: "text-sse-primary" },
  StageStarted:       { bg: "bg-sse-pill-blue-bg",   border: "border-sse-primary",          icon: "text-sse-primary" },
  StageCompleted:     { bg: "bg-sse-sem-green-bg",   border: "border-sse-sem-green-border", icon: "text-sse-sem-green-fg" },
  ActivityAssigned:   { bg: "bg-sse-pill-gray-bg",   border: "border-sse-border",           icon: "text-sse-muted" },
  ActivityStarted:    { bg: "bg-sse-pill-gray-bg",   border: "border-sse-border",           icon: "text-sse-muted" },
  ActivityCompleted:  { bg: "bg-sse-sem-green-bg",   border: "border-sse-sem-green-border", icon: "text-sse-sem-green-fg" },
  ActivityReopened:   { bg: "bg-sse-sem-amber-bg",   border: "border-sse-sem-amber-border", icon: "text-sse-sem-amber-fg" },
  EvidenceAttached:   { bg: "bg-sse-pill-purple-bg", border: "border-sse-purple",           icon: "text-sse-purple" },
  EvidenceValidated:  { bg: "bg-sse-sem-green-bg",   border: "border-sse-sem-green-border", icon: "text-sse-sem-green-fg" },
  FormSubmitted:      { bg: "bg-sse-pill-purple-bg", border: "border-sse-purple",           icon: "text-sse-purple" },
  TransitionExecuted: { bg: "bg-sse-pill-blue-bg",   border: "border-sse-primary",          icon: "text-sse-primary" },
  ApprovalGranted:    { bg: "bg-sse-sem-green-bg",   border: "border-sse-sem-green-border", icon: "text-sse-sem-green-fg" },
  ApprovalRejected:   { bg: "bg-sse-sem-red-bg",     border: "border-sse-sem-red-border",   icon: "text-sse-sem-red-fg" },
  CommentAdded:       { bg: "bg-sse-pill-gray-bg",   border: "border-sse-border",           icon: "text-sse-muted" },
  AssigneeChanged:    { bg: "bg-sse-pill-gray-bg",   border: "border-sse-border",           icon: "text-sse-muted" },
};

const DEFAULT_DOT: DotStyle = {
  bg:     "bg-sse-pill-gray-bg",
  border: "border-sse-border",
  icon:   "text-sse-muted",
};

// ── relative time helper ─────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1)    return "justo ahora";
  if (diffMin < 60)   return `hace ${diffMin}m`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24)     return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1)     return "hace 1 día";
  if (days < 30)      return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return months === 1 ? "hace 1 mes" : `hace ${months} meses`;
}

// ── props ─────────────────────────────────────────────────────────────────────

interface WorkflowTimelineProps {
  entries: TimelineEntry[];
}

// ── component ─────────────────────────────────────────────────────────────────

export function WorkflowTimeline({ entries }: WorkflowTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sse-pill-gray-bg mb-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-5 h-5 text-sse-muted"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <p className="text-[13px] font-medium text-sse-ink">Sin eventos</p>
        <p className="text-[11px] text-sse-muted mt-0.5">Aún no hay actividad registrada.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[400px] pr-1">
      {sorted.map((entry, idx) => {
        const dot = EVENT_DOT[entry.eventType] ?? DEFAULT_DOT;
        const isLast = idx === sorted.length - 1;

        return (
          <div key={entry.id} className="relative flex items-start gap-2.5 pb-3">
            {/* Vertical connector line */}
            {!isLast && (
              <div className="absolute left-[8px] top-[18px] bottom-0 w-px bg-sse-border" />
            )}

            {/* Colored dot */}
            <div
              className={cn(
                "relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border",
                dot.bg,
                dot.border,
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={cn("w-2.5 h-2.5", dot.icon)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={entry.iconPath}
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-sse-ink leading-snug">
                {entry.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[11px] text-sse-muted">{entry.actorName}</span>
                <span className="text-sse-border text-[10px]">·</span>
                <span className="text-[11px] text-sse-muted">{relativeTime(entry.timestamp)}</span>
              </div>
              {entry.description && (
                <p className="text-[11px] text-sse-muted mt-0.5 leading-snug">
                  {entry.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
