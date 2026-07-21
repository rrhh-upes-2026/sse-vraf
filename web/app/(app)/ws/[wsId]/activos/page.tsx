import { WorkspaceActivos } from "@/components/workspace/mantenimiento/WorkspaceActivos";
import type { WorkspaceId } from "@/config/nav";

export default async function ActivosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceActivos wsId={wsId as WorkspaceId} />;
}
