import { FMIObjectives } from "@/components/workspace/fmi/Objectives";

export default async function FMIObjetivosPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Objetivos Institucionales</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Catálogo de objetivos estratégicos de la institución.</p>
      </div>
      <FMIObjectives wsId={wsId} />
    </div>
  );
}
