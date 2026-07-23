import { WorkspaceProcesos } from "@/components/workspace/pme/WorkspaceProcesos";

export default async function ProcesosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceProcesos wsId={wsId} />;
}
