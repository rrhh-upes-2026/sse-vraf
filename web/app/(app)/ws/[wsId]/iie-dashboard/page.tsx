import { WorkspaceIIE } from "@/components/workspace/WorkspaceIIE";

export default async function IIEDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Motor de Inteligencia Institucional</h1>
      <p className="text-[13px] text-sse-muted">
        Sistema de análisis determinístico: diagnóstico institucional, recomendaciones priorizadas, predicciones y detección de anomalías.
      </p>
      <WorkspaceIIE wsId={wsId} />
    </div>
  );
}
