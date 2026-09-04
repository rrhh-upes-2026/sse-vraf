"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { getUnidad } from "@/types/unidad";
import { useMonitoreoIndicadores } from "@/hooks/useMonitoreoIndicadores";
import { useIndicadorMetaStore } from "@/store/useIndicadorMetaStore";
import { useEvidenciaMetaStore } from "@/store/useEvidenciaMetaStore";
import { useMonitoreoEvidencias } from "@/hooks/useMonitoreoEvidencias";

// ── Types ──────────────────────────────────────────────────────────────────────

type EventCategory = "indicadores" | "evidencias" | "reportes";

interface CalEvent {
  day: number;
  month: number; // 0-indexed
  year: number;
  category: EventCategory;
  label: string;
  sub?: string; // secondary detail (indicator name)
}

// ── Category styles ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; dot: string; badge: string }
> = {
  indicadores: {
    label: "Indicadores",
    dot:   "bg-[#2563EB]",
    badge: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  },
  evidencias: {
    label: "Evidencias",
    dot:   "bg-[#059669]",
    badge: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
  },
  reportes: {
    label: "Reportes",
    dot:   "bg-[#D97706]",
    badge: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
  },
};

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DOW_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayISO(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

function isToday(year: number, month: number, day: number): boolean {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
}

function fmtFullDate(year: number, month: number, day: number): string {
  return new Intl.DateTimeFormat("es-SV", { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(year, month, day));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((cat) => {
        const cfg = CATEGORY_CONFIG[cat];
        return (
          <span key={cat} className="flex items-center gap-1.5 text-[12px] text-sse-muted">
            <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}

interface DayCellProps {
  day: number | null;
  events: CalEvent[];
  selected: boolean;
  today: boolean;
  onClick: () => void;
}

function DayCell({ day, events, selected, today, onClick }: DayCellProps) {
  if (!day) {
    return <div className="min-h-[72px] rounded-lg" />;
  }

  const cats = Array.from(new Set(events.map((e) => e.category)));

  return (
    <button
      onClick={onClick}
      className={[
        "min-h-[72px] w-full rounded-lg border p-1.5 text-left transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary",
        selected
          ? "border-sse-primary bg-sse-primary/5"
          : "border-sse-border bg-sse-surface hover:border-sse-primary/40",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium",
          today
            ? "bg-sse-primary text-white"
            : selected
            ? "text-sse-primary"
            : "text-sse-ink",
        ].join(" ")}
      >
        {day}
      </span>

      {cats.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {cats.map((cat) => (
            <span
              key={cat}
              className={`h-2 w-2 rounded-full ${CATEGORY_CONFIG[cat].dot}`}
              title={CATEGORY_CONFIG[cat].label}
            />
          ))}
        </div>
      )}

      {events[0] && (
        <p className="mt-1 truncate text-[9px] leading-tight text-sse-muted">
          {events[0].label}
        </p>
      )}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const params = useParams();
  const wsId = params?.wsId as string;
  const unidad = getUnidad(wsId);

  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Real indicator data
  const { data: indicadores = [] } = useMonitoreoIndicadores(wsId);
  const { getMeta }                = useIndicadorMetaStore();
  const { getMeta: getEvMeta }     = useEvidenciaMetaStore();
  const { data: evidencias }       = useMonitoreoEvidencias(wsId);

  // Months that trigger delivery per frequency
  function getDeliveryMonths(frecuencia: string): number[] {
    switch (frecuencia) {
      case "trimestral": return [2, 5, 8, 11]; // Mar, Jun, Sep, Dec (0-indexed)
      case "semestral":  return [5, 11];
      case "anual":      return [11];
      default:           return [0,1,2,3,4,5,6,7,8,9,10,11]; // mensual
    }
  }

  // Build events from indicator delivery dates AND evidencia deadlines
  const events = useMemo<CalEvent[]>(() => {
    const result: CalEvent[] = [];

    // Indicator delivery dates (from useIndicadorMetaStore)
    for (const ind of indicadores) {
      const meta = getMeta(wsId, ind.id);
      if (!meta.fechaEntrega) continue;
      const d = new Date(meta.fechaEntrega + "T00:00:00");
      if (isNaN(d.getTime())) continue;
      result.push({
        day:      d.getDate(),
        month:    d.getMonth(),
        year:     d.getFullYear(),
        category: "indicadores",
        label:    ind.nombre,
        sub:      ind.responsable || undefined,
      });
    }

    // Evidencia deadlines — one event per delivery month of the current year
    const allIndicadores = (evidencias?.areas ?? []).flatMap((a) => a.indicadores);
    for (const ind of allIndicadores) {
      const evMeta = getEvMeta(wsId, ind.id);
      if (!evMeta.frecuencia || !evMeta.diaVencimiento) continue;
      const months = getDeliveryMonths(evMeta.frecuencia);
      for (const m of months) {
        result.push({
          day:      evMeta.diaVencimiento,
          month:    m,
          year:     year, // current calendar year
          category: "evidencias",
          label:    ind.nombre,
          sub:      evMeta.nombreDocumento || evMeta.frecuencia,
        });
      }
    }

    return result;
  }, [indicadores, getMeta, wsId, evidencias, getEvMeta, year]);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayISO = getFirstDayISO(year, month);

  const cells = useMemo<(number | null)[]>(() => {
    const arr: (number | null)[] = Array(firstDayISO).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [firstDayISO, daysInMonth]);

  // Events for this month only
  const monthEvents = useMemo(
    () => events.filter((e) => e.year === year && e.month === month),
    [events, year, month],
  );

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalEvent[]> = {};
    for (const ev of monthEvents) {
      if (!map[ev.day]) map[ev.day] = [];
      map[ev.day].push(ev);
    }
    return map;
  }, [monthEvents]);

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];
  const listEvents = selectedDay
    ? selectedEvents
    : monthEvents.slice().sort((a, b) => a.day - b.day);

  // Upcoming: next event from today across all months
  const upcomingEvent = useMemo(() => {
    const nowMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return events
      .map((e) => ({ ev: e, ms: new Date(e.year, e.month, e.day).getTime() }))
      .filter(({ ms }) => ms >= nowMs)
      .sort((a, b) => a.ms - b.ms)[0]?.ev ?? null;
  }, [events, today]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-[20px] font-semibold text-sse-ink leading-tight">
          Calendario{unidad ? ` — ${unidad.nombre}` : ""}
        </h1>
        <p className="mt-1 text-[13px] text-sse-muted">
          Fechas límite de entrega de indicadores y evidencias por indicador.
        </p>
      </div>

      {/* No events notice */}
      {events.length === 0 && (
        <div className="rounded-xl border border-dashed border-sse-border bg-sse-surface px-5 py-6 text-center">
          <p className="text-[13px] text-sse-muted">
            Aún no hay fechas de entrega configuradas.
          </p>
          <p className="mt-1 text-[12px] text-sse-muted">
            Ve a <strong>Evidencias → ✏️</strong> y configura la frecuencia y día límite para cada indicador.
          </p>
        </div>
      )}

      {/* Calendar card */}
      <div className="rounded-xl border border-sse-border bg-sse-surface overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between border-b border-sse-border px-5 py-3">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-sse-muted hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
            aria-label="Mes anterior"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>

          <h2 className="text-[15px] font-semibold text-sse-ink tabular-nums">
            {MONTH_NAMES_ES[month]} {year}
          </h2>

          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-sse-muted hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
            aria-label="Mes siguiente"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-sse-border">
          {DOW_LABELS.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-sse-muted">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 p-3">
          {cells.map((day, idx) => (
            <DayCell
              key={idx}
              day={day}
              events={day ? (eventsByDay[day] ?? []) : []}
              selected={day !== null && day === selectedDay}
              today={day !== null && isToday(year, month, day)}
              onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="border-t border-sse-border px-5 py-3">
          <Legend />
        </div>
      </div>

      {/* Event list */}
      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-sse-muted">
          {selectedDay
            ? `Entregas el ${fmtFullDate(year, month, selectedDay)}`
            : `Entregas en ${MONTH_NAMES_ES[month]} ${year}`}
        </h2>

        {listEvents.length === 0 ? (
          <div className="rounded-xl border border-sse-border bg-sse-surface px-5 py-8 text-center">
            <p className="text-[13px] text-sse-muted">
              {selectedDay
                ? "No hay entregas programadas para este día."
                : "No hay entregas programadas para este mes."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {listEvents.map((ev, i) => {
              const cfg = CATEGORY_CONFIG[ev.category];
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-sse-border bg-sse-surface px-4 py-3"
                >
                  <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[13px] font-medium text-sse-ink">{ev.label}</p>
                    <p className="text-[11px] text-sse-muted">
                      {!selectedDay && `${MONTH_NAMES_ES[month]} ${ev.day}, ${year}`}
                      {!selectedDay && ev.sub && " · "}
                      {ev.sub}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming deadline callout */}
      {upcomingEvent && (
        <div className="flex items-start gap-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] dark:border-[#1E40AF]/40 dark:bg-[#1E3A8A]/20 px-4 py-3">
          <span className="mt-0.5 text-lg leading-none">📅</span>
          <div>
            <p className="text-[13px] font-semibold text-[#1D4ED8] dark:text-[#93C5FD]">
              Próxima entrega
            </p>
            <p className="mt-0.5 text-[12px] text-[#1D4ED8]/80 dark:text-[#93C5FD]/80">
              {upcomingEvent.label}
              {" — "}
              {fmtFullDate(upcomingEvent.year, upcomingEvent.month, upcomingEvent.day)}
              {upcomingEvent.sub && ` · ${upcomingEvent.sub}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
