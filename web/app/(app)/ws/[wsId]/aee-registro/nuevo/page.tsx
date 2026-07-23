import { RegistroEjecucionWizard } from "@/components/workspace/aee/RegistroEjecucionWizard";

export default async function NuevaEjecucionPage({
  params,
  searchParams,
}: {
  params: Promise<{ wsId: string }>;
  searchParams: Promise<{ planId?: string }>;
}) {
  const { wsId }  = await params;
  const { planId } = await searchParams;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Registrar Ejecución</h1>
      <RegistroEjecucionWizard wsId={wsId} planId={planId} />
    </div>
  );
}
