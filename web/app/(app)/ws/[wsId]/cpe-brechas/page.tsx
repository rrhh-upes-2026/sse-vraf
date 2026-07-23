import { BrechasPanel } from "@/components/workspace/cpe/BrechasPanel";

export default async function CPEBrechasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Detección de Brechas</h1>
      <p className="text-[13px] text-sse-muted">
        Incumplimientos detectados automáticamente en actividades, evidencias, indicadores y procesos.
      </p>
      <BrechasPanel wsId={wsId} />
    </div>
  );
}
