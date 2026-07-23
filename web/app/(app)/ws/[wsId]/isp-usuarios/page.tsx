import { ISPUsers } from "@/components/workspace/isp/Users";

export default async function ISPUsuariosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Usuarios ISP</h1>
      <p className="text-[13px] text-sse-muted">
        Gestión de usuarios del sistema: crear, asignar roles, cambiar estado y revisar actividad de inicio de sesión.
      </p>
      <ISPUsers wsId={wsId} />
    </div>
  );
}
