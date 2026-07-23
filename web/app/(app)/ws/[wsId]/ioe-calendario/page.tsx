import { IOECalendar } from "@/components/workspace/ioe/Calendar";

export default async function IOECalendarioPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Calendario de Ejecución</h1>
      <p className="text-[13px] text-sse-muted">
        Vista temporal de planes, hitos y tareas. Navegación por mes o semana con filtros por tipo de evento y responsable.
      </p>
      <IOECalendar wsId={wsId} />
    </div>
  );
}
