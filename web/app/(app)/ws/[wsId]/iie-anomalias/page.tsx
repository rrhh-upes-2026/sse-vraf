import { IIEAnomalies } from "@/components/workspace/iie/Anomalies";

export default async function IIEAnomaliasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Anomalías Detectadas</h1>
      <p className="text-[13px] text-sse-muted">
        Patrones estadísticos atípicos identificados por el motor de detección: caídas súbitas, tendencias sostenidas y comportamientos inusuales en el desempeño institucional.
      </p>
      <IIEAnomalies wsId={wsId} />
    </div>
  );
}
