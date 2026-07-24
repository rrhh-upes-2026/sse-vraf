import type { HistorialEntry } from "@/types/entities";
import { cn } from "@/lib/utils";
import { fmtRelative, fmtDateTimeMedium } from "@/lib/format";

const ACCION_CONFIG: Record<HistorialEntry["accion"], { label: string; color: string; icon: string }> = {
  creado:         { label: "Creado",          color: "text-sse-sem-green-fg", icon: "M12 4v16m8-8H4" },
  modificado:     { label: "Modificado",      color: "text-sse-primary",      icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  estado_cambiado:{ label: "Estado",          color: "text-sse-sem-amber-fg",   icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  comentario:     { label: "Comentario",      color: "text-sse-muted",        icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  adjunto:        { label: "Adjunto",         color: "text-sse-muted",        icon: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" },
  aprobado:       { label: "Aprobado",        color: "text-sse-sem-green-fg", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  rechazado:      { label: "Rechazado",       color: "text-sse-sem-red-fg",   icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
};

interface HistorialSectionProps {
  historial?: HistorialEntry[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export function HistorialSection({ historial, createdAt, updatedAt, createdBy }: HistorialSectionProps) {
  const entries: HistorialEntry[] = historial ?? [];

  if (entries.length === 0 && !createdAt) return null;

  return (
    <div className="mt-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted mb-2">Historial</p>
      <div className="space-y-2.5">
        {entries.map((e, i) => {
          const cfg = ACCION_CONFIG[e.accion] ?? ACCION_CONFIG.modificado;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-sse-shell-canvas border border-sse-border flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                  className={cn("w-3 h-3", cfg.color)}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn("text-[11px] font-semibold", cfg.color)}>{cfg.label}</span>
                  <span className="text-[11px] text-sse-ink">{e.usuarioNombre}</span>
                  <span className="text-[10px] text-sse-muted">{fmtRelative(e.fecha)}</span>
                </div>
                {e.detalle && (
                  <p className="text-[11px] text-sse-muted mt-0.5">{e.detalle}</p>
                )}
              </div>
            </div>
          );
        })}

        {createdAt && (
          <div className="flex items-start gap-2.5 opacity-60">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-sse-shell-canvas border border-sse-border flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 text-sse-sem-green-fg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-sse-sem-green-fg">Creado</span>
                {createdBy && <span className="text-[11px] text-sse-ink">{createdBy}</span>}
                <span className="text-[10px] text-sse-muted">{fmtRelative(createdAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {updatedAt && updatedAt !== createdAt && (
        <p className="mt-2 text-[10px] text-sse-muted">
          Última modificación: {fmtDateTimeMedium(updatedAt)}
        </p>
      )}
    </div>
  );
}
