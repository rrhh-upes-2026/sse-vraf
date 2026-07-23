import { WorkspaceNCE } from "@/components/workspace/WorkspaceNCE";

export default async function NCEDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Dashboard NCE</h1>
      <p className="text-[13px] text-sse-muted">
        Estado del motor de notificaciones: volumen, canales, tasa de lectura y actividad reciente.
      </p>
      <WorkspaceNCE wsId={wsId} />
    </div>
  );
}
