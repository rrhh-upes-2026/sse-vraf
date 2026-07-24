import { CaptureWizard } from "@/components/workspace/ice/CaptureWizard";

export default async function ICECapturarPage({ params, searchParams }: {
  params: Promise<{ wsId: string }>;
  searchParams: Promise<{ captureId?: string }>;
}) {
  const { wsId } = await params;
  const { captureId } = await searchParams;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Capturar Indicador</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Registra las variables del indicador. El sistema calcula el resultado automáticamente.</p>
      </div>
      <div className="max-w-2xl">
        <CaptureWizard wsId={wsId} initialCaptureId={captureId} />
      </div>
    </div>
  );
}
