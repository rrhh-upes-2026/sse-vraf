"use client";

import { cn } from "@/lib/utils";
import type { GaugeCardProps, KPISemaforo } from "@/types/executive";

const SEMAFORO_COLOR: Record<KPISemaforo, string> = {
  verde:    "#10b981",
  amarillo: "#f59e0b",
  rojo:     "#ef4444",
};

const SEMAFORO_TEXT: Record<KPISemaforo, string> = {
  verde:    "text-emerald-600 dark:text-emerald-400",
  amarillo: "text-amber-600 dark:text-amber-400",
  rojo:     "text-red-600 dark:text-red-400",
};

function deriveSemaforo(pct: number): KPISemaforo {
  if (pct >= 90) return "verde";
  if (pct >= 70) return "amarillo";
  return "rojo";
}

const SIZE_CFG = {
  sm: { r: 32, cx: 44, cy: 44, vb: "0 0 88 56", stroke: 6, fontSize: "text-base" },
  md: { r: 40, cx: 56, cy: 56, vb: "0 0 112 72", stroke: 8, fontSize: "text-xl" },
  lg: { r: 52, cx: 72, cy: 72, vb: "0 0 144 92", stroke: 10, fontSize: "text-2xl" },
};

export function GaugeCard({ label, valor, meta, unidad, semaforo, size = "md" }: GaugeCardProps) {
  const pct     = meta > 0 ? Math.min(100, (valor / meta) * 100) : 0;
  const sem     = semaforo ?? deriveSemaforo(pct);
  const color   = SEMAFORO_COLOR[sem];
  const cfg     = SIZE_CFG[size];
  const circ    = Math.PI * cfg.r;
  const dashArr = circ;
  const dashOff = circ * (1 - pct / 100);

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-muted-foreground text-center">{label}</p>

      <div className="relative">
        <svg viewBox={cfg.vb} width="100%" className="w-28 overflow-visible">
          <path
            d={`M ${cfg.cx - cfg.r} ${cfg.cy} A ${cfg.r} ${cfg.r} 0 0 1 ${cfg.cx + cfg.r} ${cfg.cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={cfg.stroke}
            className="text-muted/40"
            strokeLinecap="round"
          />
          <path
            d={`M ${cfg.cx - cfg.r} ${cfg.cy} A ${cfg.r} ${cfg.r} 0 0 1 ${cfg.cx + cfg.r} ${cfg.cy}`}
            fill="none"
            stroke={color}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={`${dashArr}`}
            strokeDashoffset={`${dashOff}`}
            style={{ transform: "none" }}
          />
          <text x={cfg.cx} y={cfg.cy - 4} textAnchor="middle" className={cn("font-bold fill-current", cfg.fontSize)} style={{ fill: color, fontSize: size === "lg" ? 20 : size === "md" ? 16 : 13 }}>
            {pct.toFixed(0)}%
          </text>
        </svg>
      </div>

      <div className="text-center">
        <p className={cn("text-lg font-bold tabular-nums", SEMAFORO_TEXT[sem])}>
          {valor.toLocaleString("es-SV")}{unidad ? ` ${unidad}` : ""}
        </p>
        {meta > 0 && (
          <p className="text-xs text-muted-foreground">
            meta: {meta.toLocaleString("es-SV")}{unidad ? ` ${unidad}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
