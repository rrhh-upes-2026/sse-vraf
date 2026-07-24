import { AuditTrailView } from "@/components/workspace/ice/AuditTrailView";

export default async function ICEAuditoriaPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Auditoría ICE</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Registro completo de todas las acciones: crear, editar, aprobar, rechazar, reabrir, bloquear.</p>
      </div>
      <AuditTrailView wsId={wsId} />
    </div>
  );
}
