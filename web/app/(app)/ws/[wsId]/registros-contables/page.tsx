import { WorkspaceRegistros } from "@/components/workspace/contabilidad/WorkspaceRegistros";
import type { WorkspaceId } from "@/config/nav";

export default async function RegistrosContablesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceRegistros wsId={wsId as WorkspaceId} />;
}
