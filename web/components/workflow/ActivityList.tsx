"use client";

import type { InstanceActivity, ActivityState } from "@/types/workflow";
import { ActivityCard } from "./ActivityCard";
import { cn } from "@/lib/utils";

// ── sorting ───────────────────────────────────────────────────────────────────

const STATUS_ORDER: Record<ActivityState, number> = {
  en_progreso: 0,
  pendiente:   1,
  bloqueada:   2,
  completada:  3,
  cancelada:   4,
};

// ── props ─────────────────────────────────────────────────────────────────────

interface ActivityListProps {
  activities:         InstanceActivity[];
  stageId:            string;
  onCompleteActivity: (activityId: string, data?: Record<string, unknown>) => void;
  onReopenActivity:   (activityId: string) => void;
  onAddComment:       (activityId: string, texto: string) => void;
}

// ── component ─────────────────────────────────────────────────────────────────

export function ActivityList({
  activities,
  stageId,
  onCompleteActivity,
  onReopenActivity,
  onAddComment,
}: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <p className="text-[13px] text-sse-muted py-4 text-center">
        Esta etapa no tiene actividades definidas.
      </p>
    );
  }

  const sorted = [...activities].sort(
    (a, b) => (STATUS_ORDER[a.estado] ?? 9) - (STATUS_ORDER[b.estado] ?? 9),
  );

  // Group into buckets so we can render section labels
  const inProgress = sorted.filter((a) => a.estado === "en_progreso");
  const pending    = sorted.filter((a) => a.estado === "pendiente" || a.estado === "bloqueada");
  const done       = sorted.filter((a) => a.estado === "completada" || a.estado === "cancelada");

  const groups: Array<{ label: string; items: InstanceActivity[] }> = [
    { label: "En progreso", items: inProgress },
    { label: "Pendiente",   items: pending },
    { label: "Completada",  items: done },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          {groups.length > 1 && (
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide mb-2",
                group.label === "En progreso"
                  ? "text-sse-primary"
                  : group.label === "Completada"
                  ? "text-sse-sem-green-fg"
                  : "text-sse-muted",
              )}
            >
              {group.label} · {group.items.length}
            </p>
          )}
          <div className="space-y-2">
            {group.items.map((activity) => (
              <ActivityCard
                key={activity.defId}
                activity={activity}
                stageId={stageId}
                onComplete={(data) => onCompleteActivity(activity.defId, data)}
                onReopen={() => onReopenActivity(activity.defId)}
                onAddComment={(texto) => onAddComment(activity.defId, texto)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
