import { WorkspaceEIP } from "@/components/workspace/WorkspaceEIP";

export default async function EIPDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Dashboard Ejecutivo</h1>
      <p className="text-[13px] text-sse-muted">
        Visión consolidada del desempeño institucional: puntaje global, KPIs estratégicos, alertas y análisis de brechas.
      </p>
      <WorkspaceEIP wsId={wsId} />
    </div>
  );
}
