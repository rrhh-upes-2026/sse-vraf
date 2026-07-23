"use client";

import { useState } from "react";
import Link from "next/link";
import { useAPEPlanes } from "@/hooks/useAPE";
import { Skeleton } from "@/components/ui/skeleton";
import type { APEPlan, APEStatus } from "@/types/ape";

type CalendarMode = "mensual" | "trimestral" | "semestral" | "anual";

interface Props {
  wsId: string;
  year?: string;
}

const STATUS_COLORS: Record<APEStatus, string> = {
  Programada: "bg-sse-sem-green-bg text-sse-sem-green-fg border-sse-sem-green-fg/30",
  Próxima:    "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  Pendiente:  "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  Archivada:  "bg-sse-muted/10 text-sse-muted border-sse-border",
  Cancelada:  "bg-sse-sem-red-bg text-sse-sem-red-fg border-sse-sem-red-fg/30",
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const QUARTER_NAMES = ["Q1 (Ene-Mar)", "Q2 (Abr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dic)"];
const SEMESTER_NAMES = ["S1 (Ene-Jun)", "S2 (Jul-Dic)"];

function plansForMonth(plans: APEPlan[], month: number) {
  return plans.filter((p) => Number(p.plannedMonth) === month);
}

function plansForQuarter(plans: APEPlan[], quarter: number) {
  return plans.filter((p) => Number(p.plannedQuarter) === quarter);
}

function plansForSemester(plans: APEPlan[], semester: number) {
  return plans.filter((p) => Number(p.plannedSemester) === semester);
}

function PlanChip({ plan, wsId }: { plan: APEPlan; wsId: string }) {
  return (
    <Link
      href={`/ws/${wsId}/ape-planes/${plan.id}`}
      className={`block rounded border px-2 py-1 text-[11px] leading-tight truncate hover:opacity-80 transition-opacity ${STATUS_COLORS[plan.status]}`}
      title={plan.title}
    >
      {plan.plannedExecutionNumber != null && (
        <span className="font-mono opacity-60 mr-1">#{plan.plannedExecutionNumber}</span>
      )}
      {plan.title}
    </Link>
  );
}

function MonthCell({ month, plans, wsId }: { month: number; plans: APEPlan[]; wsId: string }) {
  const monthPlans = plansForMonth(plans, month);
  return (
    <div className="border border-sse-border rounded-md p-3 min-h-[100px] bg-sse-surface">
      <p className="text-[12px] font-semibold text-sse-muted mb-2">{MONTH_NAMES[month - 1]}</p>
      <div className="space-y-1">
        {monthPlans.slice(0, 5).map((p) => (
          <PlanChip key={p.id} plan={p} wsId={wsId} />
        ))}
        {monthPlans.length > 5 && (
          <p className="text-[11px] text-sse-muted">+{monthPlans.length - 5} más</p>
        )}
        {monthPlans.length === 0 && (
          <p className="text-[11px] text-sse-muted/50 italic">Sin planes</p>
        )}
      </div>
    </div>
  );
}

export function PlanCalendar({ wsId, year }: Props) {
  const currentYear = year ?? new Date().getFullYear().toString();
  const [mode, setMode] = useState<CalendarMode>("mensual");
  const [offset, setOffset] = useState(0);

  const { data: planes = [], isLoading } = useAPEPlanes({ year: currentYear });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-md" />
        ))}
      </div>
    );
  }

  const modeButtons: { label: string; value: CalendarMode }[] = [
    { label: "Mensual",    value: "mensual" },
    { label: "Trimestral", value: "trimestral" },
    { label: "Semestral",  value: "semestral" },
    { label: "Anual",      value: "anual" },
  ];

  const renderMensual = () => {
    const month = ((offset % 12) + 12) % 12 + 1;
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setOffset((o) => o - 1)} className="text-[13px] text-sse-muted hover:text-sse-ink px-2 py-1">←</button>
          <span className="text-[13px] font-medium text-sse-ink">{MONTH_NAMES[month - 1]} {currentYear}</span>
          <button onClick={() => setOffset((o) => o + 1)} className="text-[13px] text-sse-muted hover:text-sse-ink px-2 py-1">→</button>
        </div>
        <MonthCell month={month} plans={planes} wsId={wsId} />
      </div>
    );
  };

  const renderTrimestral = () => {
    const quarter = ((offset % 4) + 4) % 4 + 1;
    const startMonth = (quarter - 1) * 3 + 1;
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setOffset((o) => o - 1)} className="text-[13px] text-sse-muted hover:text-sse-ink px-2 py-1">←</button>
          <span className="text-[13px] font-medium text-sse-ink">{QUARTER_NAMES[quarter - 1]} {currentYear}</span>
          <button onClick={() => setOffset((o) => o + 1)} className="text-[13px] text-sse-muted hover:text-sse-ink px-2 py-1">→</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[startMonth, startMonth + 1, startMonth + 2].map((m) => (
            <MonthCell key={m} month={m} plans={planes} wsId={wsId} />
          ))}
        </div>
      </div>
    );
  };

  const renderSemestral = () => {
    const semester = ((offset % 2) + 2) % 2 + 1;
    const startMonth = semester === 1 ? 1 : 7;
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setOffset((o) => o - 1)} className="text-[13px] text-sse-muted hover:text-sse-ink px-2 py-1">←</button>
          <span className="text-[13px] font-medium text-sse-ink">{SEMESTER_NAMES[semester - 1]} {currentYear}</span>
          <button onClick={() => setOffset((o) => o + 1)} className="text-[13px] text-sse-muted hover:text-sse-ink px-2 py-1">→</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }, (_, i) => startMonth + i).map((m) => (
            <MonthCell key={m} month={m} plans={planes} wsId={wsId} />
          ))}
        </div>
      </div>
    );
  };

  const renderAnual = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
        <MonthCell key={m} month={m} plans={planes} wsId={wsId} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-1 bg-sse-muted/10 rounded-md p-1 w-fit">
        {modeButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => { setMode(btn.value); setOffset(0); }}
            className={`px-3 py-1 rounded text-[12px] font-medium transition-colors ${
              mode === btn.value
                ? "bg-sse-surface text-sse-ink shadow-sm"
                : "text-sse-muted hover:text-sse-ink"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {mode === "mensual"    && renderMensual()}
      {mode === "trimestral" && renderTrimestral()}
      {mode === "semestral"  && renderSemestral()}
      {mode === "anual"      && renderAnual()}

      <p className="text-[12px] text-sse-muted">{planes.length} planes en {currentYear}</p>
    </div>
  );
}
