import { WorkspaceIDE } from "@/components/workspace/WorkspaceIDE";

export default async function IDEDashboardPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <WorkspaceIDE wsId={wsId} />;
}
