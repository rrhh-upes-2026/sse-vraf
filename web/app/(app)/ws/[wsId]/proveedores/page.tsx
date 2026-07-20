import { WorkspaceProveedores } from "@/components/workspace/compras/WorkspaceProveedores";
import type { WorkspaceId } from "@/config/nav";

export default async function ProveedoresPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceProveedores wsId={wsId as WorkspaceId} />;
}
