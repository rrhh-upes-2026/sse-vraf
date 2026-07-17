import { ContenidoProceso } from "@/components/contratacion/ContenidoProceso";

export default async function ProcesoContratacionPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = await params;
  return <ContenidoProceso wsId={wsId} procesoId={id} />;
}
