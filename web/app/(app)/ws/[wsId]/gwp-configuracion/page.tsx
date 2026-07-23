import { GWPConfig } from "@/components/workspace/gwp/Config";

export default async function GWPConfiguracionPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Configuración GWP</h1>
      <p className="text-[13px] text-sse-muted">
        Credenciales OAuth 2.0, dominio Workspace y scopes autorizados para la integración con Google.
      </p>
      <GWPConfig wsId={wsId} />
    </div>
  );
}
