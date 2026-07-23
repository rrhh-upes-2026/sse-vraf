import { AUEExecutions } from "@/components/workspace/aue/Executions";

export default async function AUEEjecucionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Historial de Ejecuciones</h1>
      <p className="text-[13px] text-sse-muted">
        Registro completo de cada ejecución de regla: evento origen, resultado, duración y logs detallados.
      </p>
      <AUEExecutions wsId={wsId} />
    </div>
  );
}
