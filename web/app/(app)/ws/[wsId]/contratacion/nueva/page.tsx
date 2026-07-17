import { NuevoProceso } from "@/components/contratacion/NuevoProceso";

export default async function NuevoProcesoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <NuevoProceso wsId={wsId} />;
}
