"use client";

import { useState } from "react";
import { useCPESnapshots, useCalcularCPE } from "@/hooks/useCPE";

const STATUS_CHIP: Record<string, string> = {
  Verde:    "bg-emerald-100 text-emerald-800",
  Amarillo: "bg-yellow-100 text-yellow-800",
  Naranja:  "bg-orange-100 text-orange-800",
  Rojo:     "bg-red-100 text-red-800",
};

interface Props {
  wsId: string;
}

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export function CumplimientoTabla({ wsId }: Props) {
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear]   = useState(currentYear);
  const [month, setMonth] = useState<number | undefined>(undefined);

  const { data, isLoading } = useCPESnapshots(
    month ? { year, month } : { year }
  );
  const calcular = useCalcularCPE();

  const items = data?.items ?? [];

  function handleCalcular() {
    calcular.mutate({ wsId, year, month: currentMonth });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5">
          <label className="text-[12px] text-sse-muted">Año</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded border border-sse-border px-2 py-1 text-[13px] text-sse-ink focus:outline-none"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[12px] text-sse-muted">Mes</label>
          <select
            value={month ?? ""}
            onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded border border-sse-border px-2 py-1 text-[13px] text-sse-ink focus:outline-none"
          >
            <option value="">Todos</option>
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCalcular}
          disabled={calcular.isPending}
          className="ml-auto rounded-md bg-[#059669] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#047857] transition-colors disabled:opacity-50"
        >
          {calcular.isPending ? "Calculando..." : "+ Calcular periodo"}
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-[13px] text-sse-muted py-8 text-center">Cargando...</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-sse-border bg-white py-12 text-center">
          <p className="text-[13px] text-sse-muted">No hay snapshots para el periodo seleccionado.</p>
          <p className="text-[12px] text-sse-muted mt-1">Ejecute un cálculo para generar datos.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sse-border bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-sse-border bg-sse-surface">
                <th className="px-4 py-2 text-left font-medium text-sse-muted">Periodo</th>
                <th className="px-4 py-2 text-right font-medium text-sse-muted">Planificación</th>
                <th className="px-4 py-2 text-right font-medium text-sse-muted">Ejecución</th>
                <th className="px-4 py-2 text-right font-medium text-sse-muted">Documentación</th>
                <th className="px-4 py-2 text-right font-medium text-sse-muted">Global</th>
                <th className="px-4 py-2 text-left font-medium text-sse-muted">Estado</th>
                <th className="px-4 py-2 text-left font-medium text-sse-muted">Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-sse-border last:border-0 hover:bg-sse-surface/40">
                  <td className="px-4 py-2 tabular-nums text-sse-ink">
                    {MONTHS[(s.month ?? 1) - 1]} {s.year}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{s.planningScore}%</td>
                  <td className="px-4 py-2 text-right tabular-nums">{s.executionScore}%</td>
                  <td className="px-4 py-2 text-right tabular-nums">{s.documentationScore}%</td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold">{s.overallScore}%</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CHIP[s.complianceStatus] ?? ""}`}>
                      {s.complianceStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sse-muted">{s.riskLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
