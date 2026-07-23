import { WorkspaceIIA } from "@/components/workspace/WorkspaceIIA";

export default async function IIADashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Dashboard IIA</h1>
      <p className="text-[13px] text-sse-muted">
        Métricas del Asistente de Inteligencia Institucional: consultas, consumo de tokens, latencia, acciones ejecutadas y estado de Gemini.
      </p>
      <WorkspaceIIA wsId={wsId} />
    </div>
  );
}
