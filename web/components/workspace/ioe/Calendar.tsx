"use client";

import { useState } from "react";
import { useIOECalendarEvents } from "@/hooks/useIOE";
import type { IOECalendarView, IOECalendarEventType } from "@/types/ioe";

const TEAL = "#0F766E";

const EVENT_COLORS: Record<IOECalendarEventType, string> = {
  plan:  "#0F766E",
  hito:  "#7C3AED",
  tarea: "#D97706",
};
const EVENT_BG: Record<IOECalendarEventType, string> = {
  plan:  "#F0FDFA",
  hito:  "#F5F3FF",
  tarea: "#FFFBEB",
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEKDAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function monthRange(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  return { from, to };
}

function weekRange(baseDate: Date) {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to:   sunday.toISOString().slice(0, 10),
    monday,
    sunday,
  };
}

interface Props { wsId: string }

export function IOECalendar({ wsId: _wsId }: Props) {
  const now = new Date();
  const [view,   setView]   = useState<IOECalendarView>("mes");
  const [year,   setYear]   = useState(now.getFullYear());
  const [month,  setMonth]  = useState(now.getMonth() + 1);
  const [weekBase, setWeekBase] = useState(() => new Date(now));
  const [types,  setTypes]  = useState<Set<IOECalendarEventType>>(new Set(["plan", "hito", "tarea"]));

  const { from, to } = view === "mes" ? monthRange(year, month) : weekRange(weekBase);
  const wr = weekRange(weekBase);

  const { data: events = [], isLoading } = useIOECalendarEvents({
    from, to,
    view,
    types: Array.from(types),
  });

  function toggleType(t: IOECalendarEventType) {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  function prevPeriod() {
    if (view === "mes") {
      if (month === 1) { setYear((y) => y - 1); setMonth(12); } else setMonth((m) => m - 1);
    } else {
      const d = new Date(weekBase);
      d.setDate(d.getDate() - 7);
      setWeekBase(d);
    }
  }
  function nextPeriod() {
    if (view === "mes") {
      if (month === 12) { setYear((y) => y + 1); setMonth(1); } else setMonth((m) => m + 1);
    } else {
      const d = new Date(weekBase);
      d.setDate(d.getDate() + 7);
      setWeekBase(d);
    }
  }

  // Group events by date
  const eventsByDate: Record<string, typeof events> = {};
  events.forEach((e) => {
    const key = e.start.slice(0, 10);
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(e);
  });

  // Build month grid
  function buildMonthGrid() {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  const todayStr = now.toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        {/* View toggle */}
        <div className="flex rounded border border-sse-border overflow-hidden">
          {(["mes", "semana"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-[11px] font-medium capitalize transition-colors ${view === v ? "text-white" : "text-sse-muted hover:text-sse-ink"}`}
              style={view === v ? { backgroundColor: TEAL } : {}}>
              {v}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <button onClick={prevPeriod} className="rounded border border-sse-border px-2 py-1.5 text-sse-muted hover:text-sse-ink transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-[12px] font-medium text-sse-ink min-w-[120px] text-center">
          {view === "mes" ? `${MONTHS[month - 1]} ${year}` : `${wr.monday.toLocaleDateString("es-SV", { day: "2-digit", month: "short" })} — ${wr.sunday.toLocaleDateString("es-SV", { day: "2-digit", month: "short" })}`}
        </span>
        <button onClick={nextPeriod} className="rounded border border-sse-border px-2 py-1.5 text-sse-muted hover:text-sse-ink transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* Type filters */}
        <div className="flex gap-1.5 ml-2">
          {(["plan", "hito", "tarea"] as const).map((t) => (
            <button key={t} onClick={() => toggleType(t)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors capitalize border ${types.has(t) ? "text-white border-transparent" : "border-sse-border text-sse-muted"}`}
              style={types.has(t) ? { backgroundColor: EVENT_COLORS[t] } : {}}>
              {t}
            </button>
          ))}
        </div>

        <span className="ml-auto text-[11px] text-sse-muted">{events.length} evento{events.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando calendario…</p>}

      {/* Month grid */}
      {!isLoading && view === "mes" && (
        <div className="rounded-lg border border-sse-border bg-white overflow-hidden">
          <div className="grid grid-cols-7 border-b border-sse-border">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-sse-muted">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {buildMonthGrid().map((day, i) => {
              if (!day) return <div key={i} className="min-h-[80px] border-b border-r border-sse-border last:border-r-0 bg-sse-surface" />;
              const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = eventsByDate[dateKey] ?? [];
              const isToday = dateKey === todayStr;
              return (
                <div key={i} className={`min-h-[80px] border-b border-r border-sse-border last:border-r-0 p-1.5 ${isToday ? "bg-[#F0FDFA]" : ""}`}>
                  <p className={`text-[11px] font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${isToday ? "text-white" : "text-sse-muted"}`}
                    style={isToday ? { backgroundColor: TEAL } : {}}>{day}</p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} className="rounded px-1 py-0.5 truncate text-[9px] font-medium"
                        style={{ backgroundColor: EVENT_BG[e.type as IOECalendarEventType], color: EVENT_COLORS[e.type as IOECalendarEventType] }}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[9px] text-sse-muted pl-1">+{dayEvents.length - 3} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week view */}
      {!isLoading && view === "semana" && (
        <div className="rounded-lg border border-sse-border bg-white overflow-hidden">
          <div className="grid grid-cols-7 border-b border-sse-border">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(wr.monday);
              d.setDate(wr.monday.getDate() + i);
              const key = d.toISOString().slice(0, 10);
              const isToday = key === todayStr;
              return (
                <div key={i} className={`px-2 py-3 text-center ${isToday ? "bg-[#F0FDFA]" : ""}`}>
                  <p className="text-[10px] text-sse-muted uppercase">{WEEKDAYS[(i + 1) % 7]}</p>
                  <p className={`text-[14px] font-bold mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full ${isToday ? "text-white" : "text-sse-ink"}`}
                    style={isToday ? { backgroundColor: TEAL } : {}}>{d.getDate()}</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 min-h-[200px]">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(wr.monday);
              d.setDate(wr.monday.getDate() + i);
              const key = d.toISOString().slice(0, 10);
              const dayEvents = eventsByDate[key] ?? [];
              return (
                <div key={i} className="p-2 border-r border-sse-border last:border-r-0 space-y-1">
                  {dayEvents.map((e) => (
                    <div key={e.id} className="rounded px-2 py-1.5"
                      style={{ backgroundColor: EVENT_BG[e.type as IOECalendarEventType] }}>
                      <p className="text-[10px] font-medium truncate" style={{ color: EVENT_COLORS[e.type as IOECalendarEventType] }}>{e.title}</p>
                      {e.owner && <p className="text-[9px] text-sse-muted truncate">{e.owner}</p>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
