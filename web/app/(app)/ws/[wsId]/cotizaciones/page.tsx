import { WorkspaceCotizaciones } from "@/components/workspace/compras/WorkspaceCotizaciones";
import type { WorkspaceId } from "@/config/nav";

export default async function CotizacionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceCotizaciones wsId={wsId as WorkspaceId} />;
}
