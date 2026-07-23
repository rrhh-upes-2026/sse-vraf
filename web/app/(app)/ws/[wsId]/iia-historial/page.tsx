import { IIAHistory } from "@/components/workspace/iia/History";

export default async function IIAHistorialPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Historial de Uso</h1>
      <p className="text-[13px] text-sse-muted">
        Registro de auditoría de todas las interacciones con Gemini: tokens consumidos, latencia,
        modelo utilizado y resultado de cada consulta.
      </p>
      <IIAHistory wsId={wsId} />
    </div>
  );
}
