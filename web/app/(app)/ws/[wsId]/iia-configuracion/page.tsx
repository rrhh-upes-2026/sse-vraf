import { IIAConfig } from "@/components/workspace/iia/Config";

export default async function IIAConfiguracionPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Configuración IIA</h1>
      <p className="text-[13px] text-sse-muted">
        Parámetros de Gemini: clave API, modelo, temperatura, límites de tokens y opciones de depuración.
        La clave API se almacena obfuscada y nunca se devuelve al cliente.
      </p>
      <IIAConfig wsId={wsId} />
    </div>
  );
}
