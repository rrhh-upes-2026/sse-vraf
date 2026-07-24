import { IDEIndicatorList } from "@/components/workspace/ide/IndicatorList";

export default async function IDEListadoPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Indicadores Institucionales</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Listado de todos los indicadores definidos en el motor IDE.</p>
      </div>
      <IDEIndicatorList wsId={wsId} />
    </div>
  );
}
