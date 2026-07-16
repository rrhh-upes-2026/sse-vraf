"use client";

import type { ValidationResult, TransitionDefinition } from "@/types/workflow";
import { cn } from "@/lib/utils";

// ── icon paths ────────────────────────────────────────────────────────────────

const CHECK_PATH = "M5 13l4 4L19 7";
const X_PATH     = "M6 18L18 6M6 6l12 12";

// ── props ─────────────────────────────────────────────────────────────────────

interface ValidationChecklistProps {
  results:    ValidationResult[];
  transition: TransitionDefinition;
}

// ── component ─────────────────────────────────────────────────────────────────

export function ValidationChecklist({ results, transition }: ValidationChecklistProps) {
  // Empty = no restrictions; treat as all-passed
  if (results.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sse-sem-green-fg text-[12px]">
        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sse-sem-green-bg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="w-2.5 h-2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={CHECK_PATH} />
          </svg>
        </div>
        Sin restricciones — puede ejecutar esta transición.
      </div>
    );
  }

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed   = passedCount === results.length;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted">
          Requisitos: {transition.label}
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold",
            allPassed ? "text-sse-sem-green-fg" : "text-sse-sem-red-fg",
          )}
        >
          {passedCount} de {results.length} cumplidos
        </span>
      </div>

      {/* Rule list */}
      <div className="space-y-1.5">
        {results.map((r) => (
          <div key={r.ruleId} className="flex items-start gap-2">
            {/* Icon */}
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border",
                r.passed
                  ? "bg-sse-sem-green-bg border-sse-sem-green-border"
                  : "bg-sse-sem-red-bg border-sse-sem-red-border",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className={cn(
                  "w-2.5 h-2.5",
                  r.passed ? "text-sse-sem-green-fg" : "text-sse-sem-red-fg",
                )}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={r.passed ? CHECK_PATH : X_PATH}
                />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-sse-ink leading-snug">{r.ruleLabel}</p>
              {!r.passed && r.message && (
                <p className="text-[11px] text-sse-sem-red-fg mt-0.5 leading-snug">
                  {r.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* All-passed banner */}
      {allPassed && (
        <div className="flex items-center gap-1.5 text-sse-sem-green-fg text-[12px] pt-1 border-t border-sse-sem-green-border">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-3.5 h-3.5 shrink-0"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={CHECK_PATH} />
          </svg>
          Todos los requisitos cumplidos — puede continuar.
        </div>
      )}
    </div>
  );
}
