"use client";

import { useState } from "react";
import type {
  TransitionDefinition,
  ProcessInstance,
  ProcessBlueprint,
  CanAdvanceResult,
} from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { ValidationChecklist } from "./ValidationChecklist";
import { cn } from "@/lib/utils";

// ── button variant mapping ────────────────────────────────────────────────────

// TransitionDefinition.buttonVariant → Tailwind button classes
// Button component only has: primary, secondary, ghost, danger, outline
// "success" and "warning" get custom classes via className override

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-sse-primary text-white hover:bg-sse-primary-dark border-transparent",
  success: "bg-sse-sem-green-bg text-sse-sem-green-fg border border-sse-sem-green-border hover:bg-sse-sem-green-fg hover:text-white",
  danger:  "bg-sse-sem-red-bg text-sse-sem-red-fg border border-sse-sem-red-border hover:bg-sse-sem-red-fg hover:text-white",
  warning: "bg-sse-sem-amber-bg text-sse-sem-amber-fg border border-sse-sem-amber-border hover:text-sse-ink",
  outline: "border border-sse-border text-sse-ink hover:bg-sse-shell-canvas bg-sse-surface",
};

const LOCK_PATH =
  "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z";

// ── props ─────────────────────────────────────────────────────────────────────

interface TransitionPanelProps {
  transitions: TransitionDefinition[];
  instance:    ProcessInstance;
  blueprint:   ProcessBlueprint;
  canAdvance:  (transitionId: string) => CanAdvanceResult;
  onExecute:   (transitionId: string, comment?: string) => Promise<void>;
}

// ── single transition item ────────────────────────────────────────────────────

interface TransitionItemProps {
  transition: TransitionDefinition;
  advance:    CanAdvanceResult;
  onExecute:  (comment?: string) => Promise<void>;
}

function TransitionItem({ transition, advance, onExecute }: TransitionItemProps) {
  const [expanded,   setExpanded]  = useState(false);
  const [comment,    setComment]   = useState("");
  const [executing,  setExecuting] = useState(false);

  const variantClass =
    VARIANT_CLASSES[transition.buttonVariant ?? "primary"] ?? VARIANT_CLASSES.primary;

  const confirmDisabled =
    executing ||
    !advance.ok ||
    (transition.requiresComment && !comment.trim());

  async function handleConfirm() {
    setExecuting(true);
    try {
      await onExecute(comment.trim() || undefined);
    } finally {
      setExecuting(false);
      setExpanded(false);
      setComment("");
    }
  }

  return (
    <div className="border border-sse-border rounded-md overflow-hidden">
      {/* Trigger row */}
      <div className="flex items-center gap-2 p-3">
        {!advance.ok && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="w-4 h-4 text-sse-sem-amber-fg shrink-0"
            aria-label="Transición bloqueada"
            role="img"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={LOCK_PATH} />
          </svg>
        )}

        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          disabled={executing}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2 rounded-sm h-9 px-4 text-[13px] font-medium",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            variantClass,
          )}
        >
          {transition.label}
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className={cn("w-3.5 h-3.5 transition-transform", expanded && "rotate-180")}
          >
            <path
              fillRule="evenodd"
              d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Expanded confirmation panel */}
      {expanded && (
        <div className="px-3 pb-3 pt-3 border-t border-sse-border bg-sse-shell-canvas space-y-3">
          {/* Validation checklist — shows blockers or "all clear" */}
          <ValidationChecklist
            results={advance.blockers}
            transition={transition}
          />

          {/* Confirmation message */}
          {transition.confirmationMessage && (
            <p className="text-[12px] text-sse-muted italic">
              {transition.confirmationMessage}
            </p>
          )}

          {/* Comment field */}
          {transition.requiresComment && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted block mb-1">
                Comentario <span className="text-sse-sem-red-fg">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Escriba un comentario para esta transición…"
                className="w-full resize-none rounded-sm border border-sse-border bg-sse-surface px-2.5 py-1.5 text-[12px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExpanded(false);
                setComment("");
              }}
              disabled={executing}
            >
              Cancelar
            </Button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmDisabled}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-sm h-7 px-3 text-[12px] font-medium",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-50",
                variantClass,
              )}
            >
              {executing ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ejecutando…
                </>
              ) : (
                "Confirmar"
              )}
            </button>
          </div>

          {/* Blocker list (extra detail when locked) */}
          {!advance.ok && advance.blockers.length > 0 && (
            <div className="text-[11px] text-sse-sem-red-fg space-y-0.5 pt-1 border-t border-sse-sem-red-border">
              <p className="font-semibold text-[10px] uppercase tracking-wide mb-1">
                Requisitos pendientes:
              </p>
              {advance.blockers.map((b) => (
                <p key={b.ruleId}>· {b.message ?? b.ruleLabel}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── main panel ────────────────────────────────────────────────────────────────

export function TransitionPanel({
  transitions,
  canAdvance,
  onExecute,
}: TransitionPanelProps) {
  if (transitions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-[12px] font-semibold text-sse-muted uppercase tracking-wide">
        Acciones disponibles
      </h3>

      <div
        className={cn(
          "space-y-2",
          transitions.length >= 2 && "sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0",
        )}
      >
        {transitions.map((t) => (
          <TransitionItem
            key={t.id}
            transition={t}
            advance={canAdvance(t.id)}
            onExecute={(comment) => onExecute(t.id, comment)}
          />
        ))}
      </div>
    </div>
  );
}
