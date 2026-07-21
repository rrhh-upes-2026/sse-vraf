import { WorkspaceAccionesCAPA } from "@/components/workspace/sso/WorkspaceAccionesCAPA";
import type { WorkspaceId } from "@/config/nav";

export default async function AccionesCAPAPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAccionesCAPA wsId={wsId as WorkspaceId} />;
}
