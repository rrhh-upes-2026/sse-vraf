import { WorkspaceAuditoriasSSO } from "@/components/workspace/sso/WorkspaceAuditoriasSSO";
import type { WorkspaceId } from "@/config/nav";

export default async function AuditoriasSSOPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAuditoriasSSO wsId={wsId as WorkspaceId} />;
}
