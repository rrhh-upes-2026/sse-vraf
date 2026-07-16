import { WorkspaceConfig } from "@/components/workspace/WorkspaceConfig";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceConfigPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceConfig wsId={wsId as WorkspaceId} />;
}
