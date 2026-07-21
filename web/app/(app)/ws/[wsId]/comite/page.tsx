import { WorkspaceComiteSSO } from "@/components/workspace/sso/WorkspaceComiteSSO";
import type { WorkspaceId } from "@/config/nav";

export default async function ComitePage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceComiteSSO wsId={wsId as WorkspaceId} />;
}
