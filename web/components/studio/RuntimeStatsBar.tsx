"use client";

import { cn } from "@/lib/utils";
import type { RuntimeStats } from "@/types/studio";

interface StatCardProps {
  label: string;
  value: string | number;
  accentClass: string;
}

function StatCard({ label, value, accentClass }: StatCardProps) {
  return (
    <div className="flex-1 min-w-[120px] bg-sse-surface border border-sse-border rounded-md px-4 pt-4 pb-0 overflow-hidden">
      <p className="text-[28px] font-bold text-sse-ink leading-none">{value}</p>
      <p className="text-[12px] text-sse-muted mt-1 mb-3">{label}</p>
      <div className={cn("h-1 w-full rounded-full mt-auto", accentClass)} />
    </div>
  );
}

interface RuntimeStatsBarProps {
  stats: RuntimeStats;
}

export function RuntimeStatsBar({ stats }: RuntimeStatsBarProps) {
  const avgLabel =
    stats.avgCompletionDays === null ? "N/A" : `${stats.avgCompletionDays}d`;

  return (
    <div className="flex flex-wrap gap-3">
      <StatCard
        label="En curso"
        value={stats.running}
        accentClass="bg-sse-primary"
      />
      <StatCard
        label="Completadas"
        value={stats.completed}
        accentClass="bg-sse-sem-green-fg"
      />
      <StatCard
        label="Bloqueadas"
        value={stats.blocked}
        accentClass="bg-sse-sem-red-fg"
      />
      <StatCard
        label="Canceladas"
        value={stats.cancelled}
        accentClass="bg-sse-sem-amber-fg"
      />
      <StatCard
        label="Días promedio"
        value={avgLabel}
        accentClass="bg-teal-500"
      />
    </div>
  );
}
