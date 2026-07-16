import { WorkspaceAdminProcesses } from "@/components/workspace/admin/WorkspaceAdminProcesses";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminProcessesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminProcesses wsId={wsId as WorkspaceId} />;
}
