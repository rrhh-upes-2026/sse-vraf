import { ISPSessions } from "@/components/workspace/isp/Sessions";

export default async function ISPSesionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Sesiones ISP</h1>
      <p className="text-[13px] text-sse-muted">
        Sesiones activas y históricas. Detecta sesiones múltiples y cierra sesiones individuales o masivas por usuario.
      </p>
      <ISPSessions wsId={wsId} />
    </div>
  );
}
