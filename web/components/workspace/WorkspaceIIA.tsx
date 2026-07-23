"use client";

import { useIIADashboard, useIIAStatus } from "@/hooks/useIIA";
import type { IIAGeminiStatus } from "@/types/iia";

function KPICard({ label, value, accent, sub }: {
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

function StatusBadge({ status }: { status: IIAGeminiStatus }) {
  const map: Record<IIAGeminiStatus, { label: string; cls: string }> = {
    available:   { label: "Disponible",  cls: "bg-green-100 text-green-700" },
    degraded:    { label: "Degradado",   cls: "bg-amber-100 text-amber-700" },
    unavailable: { label: "No disponible", cls: "bg-red-100 text-red-700" },
  };
  const { label, cls } = map[status] ?? map.unavailable;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>;
}

function UsageSparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 280, H = 52, PAD = 4;
  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (v / max) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1].split(",");
  const area = `${pts.join(" ")} ${last[0]},${H - PAD} ${PAD},${H - PAD}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" aria-hidden>
      <defs>
        <linearGradient id="iia-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts.join(" ")} fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={area} fill="url(#iia-grad)" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="#4F46E5" />
    </svg>
  );
}

function fmtMs(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtNum(n: number) {
  return n.toLocaleString("es-SV");
}

export function WorkspaceIIA({ wsId }: { wsId: string }) {
  void wsId;
  const { data, isLoading } = useIIADashboard();
  const { data: statusData } = useIIAStatus();

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

  const geminiStatus = statusData?.status ?? data.geminiStatus;

  return (
    <div className="space-y-6">
      {/* Gemini status banner */}
      {geminiStatus !== "available" && (
        <div className={`rounded-lg border px-4 py-3 text-[12px] ${
          geminiStatus === "degraded"
            ? "border-amber-200 bg-amber-50/50 text-amber-800"
            : "border-red-200 bg-red-50/50 text-red-800"
        }`}>
          {geminiStatus === "degraded"
            ? "Gemini API en modo degradado — las respuestas pueden ser más lentas."
            : "Gemini API no disponible. Verifica la clave API en Configuración."}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Consultas totales"    value={fmtNum(data.totalQueries)}      />
        <KPICard label="Tiempo promedio"       value={fmtMs(data.avgResponseTimeMs)}  accent="text-indigo-600" />
        <KPICard label="Tokens entrada"        value={fmtNum(data.totalTokensIn)}     sub="total acumulado" />
        <KPICard label="Tokens salida"         value={fmtNum(data.totalTokensOut)}    sub="total acumulado" />
        <KPICard label="Acciones ejecutadas"   value={fmtNum(data.actionsExecuted)}   accent="text-indigo-600" />
        <KPICard label="Errores"               value={fmtNum(data.errors)}            accent={data.errors > 0 ? "text-red-600" : undefined} />
        <KPICard label="Conversaciones activas" value={fmtNum(data.activeConversations)} />
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-wide text-sse-muted">Estado Gemini</span>
          <StatusBadge status={geminiStatus} />
          <span className="text-[11px] text-sse-muted font-mono truncate">{data.activeModel}</span>
        </div>
      </div>

      {/* Token usage chart */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4">
        <p className="text-[12px] font-semibold text-sse-ink mb-3">Consumo de tokens</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-sse-muted mb-1">Entrada</p>
            <UsageSparkline data={[data.totalTokensIn * 0.6, data.totalTokensIn * 0.75, data.totalTokensIn * 0.85, data.totalTokensIn]} />
          </div>
          <div>
            <p className="text-[11px] text-sse-muted mb-1">Salida</p>
            <UsageSparkline data={[data.totalTokensOut * 0.5, data.totalTokensOut * 0.7, data.totalTokensOut * 0.9, data.totalTokensOut]} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-sse-muted text-right">
        Generado: {new Date(data.generatedAt).toLocaleString("es-SV")}
      </p>
    </div>
  );
}
