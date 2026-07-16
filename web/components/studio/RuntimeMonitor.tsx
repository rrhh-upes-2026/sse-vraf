"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RuntimeStatsBar } from "./RuntimeStatsBar";
import { InstanceTable } from "./InstanceTable";
import { InstanceFactory } from "./InstanceFactory";
import { useRuntimeStats } from "@/hooks/useRuntimeMonitor";
import { useBlueprintRegistry } from "@/hooks/useBlueprintRegistry";
import { cn } from "@/lib/utils";
import type { WorkflowState } from "@/types/workflow";
import type { BlueprintMetadata } from "@/types/studio";

type StateFilter = "all" | "in_progress" | "blocked" | "completed";

const FILTER_LABELS: Record<StateFilter, string> = {
  all:         "Todos",
  in_progress: "En curso",
  blocked:     "Bloqueados",
  completed:   "Completados",
};

const STATE_FILTER_MAP: Record<StateFilter, WorkflowState | null> = {
  all:         null,
  in_progress: "in_progress",
  blocked:     "blocked",
  completed:   "completed",
};

export function RuntimeMonitor() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | undefined>(undefined);
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [showFactory, setShowFactory] = useState(false);

  const { stats, summaries, isLoading } = useRuntimeStats(selectedBlueprintId);
  const { data: blueprints = [] } = useBlueprintRegistry();

  const filteredSummaries = summaries.filter((s) => {
    const targetState = STATE_FILTER_MAP[stateFilter];
    return targetState === null || s.estado === targetState;
  });

  function handleAction(action: string, id: string) {
    console.info("[RuntimeMonitor] action:", action, "on instance:", id);
  }

  const chipBase =
    "px-3 h-7 rounded-sm text-[12px] font-medium transition-colors cursor-pointer border";
  const chipActive =
    "bg-sse-primary text-white border-sse-primary";
  const chipInactive =
    "bg-sse-surface text-sse-muted border-sse-border hover:border-sse-primary hover:text-sse-ink";

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-[16px] font-bold text-sse-ink">Runtime Monitor</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedBlueprintId(undefined);
            }}
          >
            Actualizar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowFactory(true)}
          >
            Nueva Instancia
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          className={cn(
            "h-7 px-3 rounded-sm border border-sse-border bg-sse-surface",
            "text-[13px] text-sse-ink focus:outline-none focus:ring-2 focus:ring-sse-primary/40",
          )}
          value={selectedBlueprintId ?? ""}
          onChange={(e) =>
            setSelectedBlueprintId(e.target.value || undefined)
          }
        >
          <option value="">Todos los blueprints</option>
          {blueprints.map((b: BlueprintMetadata) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          {(Object.keys(FILTER_LABELS) as StateFilter[]).map((f) => (
            <button
              key={f}
              className={cn(chipBase, stateFilter === f ? chipActive : chipInactive)}
              onClick={() => setStateFilter(f)}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <RuntimeStatsBar stats={stats} />

      <InstanceTable
        summaries={filteredSummaries}
        isLoading={isLoading}
        onAction={handleAction}
      />

      {showFactory && (
        <InstanceFactory
          onClose={() => setShowFactory(false)}
          onCreated={() => setShowFactory(false)}
        />
      )}
    </div>
  );
}
