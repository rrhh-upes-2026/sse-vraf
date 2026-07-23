import { TrendChart } from "@/components/workspace/eip/TrendChart";

export default async function EIPTendenciasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Análisis de Tendencias</h1>
      <p className="text-[13px] text-sse-muted">
        Evolución histórica de los indicadores clave: cumplimiento, ejecución, documentación y planes de mejora.
      </p>
      <TrendChart />
    </div>
  );
}
