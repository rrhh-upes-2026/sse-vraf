import { IOETracking } from "@/components/workspace/ioe/Tracking";

export default async function IOESeguimientoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Seguimiento y Métricas</h1>
      <p className="text-[13px] text-sse-muted">
        Indicadores de ejecución: tiempo de cierre, desviación de fechas, índice de ejecución y retraso. Cumplimiento por responsable y distribución de planes.
      </p>
      <IOETracking wsId={wsId} />
    </div>
  );
}
