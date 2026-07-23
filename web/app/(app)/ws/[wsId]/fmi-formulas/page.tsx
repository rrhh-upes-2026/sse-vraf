import { FMIFormulas } from "@/components/workspace/fmi/Formulas";

export default async function FMIFormulasPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Motor de Fórmulas</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Catálogo de fórmulas de cálculo con variables para indicadores institucionales.</p>
      </div>
      <FMIFormulas wsId={wsId} />
    </div>
  );
}
