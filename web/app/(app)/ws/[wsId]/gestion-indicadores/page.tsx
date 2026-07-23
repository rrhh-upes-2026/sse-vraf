import { WorkspaceGestionIndicadores } from "@/components/workspace/ime/WorkspaceGestionIndicadores";

export default async function GestionIndicadoresPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceGestionIndicadores wsId={wsId} />;
}
