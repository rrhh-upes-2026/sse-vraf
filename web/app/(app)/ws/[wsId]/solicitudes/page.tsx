import { WorkspaceRequests } from "@/components/workspace/WorkspaceRequests";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceSolicitudesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceRequests wsId={wsId as WorkspaceId} />;
}
