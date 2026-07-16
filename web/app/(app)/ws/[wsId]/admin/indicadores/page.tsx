import { WorkspaceAdminIndicators } from "@/components/workspace/admin/WorkspaceAdminIndicators";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminIndicadoresPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminIndicators wsId={wsId as WorkspaceId} />;
}
