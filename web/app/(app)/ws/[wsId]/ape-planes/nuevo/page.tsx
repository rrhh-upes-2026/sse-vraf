import { PlanGenerator } from "@/components/workspace/ape/PlanGenerator";

export default async function NuevoPlanPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <PlanGenerator wsId={wsId} />;
}
