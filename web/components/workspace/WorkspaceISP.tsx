"use client";

import { useISPDashboard } from "@/hooks/useISP";

const RESULT_COLOR: Record<string, string> = {
  exitoso:  "text-green-600",
  fallido:  "text-red-600",
  denegado: "text-amber-600",
};

const ACTION_LABELS: Record<string, string> = {
  login:              "Inicio de sesión",
  logout:             "Cierre de sesión",
  login_failed:       "Intento fallido",
  access_denied:      "Acceso denegado",
  permission_changed: "Permisos modificados",
  role_changed:       "Rol cambiado",
  user_created:       "Usuario creado",
  user_updated:       "Usuario actualizado",
  user_locked:        "Usuario bloqueado",
  user_unlocked:      "Usuario desbloqueado",
  session_expired:    "Sesión expirada",
  session_closed:     "Sesión cerrada",
  role_created:       "Rol creado",
  role_updated:       "Rol actualizado",
  role_deleted:       "Rol eliminado",
  permission_created: "Permiso creado",
  config_changed:     "Configuración modificada",
};

function KPICard({
  label, value, accent, sub,
}: {
  label: string; value: string | number; accent?: string; sub?: string;
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
  const W = 280, H = 52, PAD = 4;
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (d.count / max) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1].split(",");
  const area = `${pts.join(" ")} ${last[0]},${H - PAD} ${PAD},${H - PAD}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" aria-hidden>
      <defs>
        <linearGradient id="isp-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts.join(" ")} fill="none" stroke="#1E3A8A" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={area} fill="url(#isp-grad)" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="#1E3A8A" />
    </svg>
  );
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

export function WorkspaceISP({ wsId }: { wsId: string }) {
  void wsId;
  const { data, isLoading } = useISPDashboard();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-sse-border" />)}
        </div>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Usuarios Totales"   value={data.totalUsers}          />
        <KPICard label="Activos"            value={data.activeUsers}         accent="text-green-600" />
        <KPICard label="Bloqueados"         value={data.lockedUsers}         accent={data.lockedUsers > 0 ? "text-red-600" : undefined} />
        <KPICard label="Inactivos"          value={data.inactiveUsers}       accent="text-gray-500" />
        <KPICard label="Sesiones Activas"   value={data.activeSessions}      accent="text-blue-700" />
        <KPICard label="Sesiones Expiradas" value={data.expiredSessions}     accent="text-gray-400" />
        <KPICard label="Intentos Fallidos"  value={data.failedAttemptsToday} accent={data.failedAttemptsToday > 0 ? "text-amber-600" : undefined} sub="hoy" />
        <KPICard label="Roles / Permisos"   value={`${data.totalRoles} / ${data.totalPermissions}`} />
      </div>

      {/* Sparkline */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4">
        <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-2">Eventos de auditoría — últimos 14 días</p>
        <Sparkline data={data.activityByDay ?? []} />
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border border-sse-border bg-sse-surface">
        <div className="px-4 py-3 border-b border-sse-border">
          <p className="text-[12px] font-semibold text-sse-ink">Actividad Reciente</p>
        </div>
        {(data.recentActivity ?? []).length === 0 ? (
          <p className="text-center text-[12px] text-sse-muted py-6">Sin actividad registrada</p>
        ) : (
          <ul className="divide-y divide-sse-border">
            {(data.recentActivity ?? []).map((log) => (
              <li key={log.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium ${RESULT_COLOR[log.result] ?? "text-sse-muted"}`}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                    <span className="text-[10px] text-sse-muted bg-sse-border rounded px-1.5 py-0.5">{log.module}</span>
                  </div>
                  <p className="text-[11px] text-sse-muted truncate">{log.userEmail || log.userId}</p>
                </div>
                <span className="text-[10px] text-sse-muted shrink-0">{fmtDate(log.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
