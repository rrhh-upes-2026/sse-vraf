import { cn } from "@/lib/utils";
import { fmtDateTime } from "@/lib/format";
import type { BadgeVariant } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";

export interface TimelineEntry {
  fecha: string;
  accion: string;
  usuario?: string;
  detalle?: string;
  variant?: BadgeVariant;
}

interface TimelineSectionProps {
  entries: TimelineEntry[];
  title?: string;
}


export function TimelineSection({ entries, title = "Bitácora" }: TimelineSectionProps) {
  if (entries.length === 0) {
    return (
      <div className="text-[12px] text-sse-muted py-2">Sin eventos registrados.</div>
    );
  }

  return (
    <div>
      {title && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted mb-3">{title}</p>
      )}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-sse-border" />
        <div className="space-y-3">
          {entries.map((e, i) => (
            <div key={i} className="flex items-start gap-3 relative">
              <div className={cn(
                "mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 z-10",
                e.variant === "success" ? "border-sse-sem-green-fg bg-sse-sem-green-bg" :
                e.variant === "danger"  ? "border-sse-sem-red-fg bg-sse-sem-red-bg" :
                e.variant === "warning" ? "border-sse-sem-amber-fg bg-sse-sem-amber-bg" :
                "border-sse-primary bg-sse-pill-blue-bg",
              )} />
              <div className="flex-1 min-w-0 -mt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={e.variant ?? "default"} className="text-[10px]">{e.accion}</Badge>
                  {e.usuario && (
                    <span className="text-[11px] text-sse-ink font-medium">{e.usuario}</span>
                  )}
                  <span className="text-[10px] text-sse-muted">{fmtDateTime(e.fecha)}</span>
                </div>
                {e.detalle && (
                  <p className="text-[11px] text-sse-muted mt-0.5">{e.detalle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
