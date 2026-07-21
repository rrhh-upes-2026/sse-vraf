import { WorkspaceOrdenesTrabajo } from "@/components/workspace/mantenimiento/WorkspaceOrdenesTrabajo";
import type { WorkspaceId } from "@/config/nav";

export default async function OrdenesTrabajoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceOrdenesTrabajo wsId={wsId as WorkspaceId} />;
}
