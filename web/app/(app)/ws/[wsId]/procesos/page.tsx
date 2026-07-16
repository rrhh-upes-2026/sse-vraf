import { WorkspaceProcesses } from "@/components/workspace/WorkspaceProcesses";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceProcesosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceProcesses wsId={wsId as WorkspaceId} />;
}
