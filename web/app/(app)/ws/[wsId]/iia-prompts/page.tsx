import { IIAPrompts } from "@/components/workspace/iia/Prompts";

export default async function IIAPromptsPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Plantillas de Prompts</h1>
      <p className="text-[13px] text-sse-muted">
        Gestión de los prompts institucionales que guían el comportamiento del asistente Gemini.
        Cada tipo define el tono y enfoque de las respuestas.
      </p>
      <IIAPrompts wsId={wsId} />
    </div>
  );
}
