"use client";

import Link from "next/link";
import { useICEPeriods, useICECapturas, useICEMyIndicators } from "@/hooks/useICE";

function ICEStats({ wsId }: { wsId: string }) {
  const { data: open }    = useICEPeriods({ estado: "abierto" });
  const { data: closed }  = useICEPeriods({ estado: "cerrado" });
  const { data: pending } = useICECapturas({ status: "enviada" });
  const { data: approved }= useICECapturas({ status: "aprobada" });
  const { data: rejected }= useICECapturas({ status: "rechazada" });

  const stat = (label: string, val: number | undefined, color: string) => (
    <div className={`rounded-lg border p-4 ${color}`}>
      <p className="text-[22px] font-bold tabular-nums">{val ?? "—"}</p>
      <p className="text-[11px] font-medium mt-0.5">{label}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stat("Períodos abiertos",   open?.length,     "bg-sky-50 border-sky-200 text-sky-700")}
      {stat("Pendientes",          pending?.length,  "bg-amber-50 border-amber-200 text-amber-700")}
      {stat("Aprobadas",           approved?.length, "bg-green-50 border-green-200 text-green-700")}
      {stat("Rechazadas",          rejected?.length, rejected?.length ? "bg-red-50 border-red-200 text-red-700" : "bg-sse-surface border-sse-border text-sse-ink")}
      {stat("Períodos cerrados",   closed?.length,   "bg-sse-surface border-sse-border text-sse-muted")}
    </div>
  );
}

function MisIndicadoresPreview({ wsId }: { wsId: string }) {
  const { data: items, isLoading } = useICEMyIndicators();

  if (isLoading) return <p className="text-[12px] text-sse-muted">Cargando…</p>;
  if (!items?.length) return (
    <p className="text-[12px] text-sse-muted">No tienes indicadores asignados en el período activo.</p>
  );

  const statusColor: Record<string, string> = {
    borrador:    "bg-sse-border/40 text-sse-muted",
    enviada:     "bg-amber-100 text-amber-700",
    en_revision: "bg-blue-100 text-blue-700",
    aprobada:    "bg-green-100 text-green-700",
    rechazada:   "bg-red-100 text-red-700",
    cerrada:     "bg-sse-border/40 text-sse-muted",
  };

  return (
    <div className="space-y-2">
      {items.slice(0, 5).map((item) => (
        <div key={item.indicator.id} className="flex items-center gap-3 rounded-lg border border-sse-border bg-white p-3">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-sse-ink truncate">{item.indicator.nombre}</p>
            <p className="text-[11px] text-sse-muted">{item.indicator.codigo} · {item.activePeriod?.nombre ?? "Sin período activo"}</p>
          </div>
          {item.captura ? (
            <span className={`shrink-0 text-[10px] font-medium rounded-full px-2 py-0.5 ${statusColor[item.captura.status] ?? ""}`}>
              {item.captura.status}
            </span>
          ) : (
            <Link href={`/ws/${wsId}/ice-capturar`}
              className="shrink-0 text-[11px] text-sky-600 hover:underline font-medium">
              Capturar
            </Link>
          )}
        </div>
      ))}
      {items.length > 5 && (
        <Link href={`/ws/${wsId}/ice-mis-indicadores`} className="text-[12px] text-sky-600 hover:underline">
          Ver todos ({items.length}) →
        </Link>
      )}
    </div>
  );
}

const SERVICES = [
  { label: "Formulario Dinámico",     desc: "Generado automáticamente desde las variables de la fórmula FMI. El usuario solo ingresa los valores.", icon: "M4 6h16M4 10h16M4 14h7", color: "text-sky-700 bg-sky-50 border-sky-200" },
  { label: "Cálculo Automático",      desc: "FormulaEngine calcula el resultado al guardar. RangeEngine asigna el nivel. Nadie ingresa resultados.", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 20h16a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1z", color: "text-green-700 bg-green-50 border-green-200" },
  { label: "Flujo de Aprobación",     desc: "Responsable → Jefatura → Vicerrectoría. Configurable. No bloquea futuros niveles.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-violet-700 bg-violet-50 border-violet-200" },
  { label: "Evidencias EME",          desc: "PDF, Excel, Imagen, Word, ZIP. ICE solo guarda referencias; los archivos viven en EME.", icon: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { label: "Bloqueo de Períodos",     desc: "Un período cerrado bloquea todas sus capturas. Sin edición retroactiva.", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", color: "text-red-700 bg-red-50 border-red-200" },
  { label: "Auditoría Completa",      desc: "Crear, editar, eliminar, aprobar, reabrir, bloquear: todo queda registrado en ICE_AuditTrail.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-teal-700 bg-teal-50 border-teal-200" },
];

export function WorkspaceICE({ wsId }: { wsId: string }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-sky-200 bg-sky-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-sky-600 mt-0.5 shrink-0">
            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-[13px] font-semibold text-sky-800">ICE — Sprint 018 — Indicator Capture Engine</p>
            <p className="text-[12px] text-sky-700 mt-0.5">
              Los responsables registran variables por período. El sistema calcula automáticamente el resultado usando FormulaEngine, evalúa el rango y lo envía al flujo de aprobación. Nadie ingresa resultados manualmente.
            </p>
          </div>
        </div>
      </div>

      <ICEStats wsId={wsId} />

      <div className="flex flex-wrap gap-2">
        <Link href={`/ws/${wsId}/ice-capturar`}
          className="text-[12px] px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium">
          + Nueva Captura
        </Link>
        <Link href={`/ws/${wsId}/ice-mis-indicadores`}
          className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          Mis Indicadores
        </Link>
        <Link href={`/ws/${wsId}/ice-aprobaciones`}
          className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          Aprobaciones pendientes
        </Link>
        <Link href={`/ws/${wsId}/ice-periodos`}
          className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          Gestionar Períodos
        </Link>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-2">Mis indicadores activos</h3>
        <MisIndicadoresPreview wsId={wsId} />
      </div>

      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted mb-3">Servicios del Motor ICE</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICES.map((s) => (
            <div key={s.label} className={`rounded-lg border p-4 flex gap-3 ${s.color}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5 shrink-0 mt-0.5">
                <path d={s.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-[12px] font-semibold">{s.label}</p>
                <p className="text-[11px] mt-0.5 opacity-80">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
