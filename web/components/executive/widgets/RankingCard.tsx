"use client";

import { cn } from "@/lib/utils";
import type { RankingCardProps, KPISemaforo } from "@/types/executive";

const SEMAFORO_BAR: Record<KPISemaforo, string> = {
  verde:    "bg-emerald-500",
  amarillo: "bg-amber-500",
  rojo:     "bg-red-500",
};

const SEMAFORO_TEXT: Record<KPISemaforo, string> = {
  verde:    "text-emerald-600 dark:text-emerald-400",
  amarillo: "text-amber-600 dark:text-amber-400",
  rojo:     "text-red-600 dark:text-red-400",
};

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

export function RankingCard({ title, items, maxItems = 5 }: RankingCardProps) {
  const visible = items.slice(0, maxItems);
  const maxVal  = Math.max(...visible.map(i => i.valor), 1);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold">{title}</h3>

      <div className="space-y-3">
        {visible.map((item, idx) => {
          const pct = (item.valor / maxVal) * 100;
          const sem = item.semaforo;

          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm flex-shrink-0">{RANK_MEDAL[idx] ?? `${idx + 1}.`}</span>
                  <span className="text-sm font-medium truncate">{item.label}</span>
                </div>
                <span className={cn("text-sm font-bold tabular-nums flex-shrink-0", sem ? SEMAFORO_TEXT[sem] : "text-foreground")}>
                  {item.valor.toLocaleString("es-SV")}{item.unidad ? ` ${item.unidad}` : ""}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", sem ? SEMAFORO_BAR[sem] : "bg-primary")}
                  style={{ width: `${pct}%`, ...(item.color && !sem ? { backgroundColor: item.color } : {}) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {items.length > maxItems && (
        <p className="text-xs text-muted-foreground text-center">
          +{items.length - maxItems} más
        </p>
      )}
    </div>
  );
}
