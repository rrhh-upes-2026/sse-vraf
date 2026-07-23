"use client";

import { cn } from "@/lib/utils";
import type { TimelineCardProps } from "@/types/executive";

const TIPO_CONFIG: Record<string, { dot: string; label: string }> = {
  contratacion: { dot: "bg-blue-500",    label: "RRHH" },
  proyecto:     { dot: "bg-purple-500",  label: "VRAF" },
  compra:       { dot: "bg-orange-500",  label: "Compras" },
  pago:         { dot: "bg-green-500",   label: "Contabilidad" },
  mantenimiento:{ dot: "bg-yellow-500",  label: "Mantenimiento" },
  incidente:    { dot: "bg-red-500",     label: "SSO" },
  default:      { dot: "bg-muted-foreground", label: "Sistema" },
};

function fmtFecha(fecha: string): string {
  try {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-SV", { day: "2-digit", month: "short" });
  } catch { return fecha; }
}

export function TimelineCard({ events, maxItems = 10 }: TimelineCardProps) {
  const visible = events.slice(0, maxItems);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="space-y-0">
        {visible.map((ev, idx) => {
          const cfg = TIPO_CONFIG[ev.tipo] ?? TIPO_CONFIG.default;
          const isLast = idx === visible.length - 1;

          return (
            <div key={`${ev.fecha}-${idx}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1.5", cfg.dot)} />
                {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className={cn("pb-3 min-w-0", isLast && "pb-0")}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground">{fmtFecha(ev.fecha)}</span>
                  {ev.unitLabel && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{ev.unitLabel}</span>
                  )}
                </div>
                <p className="text-sm text-foreground mt-0.5 leading-snug">{ev.descripcion}</p>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Sin actividad reciente</p>
        )}
      </div>

      {events.length > maxItems && (
        <p className="text-xs text-muted-foreground text-center border-t pt-2">
          +{events.length - maxItems} eventos más
        </p>
      )}
    </div>
  );
}
