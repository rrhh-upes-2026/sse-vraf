import { IIEConfiguration } from "@/components/workspace/iie/Configuration";

export default async function IIEConfiguracionPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Configuración del Motor IIE</h1>
      <p className="text-[13px] text-sse-muted">
        Ajuste de parámetros del motor de inteligencia y gestión de reglas de conocimiento. Los cambios se aplican al siguiente ciclo de análisis.
      </p>
      <IIEConfiguration wsId={wsId} />
    </div>
  );
}
