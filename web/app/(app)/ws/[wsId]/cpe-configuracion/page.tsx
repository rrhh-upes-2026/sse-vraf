import { ConfigPanel } from "@/components/workspace/cpe/ConfigPanel";

export default async function CPEConfiguracionPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Configuración</h1>
      <p className="text-[13px] text-sse-muted">
        Ajuste los pesos de cumplimiento, umbrales del semáforo y consulte el historial de cálculos.
      </p>
      <ConfigPanel wsId={wsId} />
    </div>
  );
}
