import { IOEMilestones } from "@/components/workspace/ioe/Milestones";

export default async function IOEHitosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Hitos</h1>
      <p className="text-[13px] text-sse-muted">
        Puntos de control críticos de los planes de acción. Cada hito representa un entregable clave ponderado para medir el avance real del plan.
      </p>
      <IOEMilestones wsId={wsId} />
    </div>
  );
}
