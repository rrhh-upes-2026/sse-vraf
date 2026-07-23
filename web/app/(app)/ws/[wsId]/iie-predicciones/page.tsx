import { IIEPredictions } from "@/components/workspace/iie/Predictions";

export default async function IIEPrediccionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Predicciones Institucionales</h1>
      <p className="text-[13px] text-sse-muted">
        Proyecciones determinísticas basadas en regresión lineal sobre series históricas de desempeño. Sin modelos de IA — cálculo transparente y auditable.
      </p>
      <IIEPredictions wsId={wsId} />
    </div>
  );
}
