import { PlanCalendar } from "@/components/workspace/ape/PlanCalendar";

export default async function ApeCalendarioPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Calendario de Planes</h1>
      <PlanCalendar wsId={wsId} />
    </div>
  );
}
