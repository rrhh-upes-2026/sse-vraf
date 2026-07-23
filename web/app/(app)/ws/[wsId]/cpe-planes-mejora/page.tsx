import { PlanMejoraList } from "@/components/workspace/cpe/PlanMejoraList";

export default async function CPEPlanesMejoraPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Planes de Mejora</h1>
      <p className="text-[13px] text-sse-muted">
        Planes de acción correctiva derivados de brechas de cumplimiento detectadas.
      </p>
      <PlanMejoraList wsId={wsId} />
    </div>
  );
}
