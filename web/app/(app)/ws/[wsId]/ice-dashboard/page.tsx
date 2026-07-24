import { WorkspaceICE } from "@/components/workspace/WorkspaceICE";

export default async function ICEDashboardPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Indicator Capture Engine</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Sprint 018 — Motor operativo de captura de variables de indicadores institucionales.</p>
      </div>
      <WorkspaceICE wsId={wsId} />
    </div>
  );
}
