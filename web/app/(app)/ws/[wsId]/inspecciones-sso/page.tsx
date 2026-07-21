import { WorkspaceInspeccionesSSO } from "@/components/workspace/sso/WorkspaceInspeccionesSSO";
import type { WorkspaceId } from "@/config/nav";

export default async function InspeccionesSSOPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceInspeccionesSSO wsId={wsId as WorkspaceId} />;
}
