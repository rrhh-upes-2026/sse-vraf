import { PlanTable } from "@/components/workspace/ape/PlanTable";

export default async function ApePlanesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Planes de Actividades</h1>
      <PlanTable wsId={wsId} />
    </div>
  );
}
