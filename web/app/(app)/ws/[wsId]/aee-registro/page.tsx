import { EjecucionHistorial } from "@/components/workspace/aee/EjecucionHistorial";

export default async function AEERegistroPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Registro de Ejecuciones</h1>
      <EjecucionHistorial wsId={wsId} />
    </div>
  );
}
