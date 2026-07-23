import { PlanDetail } from "@/components/workspace/ape/PlanDetail";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = await params;
  return <PlanDetail wsId={wsId} id={id} />;
}
