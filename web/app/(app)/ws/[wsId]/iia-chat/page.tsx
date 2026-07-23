import { IIAChat } from "@/components/workspace/iia/Chat";

export default async function IIAChatPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Chat IIA</h1>
      <p className="text-[13px] text-sse-muted">
        Consultas en lenguaje natural al asistente institucional impulsado por Gemini.
        Selecciona el tipo de prompt y las fuentes de contexto antes de enviar.
      </p>
      <IIAChat wsId={wsId} />
    </div>
  );
}
