import { WorkspacePagos } from "@/components/workspace/contabilidad/WorkspacePagos";
import type { WorkspaceId } from "@/config/nav";

export default async function PagosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspacePagos wsId={wsId as WorkspaceId} />;
}
