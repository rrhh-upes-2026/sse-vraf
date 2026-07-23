import { WorkspaceCPE } from "@/components/workspace/WorkspaceCPE";

export default async function CPEDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Dashboard de Cumplimiento</h1>
      <p className="text-[13px] text-sse-muted">
        Visión consolidada del cumplimiento institucional basada en planificación, ejecución, documentación e indicadores.
      </p>
      <WorkspaceCPE wsId={wsId} />
    </div>
  );
}
