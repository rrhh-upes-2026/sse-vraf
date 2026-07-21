import { WorkspaceSolicitudesManto } from "@/components/workspace/mantenimiento/WorkspaceSolicitudesManto";
import type { WorkspaceId } from "@/config/nav";

export default async function SolicitudesMantoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceSolicitudesManto wsId={wsId as WorkspaceId} />;
}
