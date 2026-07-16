import { WorkspaceAdminUsers } from "@/components/workspace/admin/WorkspaceAdminUsers";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminUsuariosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminUsers wsId={wsId as WorkspaceId} />;
}
