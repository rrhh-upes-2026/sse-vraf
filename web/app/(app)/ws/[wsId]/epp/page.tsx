import { WorkspaceEPP } from "@/components/workspace/sso/WorkspaceEPP";
import type { WorkspaceId } from "@/config/nav";

export default async function EPPPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceEPP wsId={wsId as WorkspaceId} />;
}
