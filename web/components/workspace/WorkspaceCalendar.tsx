"use client";

import { useQuery } from "@tanstack/react-query";
import type { WorkspaceId } from "@/config/nav";
import type { ProcesoInstitucional } from "@/types/entities";
import type { CapacitacionEmpleado } from "@/types/hr";
import { useProcesos } from "@/hooks/useProcesos";
import { CapacitacionesService } from "@/services";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface WorkspaceCalendarProps {
  wsId: WorkspaceId;
}

// ── types ─────────────────────────────────────────────────────────────────────

type EventType = "proceso" | "capacitacion" | "solicitud";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: EventType;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const TYPE_BORDER: Record<EventType, string> = {
  proceso:     "border-l-sse-primary",
  capacitacion: "border-l-[#E5A100]",
  solicitud:   "border-l-sse-sem-red-fg",
};

const TYPE_BADGE_VARIANT = {
  proceso:     "info",
  capacitacion: "warning",
  solicitud:   "danger",
} as const;

const TYPE_LABEL: Record<EventType, string> = {
  proceso:     "Proceso",
  capacitacion: "Capacitación",
  solicitud:   "Solicitud",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-SV", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function DateChip({ date }: { date: Date }) {
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isPast = diff < 0;
  const isNear = diff >= 0 && diff <= 7;

  return (
    <div
      className={cn(
        "shrink-0 w-[72px] text-right",
      )}
    >
      <p
        className={cn(
          "text-[12px] font-semibold leading-tight",
          isPast ? "text-sse-sem-red-fg" : isNear ? "text-sse-sem-amber-fg" : "text-sse-ink",
        )}
      >
        {formatDate(date)}
      </p>
      {isPast ? (
        <p className="text-[10px] text-sse-sem-red-fg mt-0.5">Vencido</p>
      ) : isNear ? (
        <p className="text-[10px] text-sse-sem-amber-fg mt-0.5">En {diff}d</p>
      ) : null}
    </div>
  );
}

// ── event row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 py-3 border-b border-sse-border last:border-b-0",
        "pl-3 border-l-4",
        TYPE_BORDER[event.type],
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-sse-ink leading-snug truncate">{event.title}</p>
        <div className="mt-1">
          <Badge variant={TYPE_BADGE_VARIANT[event.type]}>{TYPE_LABEL[event.type]}</Badge>
        </div>
      </div>
      <DateChip date={event.date} />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function WorkspaceCalendar({ wsId }: WorkspaceCalendarProps) {
  const { data: procesos, isLoading: loadingProcesos } = useProcesos({ unidadId: wsId });

  // Only fetch capacitaciones for RRHH workspace
  const isRrhh = wsId === "rrhh";
  const { data: capacitaciones, isLoading: loadingCap } = useQuery<CapacitacionEmpleado[]>({
    queryKey: ["capacitaciones"],
    queryFn: () => CapacitacionesService.list(),
    enabled: isRrhh,
  });

  const isLoading = loadingProcesos || (isRrhh && loadingCap);

  // Build events list
  const events: CalendarEvent[] = [];

  // Process deadlines
  (procesos ?? []).forEach((p: ProcesoInstitucional) => {
    events.push({
      id: `proc-${p.id}`,
      date: new Date(p.fechaLimite),
      title: `Vence: ${p.nombre}`,
      type: "proceso",
    });
  });

  // Capacitaciones (only for rrhh)
  if (isRrhh) {
    (capacitaciones ?? []).forEach((c: CapacitacionEmpleado) => {
      events.push({
        id: `cap-${c.id}`,
        date: new Date(c.fechaInicio),
        title: c.nombre,
        type: "capacitacion",
      });
    });
  }

  // Sort ascending by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Split into upcoming and past
  const now = new Date();
  const upcoming = events.filter((e) => e.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const past = events.filter((e) => e.date < new Date(now.getFullYear(), now.getMonth(), now.getDate()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Calendario</h1>
        {!isLoading && (
          <span className="text-[12px] text-sse-muted">
            {upcoming.length} evento{upcoming.length !== 1 ? "s" : ""} próximos
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <EmptyState
          icon="M4 8h16M7 3v3M17 3v3M5 5h14v14H5z"
          title="Sin eventos próximos"
          description="No hay fechas límite ni capacitaciones programadas."
        />
      )}

      {!isLoading && upcoming.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted mb-2">
            Próximos
          </p>
          <div className="bg-sse-surface rounded-md border border-sse-border px-4">
            {upcoming.map((e) => <EventRow key={e.id} event={e} />)}
          </div>
        </div>
      )}

      {!isLoading && past.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted mb-2">
            Pasados
          </p>
          <div className="bg-sse-surface rounded-md border border-sse-border px-4 opacity-60">
            {past.slice(-5).map((e) => <EventRow key={e.id} event={e} />)}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        {([
          { type: "proceso" as EventType, label: "Vencimiento proceso" },
          ...(isRrhh ? [{ type: "capacitacion" as EventType, label: "Capacitación" }] : []),
        ]).map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1.5">
            <Badge variant={TYPE_BADGE_VARIANT[type]}>{label}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
