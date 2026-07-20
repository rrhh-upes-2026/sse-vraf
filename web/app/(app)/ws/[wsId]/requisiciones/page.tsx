import { WorkspaceRequisiciones } from "@/components/workspace/compras/WorkspaceRequisiciones";
import type { WorkspaceId } from "@/config/nav";

export default async function RequisicionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceRequisiciones wsId={wsId as WorkspaceId} />;
}
