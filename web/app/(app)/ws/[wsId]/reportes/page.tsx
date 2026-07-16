import { WorkspaceReports } from "@/components/workspace/WorkspaceReports";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceReportesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceReports wsId={wsId as WorkspaceId} />;
}
