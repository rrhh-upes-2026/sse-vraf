import { PlanTimeline } from "@/components/workspace/ape/PlanTimeline";

export default async function ApeCronogramaPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Cronograma</h1>
      <PlanTimeline wsId={wsId} />
    </div>
  );
}
