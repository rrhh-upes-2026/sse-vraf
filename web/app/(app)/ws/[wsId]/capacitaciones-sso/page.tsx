import { WorkspaceCapacitacionesSSO } from "@/components/workspace/sso/WorkspaceCapacitacionesSSO";
import type { WorkspaceId } from "@/config/nav";

export default async function CapacitacionesSSOPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceCapacitacionesSSO wsId={wsId as WorkspaceId} />;
}
