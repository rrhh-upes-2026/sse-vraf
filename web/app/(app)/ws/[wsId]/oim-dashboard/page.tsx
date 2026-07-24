import { WorkspaceOIM } from "@/components/workspace/WorkspaceOIM";

export default async function OIMDashboardPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Official Indicator Migration</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Sprint 017 — Motor de migración oficial de los 10 indicadores VRAF hacia el IDE.</p>
      </div>
      <WorkspaceOIM wsId={wsId} />
    </div>
  );
}
