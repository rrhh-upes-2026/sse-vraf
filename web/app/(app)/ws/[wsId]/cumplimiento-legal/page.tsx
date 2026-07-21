import { WorkspaceCumplimientoLegal } from "@/components/workspace/sso/WorkspaceCumplimientoLegal";
import type { WorkspaceId } from "@/config/nav";

export default async function CumplimientoLegalPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceCumplimientoLegal wsId={wsId as WorkspaceId} />;
}
