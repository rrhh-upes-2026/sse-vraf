import { ActividadDetail } from "@/components/workspace/pme/ActividadDetail";

export default async function ActividadDetailPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = await params;
  return <ActividadDetail wsId={wsId} actividadId={id} />;
}
