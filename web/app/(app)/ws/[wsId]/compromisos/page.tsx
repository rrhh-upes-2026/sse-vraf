import { WorkspaceCompromisos } from "@/components/workspace/contabilidad/WorkspaceCompromisos";
import type { WorkspaceId } from "@/config/nav";

export default async function CompromisosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceCompromisos wsId={wsId as WorkspaceId} />;
}
