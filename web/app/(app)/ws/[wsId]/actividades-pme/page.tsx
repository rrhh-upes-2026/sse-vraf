import { WorkspaceActividades } from "@/components/workspace/pme/WorkspaceActividades";

export default async function ActividadesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceActividades wsId={wsId} />;
}
