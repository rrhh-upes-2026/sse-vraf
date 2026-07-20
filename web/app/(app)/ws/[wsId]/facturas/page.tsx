import { WorkspaceFacturas } from "@/components/workspace/contabilidad/WorkspaceFacturas";
import type { WorkspaceId } from "@/config/nav";

export default async function FacturasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceFacturas wsId={wsId as WorkspaceId} />;
}
