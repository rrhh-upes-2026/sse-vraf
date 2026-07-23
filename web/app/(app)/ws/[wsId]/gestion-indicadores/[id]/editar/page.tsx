import { IndicatorEditForm } from "@/components/workspace/ime/IndicatorEditForm";

export default async function EditarIndicadorPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = await params;
  return <IndicatorEditForm wsId={wsId} indicadorId={id} />;
}
