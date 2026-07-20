import { WorkspaceConciliaciones } from "@/components/workspace/contabilidad/WorkspaceConciliaciones";
import type { WorkspaceId } from "@/config/nav";

export default async function ConciliacionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceConciliaciones wsId={wsId as WorkspaceId} />;
}
