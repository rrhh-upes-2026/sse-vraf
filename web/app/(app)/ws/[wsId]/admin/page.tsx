import { WorkspaceAdminOverview } from "@/components/workspace/admin/WorkspaceAdminOverview";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminOverview wsId={wsId as WorkspaceId} />;
}
