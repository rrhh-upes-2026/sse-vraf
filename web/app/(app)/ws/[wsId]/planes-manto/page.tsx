import { WorkspacePlanesManto } from "@/components/workspace/mantenimiento/WorkspacePlanesManto";
import type { WorkspaceId } from "@/config/nav";

export default async function PlanesMantoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspacePlanesManto wsId={wsId as WorkspaceId} />;
}
