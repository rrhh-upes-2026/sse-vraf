"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InstanceSummary } from "@/types/studio";
import type { WorkflowState } from "@/types/workflow";

interface InstanceActionsProps {
  summary: InstanceSummary;
  onAction?: (action: string, id: string) => void;
}

interface ActionDef {
  label: string;
  variant: "outline" | "danger" | "secondary" | "ghost";
  key: string;
}

const ACTIONS_BY_STATE: Partial<Record<WorkflowState, ActionDef[]>> = {
  in_progress: [
    { label: "Pausar",   variant: "outline", key: "pause"  },
    { label: "Cancelar", variant: "danger",  key: "cancel" },
  ],
  waiting: [
    { label: "Reanudar", variant: "secondary", key: "resume" },
    { label: "Cancelar", variant: "danger",    key: "cancel" },
  ],
  blocked: [
    { label: "Cancelar", variant: "danger", key: "cancel" },
  ],
  completed: [
    { label: "Archivar", variant: "ghost",   key: "archive" },
    { label: "Clonar",   variant: "outline", key: "clone"   },
  ],
  cancelled: [
    { label: "Archivar", variant: "ghost", key: "archive" },
  ],
};

export function InstanceActions({ summary, onAction }: InstanceActionsProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const actions = ACTIONS_BY_STATE[summary.estado] ?? [];

  if (actions.length === 0) return null;

  function handleClick(action: ActionDef) {
    onAction?.(action.key, summary.id);
    setFeedback(action.label);
    setTimeout(() => setFeedback(null), 2000);
  }

  return (
    <div className="flex items-center gap-1.5">
      {feedback ? (
        <span
          className={cn(
            "text-[11px] px-2 py-0.5 rounded-sm",
            "bg-sse-sem-green-bg text-sse-sem-green-fg border border-sse-sem-green-border",
          )}
        >
          {feedback}
        </span>
      ) : (
        actions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant}
            size="sm"
            onClick={() => handleClick(action)}
          >
            {action.label}
          </Button>
        ))
      )}
    </div>
  );
}
