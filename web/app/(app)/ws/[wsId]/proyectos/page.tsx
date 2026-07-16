import { WorkspaceProjects } from "@/components/workspace/WorkspaceProjects";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceProyectosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceProjects wsId={wsId as WorkspaceId} />;
}
