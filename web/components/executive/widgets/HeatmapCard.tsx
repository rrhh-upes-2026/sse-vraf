"use client";

import { cn } from "@/lib/utils";
import type { HeatmapCardProps } from "@/types/executive";

function interpolateColor(valor: number, min: number, max: number, from: string, to: string): string {
  if (max === min) return from;
  const t   = (valor - min) / (max - min);
  const fr  = parseInt(from.slice(1, 3), 16);
  const fg  = parseInt(from.slice(3, 5), 16);
  const fb  = parseInt(from.slice(5, 7), 16);
  const tr  = parseInt(to.slice(1, 3), 16);
  const tg  = parseInt(to.slice(3, 5), 16);
  const tb  = parseInt(to.slice(5, 7), 16);
  const r   = Math.round(fr + (tr - fr) * t);
  const g   = Math.round(fg + (tg - fg) * t);
  const b   = Math.round(fb + (tb - fb) * t);
  return `rgb(${r},${g},${b})`;
}

export function HeatmapCard({ title, cells, rows, cols, colorScale }: HeatmapCardProps) {
  const from  = colorScale?.[0] ?? "#fef3c7";
  const to    = colorScale?.[1] ?? "#dc2626";
  const vals  = cells.map(c => c.valor);
  const min   = Math.min(...vals, 0);
  const max   = Math.max(...vals, 1);

  function getCell(row: string, col: string) {
    return cells.find(c => c.row === row && c.col === col);
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-24 text-left pb-1 text-muted-foreground font-normal" />
              {cols.map(col => (
                <th key={col} className="text-center pb-1 text-muted-foreground font-medium px-1">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row}>
                <td className="text-muted-foreground py-0.5 pr-2 font-medium">{row}</td>
                {cols.map(col => {
                  const cell = getCell(row, col);
                  const bg   = cell ? interpolateColor(cell.valor, min, max, from, to) : "transparent";
                  return (
                    <td key={col} className="py-0.5 px-1">
                      <div
                        className="rounded w-full h-7 flex items-center justify-center font-bold tabular-nums"
                        style={{ backgroundColor: bg, color: cell && cell.valor > (max * 0.6) ? "#fff" : "#374151" }}
                        title={cell?.label ?? `${row}/${col}: ${cell?.valor ?? "-"}`}
                      >
                        {cell ? cell.valor : "-"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Bajo</span>
        <div className="flex-1 h-2 rounded-full" style={{ background: `linear-gradient(to right, ${from}, ${to})` }} />
        <span className="text-xs text-muted-foreground">Alto</span>
      </div>
    </div>
  );
}
