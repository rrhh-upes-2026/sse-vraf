import { WorkspaceEME } from "@/components/workspace/WorkspaceEME";

export default async function EMEDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceEME wsId={wsId} />;
}
