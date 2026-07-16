"use client";

import type { StageInstance } from "@/types/workflow";
import { cn } from "@/lib/utils";

// ── icons ─────────────────────────────────────────────────────────────────────

const CHECK_PATH = "M5 13l4 4L19 7";
const X_PATH     = "M6 18 18 6M6 6l12 12";

// ── component ─────────────────────────────────────────────────────────────────

interface WorkflowProgressBarProps {
  stages:         StageInstance[];
  currentStageId: string;
}

export function WorkflowProgressBar({
  stages,
  currentStageId,
}: WorkflowProgressBarProps) {
  const sorted = [...stages].sort((a, b) => a.orden - b.orden);

  return (
    <div className="bg-sse-surface border border-sse-border rounded-lg px-4 py-3">
      <div className="flex items-start overflow-x-auto pb-1">
        {sorted.map((stage, idx) => {
          const isCompleted = stage.estado === "completada";
          const isActive    = stage.defId === currentStageId;
          const isRejected  = stage.estado === "rechazada";
          const isOmitted   = stage.estado === "omitida";
          const isLast      = idx === sorted.length - 1;

          return (
            <div key={stage.defId} className="flex items-start flex-1 min-w-0">
              {/* Circle + label */}
              <div className="flex flex-col items-center flex-shrink-0 w-[56px]">
                {/* Pulsing wrapper for active */}
                <div className={cn(isActive && "relative")}>
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-sse-primary opacity-30 animate-ping" />
                  )}
                  <div
                    className={cn(
                      "relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors",
                      isCompleted && "bg-sse-sem-green-fg border-sse-sem-green-fg text-white",
                      isActive    && "bg-sse-primary border-sse-primary text-white",
                      isRejected  && "bg-sse-sem-red-fg border-sse-sem-red-fg text-white",
                      isOmitted   && "bg-sse-border border-sse-border text-sse-muted opacity-50",
                      !isCompleted && !isActive && !isRejected && !isOmitted &&
                        "bg-sse-surface border-sse-border text-sse-muted",
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        className="w-3.5 h-3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={CHECK_PATH} />
                      </svg>
                    ) : isRejected ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        className="w-3.5 h-3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={X_PATH} />
                      </svg>
                    ) : (
                      stage.orden
                    )}
                  </div>
                </div>

                {/* Shortened label */}
                <span
                  className={cn(
                    "text-[9px] mt-1 text-center leading-tight w-[56px] truncate px-0.5",
                    isActive    && "text-sse-primary font-semibold",
                    isCompleted && "text-sse-sem-green-fg",
                    isRejected  && "text-sse-sem-red-fg",
                    !isActive && !isCompleted && !isRejected && "text-sse-muted",
                  )}
                  title={stage.label}
                >
                  {stage.label.length > 12
                    ? stage.label.slice(0, 12) + "…"
                    : stage.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "h-[2px] flex-1 mt-3.5 mx-0.5",
                    isCompleted ? "bg-sse-sem-green-fg" : "bg-sse-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
