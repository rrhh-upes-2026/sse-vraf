import { WorkspaceRecepcion } from "@/components/workspace/compras/WorkspaceRecepcion";
import type { WorkspaceId } from "@/config/nav";

export default async function RecepcionPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceRecepcion wsId={wsId as WorkspaceId} />;
}
