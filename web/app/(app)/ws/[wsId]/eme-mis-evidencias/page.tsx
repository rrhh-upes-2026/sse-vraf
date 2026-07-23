import { MisEvidencias } from "@/components/workspace/eme/MisEvidencias";

export default async function EMEMisEvidenciasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Mis Evidencias</h1>
      <MisEvidencias wsId={wsId} userId="" />
    </div>
  );
}
