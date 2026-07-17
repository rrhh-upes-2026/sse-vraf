import { WorkspaceAdminForms } from "@/components/workspace/admin/WorkspaceAdminForms";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminFormsPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminForms wsId={wsId as WorkspaceId} />;
}
