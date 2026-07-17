import { WorkspaceAdminNotifications } from "@/components/workspace/admin/WorkspaceAdminNotifications";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminNotificationsPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminNotifications wsId={wsId as WorkspaceId} />;
}
