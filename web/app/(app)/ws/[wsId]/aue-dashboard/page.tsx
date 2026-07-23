import { WorkspaceAUE } from "@/components/workspace/WorkspaceAUE";

export default async function AUEDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Automation &amp; Event Engine</h1>
      <p className="text-[13px] text-sse-muted">
        Event Bus institucional transversal. Registra y reacciona a eventos de cualquier motor mediante reglas WHEN/IF/THEN configurables.
      </p>
      <WorkspaceAUE wsId={wsId} />
    </div>
  );
}
