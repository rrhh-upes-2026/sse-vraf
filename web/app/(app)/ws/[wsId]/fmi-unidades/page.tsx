import { FMIUnitMeasures } from "@/components/workspace/fmi/UnitMeasures";

export default async function FMIUnidadesPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Unidades de Medida</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Catálogo de unidades de medida compatibles con gestión universitaria.</p>
      </div>
      <FMIUnitMeasures wsId={wsId} />
    </div>
  );
}
