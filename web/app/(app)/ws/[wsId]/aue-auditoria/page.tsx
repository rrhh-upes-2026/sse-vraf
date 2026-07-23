import { AUEAudit } from "@/components/workspace/aue/Audit";

export default async function AUEAuditoriaPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Auditoría del Motor</h1>
      <p className="text-[13px] text-sse-muted">
        Trazabilidad completa de eventos y ejecuciones. Cada acción automática queda registrada con su origen, regla aplicada, resultado y tiempo.
      </p>
      <AUEAudit wsId={wsId} />
    </div>
  );
}
