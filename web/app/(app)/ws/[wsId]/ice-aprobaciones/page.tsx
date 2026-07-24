import { ApprovalFlow } from "@/components/workspace/ice/ApprovalFlow";

export default async function ICEAprobacionesPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Aprobaciones</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Flujo de revisión: Jefatura → Vicerrectoría → Cierre. Aprueba o rechaza capturas enviadas.</p>
      </div>
      <ApprovalFlow wsId={wsId} />
    </div>
  );
}
