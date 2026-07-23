import { EvidenciaDetail } from "@/components/workspace/eme/EvidenciaDetail";

export default async function EMEEvidenciaPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = await params;
  return <EvidenciaDetail wsId={wsId} id={id} />;
}
