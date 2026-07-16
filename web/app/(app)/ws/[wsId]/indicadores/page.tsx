import { WorkspaceIndicators } from "@/components/workspace/WorkspaceIndicators";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceIndicadoresPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceIndicators wsId={wsId as WorkspaceId} />;
}
