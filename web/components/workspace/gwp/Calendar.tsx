"use client";

import { useState } from "react";
import {
  useGWPEvents as useGWPListEvents, useGWPCreateEvent, useGWPUpdateEvent,
  useGWPDeleteEvent, useGWPCheckAvailability,
} from "@/hooks/useGWP";
import type { GWPCalendarEvent } from "@/types/gwp";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

function EventCard({ event, userId, onRefresh }: { event: GWPCalendarEvent; userId: string; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.summary ?? "");
  const deleteEvent = useGWPDeleteEvent();
  const updateEvent = useGWPUpdateEvent();

  const start = event.start?.dateTime;
  const end   = event.end?.dateTime;

  async function handleUpdate() {
    await updateEvent.mutateAsync({ userId, eventId: event.id!, title });
    setEditing(false);
    onRefresh();
  }

  return (
    <div className="rounded border border-sse-border bg-sse-surface p-3 space-y-2">
      <div className="flex items-start gap-2">
        <div className="shrink-0 w-10 text-center pt-0.5">
          <p className="text-[9px] text-sse-muted uppercase">
            {start ? new Date(start).toLocaleString("es-SV", { month: "short" }) : ""}
          </p>
          <p className="text-[18px] font-bold text-[#0F9D58] leading-none">
            {start ? new Date(start).getDate() : "—"}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink mb-1" />
          ) : (
            <p className="text-[12px] font-medium text-sse-ink truncate">{event.summary || "(Sin título)"}</p>
          )}
          <p className="text-[10px] text-sse-muted">{fmtDate(start)} → {fmtDate(end)}</p>
          {event.attendees && event.attendees.length > 0 && (
            <p className="text-[10px] text-sse-muted">{event.attendees.length} invitado{event.attendees.length !== 1 ? "s" : ""}</p>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0">
          {editing ? (
            <>
              <button onClick={handleUpdate} disabled={updateEvent.isPending}
                className="text-[10px] px-2 py-1 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50">
                Guardar
              </button>
              <button onClick={() => setEditing(false)}
                className="text-[10px] px-2 py-1 rounded border border-sse-border text-sse-muted hover:text-sse-ink">
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="text-[10px] px-2 py-1 rounded border border-sse-border text-sse-muted hover:text-sse-ink">
                Editar
              </button>
              <button
                onClick={() => { if (confirm("¿Eliminar evento?")) deleteEvent.mutateAsync({ userId, eventId: event.id! }).then(onRefresh); }}
                disabled={deleteEvent.isPending}
                className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
      {event.htmlLink && (
        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-[#0F9D58] hover:underline font-mono break-all">
          {event.htmlLink}
        </a>
      )}
    </div>
  );
}

export function GWPCalendar({ wsId }: { wsId: string }) {
  void wsId;
  const [userId, setUserId]   = useState("");
  const [tab, setTab]         = useState<"events" | "create" | "availability">("events");

  const [summary, setSummary]       = useState("");
  const [startDt, setStartDt]       = useState("");
  const [endDt, setEndDt]           = useState("");
  const [attendees, setAttendees]   = useState("");
  const [description, setDescription] = useState("");

  const [fbStart, setFbStart] = useState("");
  const [fbEnd, setFbEnd]     = useState("");
  const [fbEmails, setFbEmails] = useState("");

  const { data: events = [], isLoading, refetch } = useGWPListEvents({ userId });
  const createEvent      = useGWPCreateEvent();
  const checkAvailability = useGWPCheckAvailability();

  function parseEmails(s: string): string[] {
    return s.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
  }

  async function handleCreate() {
    await createEvent.mutateAsync({
      userId,
      title:       summary,
      start:       new Date(startDt).toISOString(),
      end:         new Date(endDt).toISOString(),
      attendees:   attendees ? parseEmails(attendees) : undefined,
      description: description || undefined,
    });
    setSummary(""); setStartDt(""); setEndDt(""); setAttendees(""); setDescription("");
    void refetch();
  }

  async function handleCheckAvailability() {
    await checkAvailability.mutateAsync({
      userId,
      emails: parseEmails(fbEmails),
      startTime: new Date(fbStart).toISOString(),
      endTime:   new Date(fbEnd).toISOString(),
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sse-border bg-sse-surface px-4 py-3">
        <label className="block text-[11px] text-sse-muted mb-1">ID de usuario Google</label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="sub de Google OAuth"
          className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-green-400" />
      </div>

      <div className="flex rounded border border-sse-border overflow-hidden text-[11px]">
        {(["events", "create", "availability"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-3 py-1.5 ${tab === t ? "bg-[#0F9D58] text-white" : "bg-sse-surface text-sse-muted hover:text-sse-ink"}`}>
            {t === "events" ? "Eventos" : t === "create" ? "Crear evento" : "Disponibilidad"}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <>
          {isLoading && (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-sse-border" />)}
            </div>
          )}
          {!isLoading && events.length === 0 && (
            <p className="text-center text-[13px] text-sse-muted py-8">Sin eventos próximos</p>
          )}
          {!isLoading && events.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-sse-muted">{events.length} eventos</p>
              {events.map((ev, i) => (
                <EventCard key={ev.id ?? i} event={ev} userId={userId} onRefresh={() => void refetch()} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "create" && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Título *</label>
            <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Reunión de equipo"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Inicio *</label>
              <input type="datetime-local" value={startDt} onChange={(e) => setStartDt(e.target.value)}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
            </div>
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Fin *</label>
              <input type="datetime-local" value={endDt} onChange={(e) => setEndDt(e.target.value)}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Invitados (emails separados por coma)</label>
            <input value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="a@upes.edu.sv, b@gmail.com"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Descripción</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <button onClick={handleCreate} disabled={!userId || !summary || !startDt || !endDt || createEvent.isPending}
            className="text-[12px] px-5 py-1.5 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50">
            {createEvent.isPending ? "Creando…" : "Crear evento"}
          </button>
        </div>
      )}

      {tab === "availability" && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <p className="text-[12px] font-semibold text-sse-ink">Consultar disponibilidad (FreeBusy)</p>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Calendarios a consultar</label>
            <input value={fbEmails} onChange={(e) => setFbEmails(e.target.value)} placeholder="a@upes.edu.sv, b@gmail.com"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Desde</label>
              <input type="datetime-local" value={fbStart} onChange={(e) => setFbStart(e.target.value)}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
            </div>
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Hasta</label>
              <input type="datetime-local" value={fbEnd} onChange={(e) => setFbEnd(e.target.value)}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
            </div>
          </div>
          <button onClick={handleCheckAvailability} disabled={!userId || !fbEmails || !fbStart || !fbEnd || checkAvailability.isPending}
            className="text-[12px] px-5 py-1.5 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50">
            {checkAvailability.isPending ? "Consultando…" : "Verificar disponibilidad"}
          </button>
          {checkAvailability.data && (
            <div className="rounded bg-sse-border/20 p-3 space-y-2">
              {Object.entries(checkAvailability.data).map(([email, slots]) => (
                <div key={email}>
                  <p className="text-[11px] font-semibold text-sse-ink">{email}</p>
                  {Array.isArray(slots) && slots.length === 0 ? (
                    <p className="text-[10px] text-green-700">✓ Disponible</p>
                  ) : (
                    <div className="space-y-0.5 mt-0.5">
                      {Array.isArray(slots) && slots.map((slot: { start?: string; end?: string }, i: number) => (
                        <p key={i} className="text-[10px] text-red-600">
                          Ocupado: {fmtDate(slot.start)} → {fmtDate(slot.end)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
