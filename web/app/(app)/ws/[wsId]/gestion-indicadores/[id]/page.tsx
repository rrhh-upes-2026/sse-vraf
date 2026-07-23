import { IndicatorDetail } from "@/components/workspace/ime/IndicatorDetail";

export default async function IndicadorDetailPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = await params;
  return <IndicatorDetail wsId={wsId} indicadorId={id} />;
}
