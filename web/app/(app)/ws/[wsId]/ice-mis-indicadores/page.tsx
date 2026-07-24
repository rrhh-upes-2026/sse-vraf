import { MisIndicadores } from "@/components/workspace/ice/MisIndicadores";

export default async function ICEMisIndicadoresPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Mis Indicadores</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Indicadores asignados en el período activo y estado de sus capturas.</p>
      </div>
      <MisIndicadores wsId={wsId} />
    </div>
  );
}
