"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useExecutiveDashboard } from "@/hooks/useExecutiveDashboard";
import { useKPIsByDashboard }    from "@/hooks/useExecutiveDashboard";
import { Skeleton }              from "@/components/ui/skeleton";
import {
  ExecResumenEjecutivo,
  ExecIndicadoresGlobales,
  ExecAlertasInstitucionales,
  ExecSemaforos,
  ExecTendencias,
  ExecActividadReciente,
  ExecEstadoUnidades,
  ExecCumplimientoInstitucional,
  ExecResumenFinanciero,
  ExecResumenOperativo,
} from "./sections";

interface Props {
  wsId: string;
}

type Tab = {
  id: string;
  label: string;
};

const TABS: Tab[] = [
  { id: "resumen",       label: "Resumen" },
  { id: "indicadores",   label: "KPIs" },
  { id: "alertas",       label: "Alertas" },
  { id: "semaforos",     label: "Semáforos" },
  { id: "tendencias",    label: "Tendencias" },
  { id: "actividad",     label: "Actividad" },
  { id: "unidades",      label: "Unidades" },
  { id: "cumplimiento",  label: "Cumplimiento" },
  { id: "financiero",    label: "Financiero" },
  { id: "operativo",     label: "Operativo" },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function WorkspaceExecutiveDashboard({ wsId }: Props) {
  const [activeTab, setActiveTab] = useState("resumen");
  const { data: dashboard, isLoading: loadingDash, error: errDash } = useExecutiveDashboard(wsId);
  const { data: kpis,      isLoading: loadingKPIs }                 = useKPIsByDashboard(wsId);

  const isLoading = loadingDash || loadingKPIs;

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <LoadingSkeleton />
      </div>
    );
  }

  if (errDash || !dashboard) {
    return (
      <div className="p-6 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Error al cargar el dashboard ejecutivo. Verifique la conexión con el backend.
        </p>
        {errDash && (
          <p className="text-xs text-muted-foreground mt-1">{String(errDash)}</p>
        )}
      </div>
    );
  }

  const alertaCount = dashboard.alertasCriticas.length;

  return (
    <div className="space-y-0">
      {/* Tab Nav */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none px-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.id === "alertas" && alertaCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {alertaCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "resumen" && (
          <ExecResumenEjecutivo data={dashboard} />
        )}
        {activeTab === "indicadores" && (
          <ExecIndicadoresGlobales kpis={kpis ?? []} />
        )}
        {activeTab === "alertas" && (
          <ExecAlertasInstitucionales alertas={dashboard.alertasCriticas} />
        )}
        {activeTab === "semaforos" && (
          <ExecSemaforos semaforos={dashboard.semaforos} />
        )}
        {activeTab === "tendencias" && (
          <ExecTendencias kpis={kpis ?? []} />
        )}
        {activeTab === "actividad" && (
          <ExecActividadReciente actividad={dashboard.actividadGlobal} />
        )}
        {activeTab === "unidades" && (
          <ExecEstadoUnidades unidades={dashboard.unidades} />
        )}
        {activeTab === "cumplimiento" && (
          <ExecCumplimientoInstitucional unidades={dashboard.unidades} />
        )}
        {activeTab === "financiero" && (
          <ExecResumenFinanciero unidades={dashboard.unidades} globales={dashboard.globales} />
        )}
        {activeTab === "operativo" && (
          <ExecResumenOperativo unidades={dashboard.unidades} />
        )}
      </div>
    </div>
  );
}
