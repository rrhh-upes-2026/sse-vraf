import { IDEIndicatorForm } from "@/components/workspace/ide/IndicatorForm";

export default async function IDECrearPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Nuevo Indicador</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Define un nuevo indicador institucional. Todos los campos pasan por el IndicatorValidator antes de guardarse.</p>
      </div>
      <IDEIndicatorForm wsId={wsId} />
    </div>
  );
}
