import { WorkspaceEvidence } from "@/components/workspace/WorkspaceEvidence";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceEvidenciasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceEvidence wsId={wsId as WorkspaceId} />;
}
