import { AUEQueue } from "@/components/workspace/aue/Queue";

export default async function AUEColaPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Cola de Ejecución</h1>
      <p className="text-[13px] text-sse-muted">
        Cola FIFO de ejecuciones pendientes, en proceso y fallidas. Control de reintentos configurable por ejecución.
      </p>
      <AUEQueue wsId={wsId} />
    </div>
  );
}
