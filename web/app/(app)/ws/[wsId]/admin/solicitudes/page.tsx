import { WorkspaceAdminRequests } from "@/components/workspace/admin/WorkspaceAdminRequests";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminSolicitudesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminRequests wsId={wsId as WorkspaceId} />;
}
