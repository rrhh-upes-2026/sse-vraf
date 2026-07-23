import { ISPAudit } from "@/components/workspace/isp/Audit";

export default async function ISPAuditoriaPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Auditoría ISP</h1>
      <p className="text-[13px] text-sse-muted">
        Registro inmutable de todos los eventos de seguridad: accesos, fallos, cambios de rol y permisos. Solo lectura.
      </p>
      <ISPAudit wsId={wsId} />
    </div>
  );
}
