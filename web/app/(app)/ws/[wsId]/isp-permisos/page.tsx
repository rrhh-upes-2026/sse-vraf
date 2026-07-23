import { ISPPermissions } from "@/components/workspace/isp/Permissions";

export default async function ISPPermisosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Permisos ISP</h1>
      <p className="text-[13px] text-sse-muted">
        Matriz de permisos por módulo y acción. Vista de lista o matriz cruzada de roles para auditar el acceso.
      </p>
      <ISPPermissions wsId={wsId} />
    </div>
  );
}
