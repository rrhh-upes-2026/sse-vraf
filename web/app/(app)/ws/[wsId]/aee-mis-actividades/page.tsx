import { MisActividades } from "@/components/workspace/aee/MisActividades";

export default async function AEEMisActividadesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Mis Actividades</h1>
      <MisActividades wsId={wsId} userId="" />
    </div>
  );
}
