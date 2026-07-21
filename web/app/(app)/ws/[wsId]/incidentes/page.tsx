import { WorkspaceIncidentes } from "@/components/workspace/sso/WorkspaceIncidentes";
import type { WorkspaceId } from "@/config/nav";

export default async function IncidentesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceIncidentes wsId={wsId as WorkspaceId} />;
}
