import { PeriodManager } from "@/components/workspace/ice/PeriodManager";

export default async function ICEPeriodosPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Gestión de Períodos</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Crear y administrar períodos de captura. Controla el ciclo: Borrador → Abierto → En revisión → Cerrado → Bloqueado.</p>
      </div>
      <PeriodManager wsId={wsId} />
    </div>
  );
}
