"use client";

import { useGWPDashboard } from "@/hooks/useGWP";
import type { GWPConnectionStatus, GWPChatStatus } from "@/types/gwp";

const STATUS_COLOR: Record<GWPConnectionStatus, string> = {
  connected:    "text-green-600",
  disconnected: "text-gray-500",
  error:        "text-red-600",
  pending:      "text-amber-600",
};

const STATUS_BG: Record<GWPConnectionStatus, string> = {
  connected:    "bg-green-100 text-green-700",
  disconnected: "bg-gray-100 text-gray-500",
  error:        "bg-red-100 text-red-700",
  pending:      "bg-amber-100 text-amber-700",
};

const CHAT_DOT: Record<GWPChatStatus, string> = {
  available:   "bg-green-500",
  unavailable: "bg-gray-400",
};

function fmtBytes(n: number): string {
  if (!n) return "—";
  if (n < 1_073_741_824) return (n / 1_048_576).toFixed(1) + " MB";
  return (n / 1_073_741_824).toFixed(2) + " GB";
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

function QuotaBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const color = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-sse-muted">
        <span>{fmtBytes(used)} usado</span>
        <span>{total > 0 ? fmtBytes(total) : "Sin límite"}</span>
      </div>
      <div className="h-1.5 rounded-full bg-sse-border overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ServiceCard({ label, icon, status, detail }: { label: string; icon: React.ReactNode; status: React.ReactNode; detail?: string }) {
  return (
    <div className="rounded-lg border border-sse-border bg-sse-surface p-4 flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#0F9D58]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-sse-muted">{label}</p>
        <div className="mt-0.5">{status}</div>
        {detail && <p className="text-[10px] text-sse-muted mt-0.5 truncate">{detail}</p>}
      </div>
    </div>
  );
}

export function WorkspaceGWP({ wsId }: { wsId: string }) {
  void wsId;
  const { data, isLoading } = useGWPDashboard();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-sse-border" />)}
        </div>
      </div>
    );
  }
  if (!data) return null;

  const connected = data.oauthStatus === "connected";

  return (
    <div className="space-y-6">
      {/* OAuth status banner */}
      <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${connected ? "border-green-200 bg-green-50/40" : "border-amber-200 bg-amber-50/40"}`}>
        <span className={`text-[22px] font-bold ${STATUS_COLOR[data.oauthStatus]}`}>
          {connected ? "●" : "○"}
        </span>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-sse-ink">
            {connected ? "Google Workspace conectado" : "Sin conexión OAuth"}
          </p>
          {connected ? (
            <p className="text-[11px] text-sse-muted">
              {data.authenticatedUser} · {data.domain}
            </p>
          ) : (
            <p className="text-[11px] text-sse-muted">
              Configura el Client ID en Configuración y conecta con Google OAuth.
            </p>
          )}
        </div>
        <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${STATUS_BG[data.oauthStatus]}`}>
          {data.oauthStatus}
        </span>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ServiceCard
          label="Google Identity"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
          status={<span className={`text-[12px] font-semibold ${STATUS_COLOR[data.oauthStatus]}`}>{data.oauthStatus}</span>}
          detail={data.authenticatedUser || "No autenticado"}
        />
        <ServiceCard
          label="Google Drive"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
          status={
            data.driveQuota
              ? <QuotaBar used={data.driveQuota.used} total={data.driveQuota.total} />
              : <span className="text-[11px] text-sse-muted">{connected ? "Cargando…" : "—"}</span>
          }
          detail={data.driveQuota ? fmtBytes(data.driveQuota.usageInDrive) + " en Drive" : undefined}
        />
        <ServiceCard
          label="Gmail"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          status={<span className="text-[12px] font-semibold text-sse-ink">{data.recentEmails.length} enviados</span>}
          detail="Últimos registros"
        />
        <ServiceCard
          label="Google Chat"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
          status={
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${CHAT_DOT[data.chatStatus]}`} />
              <span className="text-[12px] font-semibold text-sse-ink">{data.chatStatus}</span>
            </div>
          }
        />
      </div>

      {/* Calendar — next events */}
      <div className="rounded-lg border border-sse-border bg-sse-surface">
        <div className="px-4 py-3 border-b border-sse-border flex items-center justify-between">
          <p className="text-[12px] font-semibold text-sse-ink">Próximos eventos — Google Calendar</p>
          <span className="text-[10px] text-sse-muted">{data.recentEvents.length} eventos</span>
        </div>
        {data.recentEvents.length === 0 ? (
          <p className="text-center text-[12px] text-sse-muted py-6">Sin eventos próximos</p>
        ) : (
          <ul className="divide-y divide-sse-border">
            {data.recentEvents.map((ev, i) => (
              <li key={ev.id ?? i} className="px-4 py-2.5 flex items-center gap-3">
                <div className="shrink-0 w-8 text-center">
                  <p className="text-[10px] text-sse-muted">{ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString("es-SV", { month: "short" }).toUpperCase() : ""}</p>
                  <p className="text-[15px] font-bold text-[#0F9D58] leading-none">
                    {ev.start?.dateTime ? new Date(ev.start.dateTime).getDate() : "—"}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-sse-ink truncate">{ev.summary || "(Sin título)"}</p>
                  <p className="text-[10px] text-sse-muted">
                    {fmtDate(ev.start?.dateTime)} → {fmtDate(ev.end?.dateTime)}
                  </p>
                </div>
                {ev.attendees && ev.attendees.length > 0 && (
                  <span className="shrink-0 text-[10px] text-sse-muted bg-sse-border rounded-full px-1.5 py-0.5">
                    {ev.attendees.length} invitado{ev.attendees.length !== 1 ? "s" : ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent mail */}
      <div className="rounded-lg border border-sse-border bg-sse-surface">
        <div className="px-4 py-3 border-b border-sse-border">
          <p className="text-[12px] font-semibold text-sse-ink">Correos enviados recientemente</p>
        </div>
        {data.recentEmails.length === 0 ? (
          <p className="text-center text-[12px] text-sse-muted py-6">Sin correos registrados</p>
        ) : (
          <ul className="divide-y divide-sse-border">
            {data.recentEmails.map((m) => (
              <li key={m.id} className="px-4 py-2 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-sse-ink truncate">{m.subject || "(Sin asunto)"}</p>
                  <p className="text-[10px] text-sse-muted truncate">
                    Para: {(() => { try { return JSON.parse(m.recipients).join(", "); } catch { return m.recipients; } })()}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] rounded-full px-2 py-0.5 font-medium ${m.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {m.status}
                </span>
                <span className="shrink-0 text-[10px] text-sse-muted">{fmtDate(m.sentAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
