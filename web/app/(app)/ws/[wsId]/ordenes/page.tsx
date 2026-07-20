import { WorkspaceOrdenesCompra } from "@/components/workspace/compras/WorkspaceOrdenesCompra";
import type { WorkspaceId } from "@/config/nav";

export default async function OrdenesCompraPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceOrdenesCompra wsId={wsId as WorkspaceId} />;
}
