import { ProcesoWizard } from "@/components/workspace/pme/ProcesoWizard/ProcesoWizard";

export default async function NuevoProcesoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <ProcesoWizard wsId={wsId} />;
}
