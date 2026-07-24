import { IDEIndicatorSimulator } from "@/components/workspace/ide/IndicatorSimulator";

export default async function IDESimuladorPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Simulador de Indicadores</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Ingresa valores de ejemplo para calcular el resultado, nivel del semáforo e interpretación. Ningún dato se guarda.</p>
      </div>
      <IDEIndicatorSimulator wsId={wsId} />
    </div>
  );
}
