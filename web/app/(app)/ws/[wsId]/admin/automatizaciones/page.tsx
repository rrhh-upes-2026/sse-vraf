import { WorkspaceAdminAutomations } from "@/components/workspace/admin/WorkspaceAdminAutomations";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminAutomatizacionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminAutomations wsId={wsId as WorkspaceId} />;
}
