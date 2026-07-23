import { HeatMap } from "@/components/workspace/eip/HeatMap";

export default async function EIPHeatMapPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Mapa de Calor</h1>
      <p className="text-[13px] text-sse-muted">
        Visualización cromática del nivel de cumplimiento por unidad y proceso. Verde ≥90%, Amarillo 75–89%, Naranja 60–74%, Rojo &lt;60%.
      </p>
      <HeatMap />
    </div>
  );
}
