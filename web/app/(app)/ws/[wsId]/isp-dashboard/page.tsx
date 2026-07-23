import { WorkspaceISP } from "@/components/workspace/WorkspaceISP";

export default async function ISPDashboardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Dashboard ISP</h1>
      <p className="text-[13px] text-sse-muted">
        Estado de la plataforma de identidad: usuarios, sesiones activas, intentos fallidos y actividad de auditoría reciente.
      </p>
      <WorkspaceISP wsId={wsId} />
    </div>
  );
}
