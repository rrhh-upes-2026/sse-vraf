"use client";

import Link from "next/link";
import { useOIMReports } from "@/hooks/useOIM";

function OIMStats({ wsId }: { wsId: string }) {
  const { data: reports } = useOIMReports();

  const last = reports?.[0];
  const totalRuns = reports?.length ?? 0;
  const totalImported = reports?.reduce((s, r) => s + r.imported, 0) ?? 0;
  const totalConflicts = reports?.reduce((s, r) => s + r.conflictos, 0) ?? 0;

  const stat = (label: string, value: string | number | undefined, color: string) => (
    <div className={`rounded-lg border p-4 ${color}`}>
      <p className="text-[22px] font-bold tabular-nums">{value ?? "—"}</p>
      <p className="text-[11px] font-medium mt-0.5">{label}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stat("Indicadores importados", totalImported, "bg-green-50 border-green-200 text-green-700")}
      {stat("Ejecuciones totales", totalRuns, "bg-sse-surface border-sse-border text-sse-ink")}
      {stat("Conflictos detectados", totalConflicts, totalConflicts > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-sse-surface border-sse-border text-sse-ink")}
      {stat("Última migración", last ? last.runAt.slice(0, 10) : "Ninguna", "bg-indigo-50 border-indigo-200 text-indigo-700")}
    </div>
  );
}

const PILLARS = [
  {
    label: "Motor de Migración",
    desc: "Procesa los 10 indicadores VRAF oficiales: valida, deduplica y publica con códigos VRAF-001..010.",
    icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
  },
  {
    label: "Fusión de Catálogos",
    desc: "Siembra objetivo, 7 dimensiones, 2 unidades, 4 frecuencias, 10 fórmulas y 10 rangos en el FMI — idempotente.",
    icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
    color: "text-teal-700 bg-teal-50 border-teal-200",
  },
  {
    label: "Validador OIM",
    desc: "Verifica que cada fila del Excel tenga catálogos existentes antes de crear el indicador. Si falta → conflicto, NO importa.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-green-700 bg-green-50 border-green-200",
  },
  {
    label: "Detector de Duplicados",
    desc: "Comprueba nombre idéntico y código antes de insertar. Un duplicado detectado → rechazado con registro de conflicto.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    label: "Historial de Auditoría",
    desc: "Cada ejecución genera un reporte estructurado en OIM_ImportHistory: total, importados, rechazados, conflictos.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    label: "VersionManager",
    desc: "Cada indicador importado nace en versión 1.0, estado Publicado, con snapshot en IDE_Versions.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    color: "text-violet-700 bg-violet-50 border-violet-200",
  },
];

export function WorkspaceOIM({ wsId }: { wsId: string }) {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-[13px] font-semibold text-indigo-800">OIM — Sprint 017 — Migración Oficial VRAF</p>
            <p className="text-[12px] text-indigo-700 mt-0.5">
              Importa los 10 indicadores oficiales de la VRAF desde el Excel institucional. Normaliza, versiona y publica contra el catálogo FMI. Genera reporte de auditoría completo.
            </p>
          </div>
        </div>
      </div>

      {/* Live stats */}
      <OIMStats wsId={wsId} />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/ws/${wsId}/oim-migracion`}
          className="text-[12px] px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium">
          Ejecutar Migración
        </Link>
        <Link href={`/ws/${wsId}/oim-reporte`}
          className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          Reporte de Validación
        </Link>
        <Link href={`/ws/${wsId}/oim-errores`}
          className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          Conflictos
        </Link>
        <Link href={`/ws/${wsId}/oim-historial`}
          className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          Historial
        </Link>
      </div>

      {/* Services */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-3">Servicios del Motor OIM</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PILLARS.map((p) => (
            <div key={p.label} className={`rounded-lg border p-4 flex gap-3 ${p.color}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5 shrink-0 mt-0.5">
                <path d={p.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-[12px] font-semibold">{p.label}</p>
                <p className="text-[11px] mt-0.5 opacity-80">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
