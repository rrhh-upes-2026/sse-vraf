import { WorkspaceGWP } from "@/components/workspace/WorkspaceGWP";

export default async function GWPDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Google Workspace — Dashboard</h1>
      <p className="text-[13px] text-sse-muted">
        Estado general de la integración: OAuth, Drive, Gmail, Calendar y Chat.
      </p>
      <WorkspaceGWP wsId={wsId} />
    </div>
  );
}
