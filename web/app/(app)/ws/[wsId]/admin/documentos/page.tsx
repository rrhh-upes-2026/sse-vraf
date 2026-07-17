import { WorkspaceAdminDocuments } from "@/components/workspace/admin/WorkspaceAdminDocuments";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminDocumentsPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAdminDocuments wsId={wsId as WorkspaceId} />;
}
