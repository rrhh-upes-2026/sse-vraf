import { WorkspaceInventarioTecnico } from "@/components/workspace/mantenimiento/WorkspaceInventarioTecnico";
import type { WorkspaceId } from "@/config/nav";

export default async function InventarioTecnicoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceInventarioTecnico wsId={wsId as WorkspaceId} />;
}
