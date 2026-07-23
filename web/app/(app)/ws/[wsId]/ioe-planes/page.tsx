import { IOEPlans } from "@/components/workspace/ioe/Plans";

export default async function IOEPlanesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Planes de Acción</h1>
      <p className="text-[13px] text-sse-muted">
        Gestión de planes institucionales generados desde diagnósticos IIE, brechas CPE y alertas EIP. Seguimiento de progreso y cierre con verificación.
      </p>
      <IOEPlans wsId={wsId} />
    </div>
  );
}
