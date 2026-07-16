"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAvailableTransitions } from "@/lib/studio/blueprintLifecycle";
import { cn } from "@/lib/utils";
import type { BlueprintMetadata, BlueprintLifecycleTransition } from "@/types/studio";

const ACTION_CONFIG: Record<
  BlueprintLifecycleTransition,
  { label: string; variant: "primary" | "secondary" | "outline" | "danger"; destructive?: boolean }
> = {
  submit:     { label: "Enviar a validación", variant: "secondary" },
  publish:    { label: "Publicar",            variant: "primary" },
  reject:     { label: "Rechazar",            variant: "outline" },
  deprecate:  { label: "Deprecar",            variant: "outline",  destructive: true },
  archive:    { label: "Archivar",            variant: "danger",   destructive: true },
  reactivate: { label: "Reactivar",           variant: "secondary" },
};

interface BlueprintLifecycleActionsProps {
  blueprint: BlueprintMetadata;
  onTransition: (action: BlueprintLifecycleTransition) => Promise<void>;
  isLoading?: boolean;
}

export function BlueprintLifecycleActions({
  blueprint,
  onTransition,
  isLoading = false,
}: BlueprintLifecycleActionsProps) {
  const [pendingConfirm, setPendingConfirm] = useState<BlueprintLifecycleTransition | null>(null);

  const available = getAvailableTransitions(blueprint.status);

  if (available.length === 0) return null;

  const handleClick = async (action: BlueprintLifecycleTransition) => {
    const cfg = ACTION_CONFIG[action];
    if (cfg.destructive && pendingConfirm !== action) {
      setPendingConfirm(action);
      return;
    }
    setPendingConfirm(null);
    await onTransition(action);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {available.map((action) => {
        const cfg = ACTION_CONFIG[action];
        const isConfirming = pendingConfirm === action;

        return (
          <div key={action} className="flex items-center gap-1.5">
            {isConfirming && (
              <div className={cn(
                "flex items-center gap-1.5 text-[12px] text-sse-muted",
                "bg-sse-surface border border-sse-border rounded-sm px-2 py-1",
              )}>
                <span>¿Confirmar?</span>
                <button
                  onClick={() => handleClick(action)}
                  disabled={isLoading}
                  className="text-sse-sem-red-fg font-medium hover:underline"
                >
                  Sí
                </button>
                <span>/</span>
                <button
                  onClick={() => setPendingConfirm(null)}
                  className="text-sse-muted hover:underline"
                >
                  No
                </button>
              </div>
            )}
            {!isConfirming && (
              <Button
                variant={cfg.variant}
                size="sm"
                disabled={isLoading}
                onClick={() => handleClick(action)}
              >
                {cfg.label}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
