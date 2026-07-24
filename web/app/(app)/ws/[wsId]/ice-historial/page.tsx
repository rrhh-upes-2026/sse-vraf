import { CaptureHistory } from "@/components/workspace/ice/CaptureHistory";

export default async function ICEHistorialPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Historial de Capturas</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Todas las capturas de indicadores con filtros por estado y período.</p>
      </div>
      <CaptureHistory wsId={wsId} />
    </div>
  );
}
