"use client";

import { useSession } from "@/lib/auth-client";
import type { ProcesoInstitucional, Actividad, Indicador } from "@/types/entities";
import { useProcesos } from "@/hooks/useProcesos";
import { useActividades } from "@/hooks/useActividades";
import { useIndicadores } from "@/hooks/useIndicadores";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AlertSeverity = "critical" | "warning" | "info";

interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
}

const SEVERITY_STYLES: Record<AlertSeverity, { bar: string; bg: string; text: string; icon: string }> = {
  critical: {
    bar:  "bg-sse-sem-red-fg",
    bg:   "bg-sse-sem-red-bg",
    text: "text-sse-sem-red-fg",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  warning: {
    bar:  "bg-sse-sem-amber-fg",
    bg:   "bg-sse-sem-amber-bg",
    text: "text-sse-sem-amber-fg",
    icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  info: {
    bar:  "bg-sse-primary",
    bg:   "bg-sse-pill-blue-bg",
    text: "text-sse-pill-blue-fg",
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

function daysDiff(fechaLimite: string): number {
  return Math.ceil((new Date(fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function deriveAlerts(
  procesos: ProcesoInstitucional[],
  actividades: Actividad[],
  indicadores: Indicador[],
): Alert[] {
  const alerts: Alert[] = [];

  for (const p of procesos) {
    const days = daysDiff(p.fechaLimite);
    if (days < 0) {
      alerts.push({
        id: `overdue-proc-${p.id}`,
        severity: "critical",
        title: "Proceso vencido",
        detail: `${p.nombre} — venció hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? "s" : ""}`,
      });
    } else if (days <= 7) {
      alerts.push({
        id: `sla-proc-${p.id}`,
        severity: "warning",
        title: "SLA próximo a vencer",
        detail: `${p.nombre} — ${days} día${days !== 1 ? "s" : ""} restante${days !== 1 ? "s" : ""}`,
      });
    }

    if (p.semaforo === "rojo" && days >= 0) {
      alerts.push({
        id: `sem-proc-${p.id}`,
        severity: "critical",
        title: "Proceso en semáforo rojo",
        detail: `${p.nombre} requiere atención inmediata`,
      });
    }
  }

  const blockedActivities = actividades.filter((a) => a.estado === "bloqueada");
  for (const a of blockedActivities) {
    alerts.push({
      id: `blocked-act-${a.id}`,
      severity: "warning",
      title: "Actividad bloqueada",
      detail: a.nombre,
    });
  }

  for (const ind of indicadores) {
    if (ind.semaforo === "rojo") {
      alerts.push({
        id: `kpi-red-${ind.id}`,
        severity: "critical",
        title: "Indicador crítico",
        detail: `${ind.nombre} — valor actual: ${ind.valorActual} ${ind.unidadMedida} (meta: ${ind.meta})`,
      });
    }
  }

  const severityOrder: AlertSeverity[] = ["critical", "warning", "info"];
  return alerts.sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
  );
}

function AlertItem({ alert }: { alert: Alert }) {
  const styles = SEVERITY_STYLES[alert.severity];

  return (
    <div className={`flex gap-3 p-3 rounded-sm border border-sse-border ${styles.bg} mb-2 last:mb-0`}>
      <div className={`w-0.5 rounded-full shrink-0 self-stretch ${styles.bar}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className={`w-3.5 h-3.5 shrink-0 ${styles.text}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d={styles.icon} />
          </svg>
          <p className={`text-[12px] font-semibold ${styles.text}`}>{alert.title}</p>
        </div>
        <p className="text-[11px] text-sse-ink mt-0.5 truncate">{alert.detail}</p>
      </div>
    </div>
  );
}

export function Alerts() {
  const { user } = useSession();
  const usuarioId = user?.usuarioId;

  const query = usuarioId ? { responsableId: usuarioId } : undefined;
  const { data: procesos, isLoading: loadingP } = useProcesos(query);
  const { data: actividades, isLoading: loadingA } = useActividades(query);
  const { data: indicadores, isLoading: loadingI } = useIndicadores(query);

  const isLoading = loadingP || loadingA || loadingI;

  const alerts = !isLoading
    ? deriveAlerts(procesos ?? [], actividades ?? [], indicadores ?? [])
    : [];

  if (!isLoading && alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alertas</CardTitle>
          {alerts.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-sse-sem-red-bg text-sse-sem-red-fg border border-sse-sem-red-border rounded-sm">
              {alerts.filter((a) => a.severity === "critical").length} crítica
              {alerts.filter((a) => a.severity === "critical").length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading && (
          <div className="space-y-2">
            {[0, 1].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        )}

        {!isLoading && alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </CardContent>
    </Card>
  );
}
