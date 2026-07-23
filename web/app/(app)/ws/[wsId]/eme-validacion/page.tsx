import { ValidacionPanel } from "@/components/workspace/eme/ValidacionPanel";

export default async function EMEValidacionPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Validación de Evidencias</h1>
      <p className="text-[13px] text-sse-muted">
        Evidencias en estado &quot;En validación&quot; pendientes de revisión.
      </p>
      <ValidacionPanel wsId={wsId} />
    </div>
  );
}
