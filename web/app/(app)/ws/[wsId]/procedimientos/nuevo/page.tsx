import { ProcedimientoWizard } from "@/components/workspace/pme/ProcedimientoWizard/ProcedimientoWizard";

export default async function NuevoProcedimientoPage({
  params,
  searchParams,
}: {
  params: Promise<{ wsId: string }>;
  searchParams: Promise<{ procesoId?: string }>;
}) {
  const { wsId }      = await params;
  const { procesoId } = await searchParams;
  return <ProcedimientoWizard wsId={wsId} defaultProcesoId={procesoId} />;
}
