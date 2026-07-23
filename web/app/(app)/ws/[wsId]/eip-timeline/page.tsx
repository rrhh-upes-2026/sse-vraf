import { Timeline } from "@/components/workspace/eip/Timeline";

export default async function EIPTimelinePage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Cronología Institucional</h1>
      <p className="text-[13px] text-sse-muted">
        Línea de tiempo consolidada de eventos de planificación, ejecución, evidencias, incumplimientos y planes de mejora.
      </p>
      <Timeline />
    </div>
  );
}
