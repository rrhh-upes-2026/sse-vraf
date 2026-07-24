interface SparklinePoint {
  fecha: string;
  valor: number;
}

interface SparklineChartProps {
  data: SparklinePoint[];
  height?: number;
  width?: number;
  meta?: number;
  color?: string;
}

export function SparklineChart({ data, height = 40, width = 140, meta, color = "#2E6BE6" }: SparklineChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-10 text-[11px] text-sse-muted rounded bg-sse-shell-canvas">
        Sin datos históricos
      </div>
    );
  }

  const values = data.map((d) => d.valor);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, meta ?? 0) || 1;
  const range = max - min || 1;
  const pad = 4;

  const toX = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const toY = (v: number) => height - pad - ((v - min) / range) * (height - pad * 2);

  const points = data.map((d, i) => `${toX(i)},${toY(d.valor)}`).join(" ");
  const areaPoints = [
    `${pad},${height - pad}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.valor)}`),
    `${width - pad},${height - pad}`,
  ].join(" ");

  const lastVal = values[values.length - 1];
  const lastX = toX(data.length - 1);
  const lastY = toY(lastVal);

  return (
    <div className="relative">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Area fill */}
        <polygon points={areaPoints} fill={color} fillOpacity={0.08} />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Meta line */}
        {meta !== undefined && (
          <line
            x1={pad}
            y1={toY(meta)}
            x2={width - pad}
            y2={toY(meta)}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3,3"
            opacity={0.5}
          />
        )}
        {/* Last dot */}
        <circle cx={lastX} cy={lastY} r={3} fill={color} />
      </svg>
    </div>
  );
}
