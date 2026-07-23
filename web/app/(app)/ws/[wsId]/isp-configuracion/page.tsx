import { ISPConfig } from "@/components/workspace/isp/Config";

export default async function ISPConfiguracionPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Configuración ISP</h1>
      <p className="text-[13px] text-sse-muted">
        Parámetros de seguridad: duración de sesión, intentos fallidos, bloqueo de cuentas y preparación para Google OAuth.
      </p>
      <ISPConfig wsId={wsId} />
    </div>
  );
}
