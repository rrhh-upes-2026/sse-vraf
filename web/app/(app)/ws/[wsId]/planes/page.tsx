import { WorkspacePlanes } from "@/components/workspace/WorkspacePlanes";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspacePlanesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspacePlanes wsId={wsId as WorkspaceId} />;
}
