import { ActividadWizard } from "@/components/workspace/pme/ActividadWizard/ActividadWizard";

export default async function NuevaActividadPage({
  params,
  searchParams,
}: {
  params: Promise<{ wsId: string }>;
  searchParams: Promise<{ procesoId?: string; procedimientoId?: string }>;
}) {
  const { wsId }                         = await params;
  const { procesoId, procedimientoId }   = await searchParams;
  return (
    <ActividadWizard
      wsId={wsId}
      defaultProcesoId={procesoId}
      defaultProcedimientoId={procedimientoId}
    />
  );
}
