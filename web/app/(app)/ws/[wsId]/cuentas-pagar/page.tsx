import { WorkspaceCuentasPagar } from "@/components/workspace/contabilidad/WorkspaceCuentasPagar";
import type { WorkspaceId } from "@/config/nav";

export default async function CuentasPagarPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceCuentasPagar wsId={wsId as WorkspaceId} />;
}
