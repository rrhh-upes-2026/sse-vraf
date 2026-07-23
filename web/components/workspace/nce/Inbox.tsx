"use client";

import { useState } from "react";
import {
  useNCENotifications,
  useMarkNCENotificationRead,
  useArchiveNCENotification,
} from "@/hooks/useNCE";
import type { NCENotificationStatus, NCENotificationPriority, NCEChannel } from "@/types/nce";

const STATUS_TABS: { key: NCENotificationStatus | "todas"; label: string }[] = [
  { key: "todas",     label: "Todas"     },
  { key: "pendiente", label: "Pendiente" },
  { key: "entregada", label: "Entregada" },
  { key: "leida",     label: "Leída"     },
  { key: "archivada", label: "Archivada" },
  { key: "fallida",   label: "Fallida"   },
];

const PRIORITY_COLOR: Record<string, string> = {
  baja:    "bg-gray-100 text-gray-600",
  normal:  "bg-sky-100 text-sky-700",
  alta:    "bg-amber-100 text-amber-700",
  urgente: "bg-red-100 text-red-700",
};

const CHANNEL_BADGE: Record<string, string> = {
  interna:     "bg-slate-100 text-slate-600",
  correo:      "bg-violet-100 text-violet-700",
  google_chat: "bg-emerald-100 text-emerald-700",
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function NCEInbox({ wsId }: { wsId: string }) {
  void wsId;
  const [activeTab, setActiveTab] = useState<NCENotificationStatus | "todas">("todas");
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<NCEChannel | "">("");
  const [priorityFilter, setPriorityFilter] = useState<NCENotificationPriority | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const params = activeTab !== "todas"
    ? { status: activeTab, channel: channelFilter || undefined, priority: priorityFilter || undefined }
    : { channel: channelFilter || undefined, priority: priorityFilter || undefined };

  const { data = [], isLoading } = useNCENotifications(params);
  const markRead = useMarkNCENotificationRead();
  const archive  = useArchiveNCENotification();

  const filtered = data.filter((n) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.recipientEmail.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar notificaciones…"
          className="flex-1 min-w-[160px] text-[12px] rounded-md border border-sse-border px-3 py-1.5 bg-sse-surface text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value as NCEChannel | "")}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
        >
          <option value="">Todos los canales</option>
          <option value="interna">Interna</option>
          <option value="correo">Correo</option>
          <option value="google_chat">Google Chat</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as NCENotificationPriority | "")}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
        >
          <option value="">Todas las prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="normal">Normal</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap border-b border-sse-border pb-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-[11px] px-3 py-1 rounded-full transition-colors ${
              activeTab === tab.key
                ? "bg-[#0369A1] text-white"
                : "bg-sse-border text-sse-muted hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-sse-border" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-center text-[13px] text-sse-muted py-8">No hay notificaciones</p>
      )}

      {/* Notification list */}
      <ul className="space-y-2">
        {filtered.map((n) => {
          const isExpanded = expandedId === n.id;
          return (
            <li key={n.id} className="rounded-lg border border-sse-border bg-sse-surface overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : n.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-sse-border/30 transition-colors"
              >
                {/* Unread dot */}
                <div className="mt-1 w-2 h-2 shrink-0 rounded-full" style={{
                  background: n.status === "pendiente" || n.status === "entregada" ? "#0369A1" : "transparent",
                  border: "1.5px solid #0369A1",
                }} />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[13px] font-medium text-sse-ink truncate">{n.title}</p>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${PRIORITY_COLOR[n.priority] ?? ""}`}>
                      {n.priority}
                    </span>
                    <span className={`text-[10px] rounded-full px-2 py-0.5 ${CHANNEL_BADGE[n.channel] ?? ""}`}>
                      {n.channel}
                    </span>
                    <span className="text-[10px] text-sse-muted">{n.recipientEmail}</span>
                    <span className="text-[10px] text-sse-muted">{fmtDate(n.createdAt)}</span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] text-sse-muted">{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-sse-border">
                  <p className="text-[12px] text-sse-ink whitespace-pre-wrap pt-3">{n.body}</p>
                  {n.sourceEventId && (
                    <p className="text-[11px] text-sse-muted">
                      Evento AUE: <code className="font-mono">{n.sourceEventId}</code>
                      {n.sourceEngine && ` · Motor: ${n.sourceEngine}`}
                    </p>
                  )}
                  {n.templateType && (
                    <p className="text-[11px] text-sse-muted">
                      Template: <code className="font-mono">{n.templateType}</code>
                    </p>
                  )}
                  <div className="flex gap-2">
                    {(n.status === "entregada" || n.status === "pendiente") && (
                      <button
                        onClick={() => markRead.mutate({ notificationId: n.id, recipientId: n.recipientId })}
                        disabled={markRead.isPending}
                        className="text-[11px] px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                      >
                        Marcar leída
                      </button>
                    )}
                    {n.status !== "archivada" && (
                      <button
                        onClick={() => archive.mutate(n.id)}
                        disabled={archive.isPending}
                        className="text-[11px] px-3 py-1 rounded border border-sse-border text-sse-muted hover:text-sse-ink disabled:opacity-50"
                      >
                        Archivar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
