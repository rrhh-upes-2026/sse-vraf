import { WorkspaceCalendar } from "@/components/workspace/WorkspaceCalendar";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceCalendarioPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceCalendar wsId={wsId as WorkspaceId} />;
}
