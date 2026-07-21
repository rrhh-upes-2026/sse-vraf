import { WorkspaceCostosManto } from "@/components/workspace/mantenimiento/WorkspaceCostosManto";
import type { WorkspaceId } from "@/config/nav";

export default async function CostosMantoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceCostosManto wsId={wsId as WorkspaceId} />;
}
