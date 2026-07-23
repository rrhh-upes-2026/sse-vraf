"use client";

import { useNCEDashboard, useConsumeNCEAUEEvents } from "@/hooks/useNCE";

const CHANNEL_LABELS: Record<string, string> = {
  interna:     "Interna",
  correo:      "Correo",
  google_chat: "Google Chat",
};

const TYPE_LABELS: Record<string, string> = {
  alerta_plan:          "Alerta de Plan",
  tarea_vencida:        "Tarea Vencida",
  nueva_recomendacion:  "Nueva Recomendación",
  diagnostico_nuevo:    "Diagnóstico Nuevo",
  hito_completado:      "Hito Completado",
  regla_activada:       "Regla Activada",
  evidencia_nueva:      "Evidencia Nueva",
  resumen_diario:       "Resumen Diario",
};

const STATUS_COLOR: Record<string, string> = {
  pendiente:  "text-amber-600 bg-amber-50",
  entregada:  "text-blue-600 bg-blue-50",
  leida:      "text-green-600 bg-green-50",
  archivada:  "text-gray-500 bg-gray-100",
  fallida:    "text-red-600 bg-red-50",
};

const PRIORITY_COLOR: Record<string, string> = {
  baja:    "text-gray-500",
  normal:  "text-sky-600",
  alta:    "text-amber-600",
  urgente: "text-red-600 font-semibold",
};

function KPIChip({
  label, value, sub, accent,
}: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className="rounded-lg border border-sse-border bg-sse-surface p-4 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-sse-muted">{label}</span>
      <span className={`text-[26px] font-bold leading-none ${accent ?? "text-sse-ink"}`}>{value}</span>
      {sub && <span className="text-[11px] text-sse-muted">{sub}</span>}
    </div>
  );
}

function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 240, H = 48, PAD = 4;
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((d.count / max) * (H - PAD * 2));
    return `${x},${y}`;
  });
  const areaClose = `${pts[pts.length - 1].split(",")[0]},${H - PAD} ${PAD + 0},${H - PAD}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" aria-hidden>
      <defs>
        <linearGradient id="nce-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0369A1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts.join(" ")} fill="none" stroke="#0369A1" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={`${pts.join(" ")} ${areaClose}`} fill="url(#nce-grad)" />
      <circle
        cx={pts[pts.length - 1].split(",")[0]}
        cy={pts[pts.length - 1].split(",")[1]}
        r="3"
        fill="#0369A1"
      />
    </svg>
  );
}

export function WorkspaceNCE({ wsId }: { wsId: string }) {
  void wsId;
  const { data, isLoading } = useNCEDashboard();
  const consume = useConsumeNCEAUEEvents();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-sse-border" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const byChannel = data.notificationsByChannel ?? [];
  const byType    = data.notificationsByType ?? [];
  const recent    = data.recentNotifications ?? [];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPIChip label="Total Notificaciones" value={data.totalNotifications} />
        <KPIChip label="Pendientes"       value={data.pendingNotifications} accent="text-amber-600" />
        <KPIChip label="Entregadas hoy"   value={data.deliveredToday}       accent="text-blue-600" />
        <KPIChip label="Fallidas"         value={data.failedNotifications}  accent={data.failedNotifications > 0 ? "text-red-600" : undefined} />
        <KPIChip label="Tasa de Lectura"  value={`${data.readRate}%`}       accent="text-green-600" />
        <KPIChip label="Templates Activos" value={data.activeTemplates} />
        <KPIChip label="Digests Pendientes" value={data.digestsPending} />
        <KPIChip label="T. Entrega Prom." value={`${data.avgDeliveryTime}s`} sub="segundos promedio" />
      </div>

      {/* Sparkline */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4">
        <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-2">Notificaciones últimos 14 días</p>
        <Sparkline data={data.notificationsByDay ?? []} />
      </div>

      {/* By channel + By type */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <p className="text-[12px] font-semibold text-sse-ink">Por Canal</p>
          {byChannel.length === 0 && <p className="text-[12px] text-sse-muted">Sin datos</p>}
          {byChannel.map((ch) => {
            const maxVal = Math.max(...byChannel.map((c) => c.count), 1);
            const pct = Math.round((ch.count / maxVal) * 100);
            return (
              <div key={ch.channel} className="space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-sse-ink">{CHANNEL_LABELS[ch.channel] ?? ch.channel}</span>
                  <span className="text-sse-muted">{ch.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-sse-border overflow-hidden">
                  <div className="h-full bg-[#0369A1] rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-2">
          <p className="text-[12px] font-semibold text-sse-ink">Por Tipo (top 8)</p>
          {byType.length === 0 && <p className="text-[12px] text-sse-muted">Sin datos</p>}
          {byType.slice(0, 8).map((t) => (
            <div key={t.type} className="flex items-center justify-between text-[12px]">
              <span className="text-sse-muted truncate">{TYPE_LABELS[t.type] ?? t.type}</span>
              <span className="ml-2 shrink-0 rounded-full bg-sky-100 text-sky-700 px-2 py-0.5 text-[10px] font-semibold">
                {t.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent notifications */}
      <div className="rounded-lg border border-sse-border bg-sse-surface">
        <div className="flex items-center justify-between px-4 py-3 border-b border-sse-border">
          <p className="text-[12px] font-semibold text-sse-ink">Notificaciones Recientes</p>
          <button
            onClick={() => consume.mutate(undefined)}
            disabled={consume.isPending}
            className="text-[11px] text-sky-600 hover:text-sky-700 disabled:opacity-50"
          >
            {consume.isPending ? "Consumiendo AUE…" : "Consumir eventos AUE"}
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="px-4 py-6 text-center text-[12px] text-sse-muted">No hay notificaciones recientes</p>
        ) : (
          <ul className="divide-y divide-sse-border">
            {recent.map((n) => (
              <li key={n.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-sse-ink truncate">{n.title}</p>
                  <p className="text-[11px] text-sse-muted truncate">{n.recipientEmail}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${STATUS_COLOR[n.status] ?? "text-sse-muted bg-gray-100"}`}>
                    {n.status}
                  </span>
                  <span className={`text-[10px] ${PRIORITY_COLOR[n.priority] ?? "text-sse-muted"}`}>
                    {n.priority}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
