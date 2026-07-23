import { IOETasks } from "@/components/workspace/ioe/Tasks";

export default async function IOETareasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Tareas</h1>
      <p className="text-[13px] text-sse-muted">
        Tareas operativas asignadas por responsable. Control de progreso, detección de bloqueos por dependencias y alertas de vencimiento.
      </p>
      <IOETasks wsId={wsId} />
    </div>
  );
}
