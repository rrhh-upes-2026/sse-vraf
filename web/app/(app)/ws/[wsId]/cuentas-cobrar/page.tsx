import { WorkspaceCuentasCobrar } from "@/components/workspace/contabilidad/WorkspaceCuentasCobrar";
import type { WorkspaceId } from "@/config/nav";

export default async function CuentasCobrarPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceCuentasCobrar wsId={wsId as WorkspaceId} />;
}
