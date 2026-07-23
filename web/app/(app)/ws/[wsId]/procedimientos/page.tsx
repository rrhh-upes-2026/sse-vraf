import { WorkspaceProcedimientos } from "@/components/workspace/pme/WorkspaceProcedimientos";

export default async function ProcedimientosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceProcedimientos wsId={wsId} />;
}
