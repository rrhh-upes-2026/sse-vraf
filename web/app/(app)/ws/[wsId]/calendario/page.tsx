"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { getUnidad } from "@/types/unidad";

// ── Types ──────────────────────────────────────────────────────────────────────

type EventCategory = "indicadores" | "evidencias" | "reportes";

interface CalEvent {
  day: number;
  category: EventCategory;
  label: string;
}

// ── Mock data: strategic deadlines for the platform ───────────────────────────

const MOCK_EVENTS: CalEvent[] = [
  // Indicadores (blue) — update deadlines each month
  { day: 5,  category: "indicadores", label: "Cierre indicadores semana 1" },
  { day: 12, category: "indicadores", label: "Cierre indicadores semana 2" },
  { day: 19, category: "indicadores", label: "Cierre indicadores semana 3" },
  { day: 26, category: "indicadores", label: "Cierre indicadores semana 4" },
  // Evidencias (green) — submission windows
  { day: 8,  category: "evidencias",  label: "Envío evidencias período anterior" },
  { day: 22, category: "evidencias",  label: "Envío evidencias período actual" },
  { day: 29, category: "evidencias",  label: "Cierre evidencias agosto 2026" },
  // Reportes (orange) — generation dates
  { day: 15, category: "reportes",    label: "Reporte quincenal VRAF" },
  { day: 31, category: "reportes",    label: "Reporte mensual agosto 2026 — DEADLINE" },
];

const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; dot: string; badge: string; text: string }
> = {
  indicadores: {
    label: "Indicadores",
    dot:   "bg-[#2563EB]",
    badge: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    text:  "text-[#1D4ED8]",
  },
  evidencias: {
    label: "Evidencias",
    dot:   "bg-[#059669]",
    badge: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
    text:  "text-[#065F46]",
  },
  reportes: {
    label: "Reportes",
    dot:   "bg-[#D97706]",
    badge: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
    text:  "text-[#92400E]",
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

/** 0=Mon … 6=Sun (ISO week) */
function getFirstDayISO(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay(); // 0=Sun
  return (d + 6) % 7;
}

function isToday(year: number, month: number, day: number): boolean {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
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
      {/* Day number */}
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

      {/* Event dots */}
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

      {/* First event label (tiny) */}
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

  // Default to August 2026 (where the next reporting deadline lives)
  const [year, setYear]   = useState(2026);
  const [month, setMonth] = useState(7); // 0-indexed: 7 = August
  const [selectedDay, setSelectedDay] = useState<number | null>(31);

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

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayISO  = getFirstDayISO(year, month);

  // Build grid cells: nulls for leading blanks, then 1-N
  const cells = useMemo<(number | null)[]>(() => {
    const arr: (number | null)[] = Array(firstDayISO).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    // Pad to full weeks
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [firstDayISO, daysInMonth]);

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalEvent[]> = {};
    for (const ev of MOCK_EVENTS) {
      if (!map[ev.day]) map[ev.day] = [];
      map[ev.day].push(ev);
    }
    return map;
  }, []);

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];
  // Month-level: all events (for the list below when nothing is selected)
  const allMonthEvents = MOCK_EVENTS.slice().sort((a, b) => a.day - b.day);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-[20px] font-semibold text-sse-ink leading-tight">
          Calendario Estratégico
          {unidad ? ` — ${unidad.nombre}` : ""}
        </h1>
        <p className="mt-1 text-[13px] text-sse-muted">
          Fechas clave de actualización de indicadores, envío de evidencias y
          generación de reportes.
        </p>
      </div>

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
            ? `Eventos del día ${selectedDay} de ${MONTH_NAMES_ES[month]}`
            : `Todos los eventos — ${MONTH_NAMES_ES[month]} ${year}`}
        </h2>

        {(selectedDay ? selectedEvents : allMonthEvents).length === 0 ? (
          <div className="rounded-xl border border-sse-border bg-sse-surface px-5 py-8 text-center">
            <p className="text-[13px] text-sse-muted">No hay eventos para este día.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(selectedDay ? selectedEvents : allMonthEvents).map((ev, i) => {
              const cfg = CATEGORY_CONFIG[ev.category];
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-sse-border bg-sse-surface px-4 py-3"
                >
                  <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[13px] font-medium text-sse-ink">{ev.label}</p>
                    {!selectedDay && (
                      <p className="text-[11px] text-sse-muted">
                        {MONTH_NAMES_ES[month]} {ev.day}, {year}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming deadline callout */}
      <div className="flex items-start gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
        <span className="mt-0.5 text-lg leading-none">📅</span>
        <div>
          <p className="text-[13px] font-semibold text-[#92400E]">
            Próximo deadline crítico
          </p>
          <p className="mt-0.5 text-[12px] text-[#92400E]/80">
            Reporte mensual agosto 2026 — 31 de agosto de 2026. Todos los
            indicadores y evidencias deben estar validados antes de esta fecha.
          </p>
        </div>
      </div>
    </div>
  );
}
