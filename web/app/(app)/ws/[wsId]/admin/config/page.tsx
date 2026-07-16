import { WorkspaceAdminConfig } from "@/components/workspace/admin/WorkspaceAdminConfig";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminConfigPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminConfig wsId={wsId as WorkspaceId} />;
}
