import { ProcesoDetail } from "@/components/workspace/pme/ProcesoDetail";

export default async function ProcesoDetailPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = await params;
  return <ProcesoDetail wsId={wsId} procesoId={id} />;
}
