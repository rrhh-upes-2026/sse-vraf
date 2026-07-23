import { IndicatorWizard } from "@/components/workspace/ime/IndicatorWizard/IndicatorWizard";

export default async function NuevoIndicadorPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <IndicatorWizard wsId={wsId} />;
}
