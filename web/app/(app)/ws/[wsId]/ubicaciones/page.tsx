import { WorkspaceUbicaciones } from "@/components/workspace/mantenimiento/WorkspaceUbicaciones";
import type { WorkspaceId } from "@/config/nav";

export default async function UbicacionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceUbicaciones wsId={wsId as WorkspaceId} />;
}
