import { WorkspaceIOE } from "@/components/workspace/WorkspaceIOE";

export default async function IOEDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Motor de Orquestación Institucional</h1>
      <p className="text-[13px] text-sse-muted">
        Centro de comando para planes de acción, hitos, tareas y decisiones institucionales. Transforma diagnósticos y alertas en ejecución coordinada.
      </p>
      <WorkspaceIOE wsId={wsId} />
    </div>
  );
}
