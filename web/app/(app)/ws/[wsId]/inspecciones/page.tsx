import { WorkspaceInspecciones } from "@/components/workspace/mantenimiento/WorkspaceInspecciones";
import type { WorkspaceId } from "@/config/nav";

export default async function InspeccionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceInspecciones wsId={wsId as WorkspaceId} />;
}
