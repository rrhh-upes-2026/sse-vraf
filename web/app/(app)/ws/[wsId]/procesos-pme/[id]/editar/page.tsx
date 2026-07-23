import { ProcesoEditForm } from "@/components/workspace/pme/ProcesoEditForm";

export default async function EditarProcesoPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = await params;
  return <ProcesoEditForm wsId={wsId} procesoId={id} />;
}
