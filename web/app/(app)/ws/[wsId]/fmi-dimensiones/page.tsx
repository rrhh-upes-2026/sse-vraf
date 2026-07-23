import { FMIDimensions } from "@/components/workspace/fmi/Dimensions";

export default async function FMIDimensionesPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Dimensiones</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Catálogo de dimensiones de evaluación institucional.</p>
      </div>
      <FMIDimensions wsId={wsId} />
    </div>
  );
}
