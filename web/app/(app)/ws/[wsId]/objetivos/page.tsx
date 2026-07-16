import { WorkspaceObjectives } from "@/components/workspace/WorkspaceObjectives";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceObjetivosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceObjectives wsId={wsId as WorkspaceId} />;
}
