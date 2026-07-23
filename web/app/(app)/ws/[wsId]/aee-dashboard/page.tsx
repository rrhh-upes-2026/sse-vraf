import { WorkspaceAEE } from "@/components/workspace/WorkspaceAEE";

export default async function AEEDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceAEE wsId={wsId} />;
}
