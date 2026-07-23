import { FMIFrequencies } from "@/components/workspace/fmi/Frequencies";

export default async function FMIFrecuenciasPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Frecuencias</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Catálogo de frecuencias de medición y reporte de indicadores.</p>
      </div>
      <FMIFrequencies wsId={wsId} />
    </div>
  );
}
