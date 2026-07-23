import { CargaWizard } from "@/components/workspace/eme/CargaWizard";

export default async function NuevaEvidenciaPage({
  params,
  searchParams,
}: {
  params: Promise<{ wsId: string }>;
  searchParams: Promise<{ executionId?: string }>;
}) {
  const { wsId }        = await params;
  const { executionId } = await searchParams;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Cargar Evidencia</h1>
      <CargaWizard wsId={wsId} executionId={executionId} />
    </div>
  );
}
