import { WorkspaceDashboard } from "@/components/workspace/WorkspaceDashboard";
import { getWorkspace } from "@/config/nav";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  const unit = getWorkspace(wsId);
  return (
    <WorkspaceDashboard
      wsId={wsId as WorkspaceId}
      unitColor={unit?.color ?? "#2E6BE6"}
      unitName={unit?.full ?? wsId}
    />
  );
}
