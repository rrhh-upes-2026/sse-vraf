import { ISPRoles } from "@/components/workspace/isp/Roles";

export default async function ISPRolesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Roles ISP</h1>
      <p className="text-[13px] text-sse-muted">
        Definición de roles del sistema y asignación de permisos por módulo y acción. Los roles de sistema no pueden eliminarse.
      </p>
      <ISPRoles wsId={wsId} />
    </div>
  );
}
