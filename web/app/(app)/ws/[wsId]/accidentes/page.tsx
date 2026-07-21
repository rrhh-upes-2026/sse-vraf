import { WorkspaceAccidentes } from "@/components/workspace/sso/WorkspaceAccidentes";
import type { WorkspaceId } from "@/config/nav";

export default async function AccidentesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAccidentes wsId={wsId as WorkspaceId} />;
}
