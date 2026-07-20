import { WorkspaceSolicitudesCompra } from "@/components/workspace/compras/WorkspaceSolicitudesCompra";
import type { WorkspaceId } from "@/config/nav";

export default async function SolicitudesCompraPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceSolicitudesCompra wsId={wsId as WorkspaceId} />;
}
