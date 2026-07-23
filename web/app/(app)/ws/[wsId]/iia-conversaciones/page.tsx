import { IIAConversations } from "@/components/workspace/iia/Conversations";

export default async function IIAConversacionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Conversaciones</h1>
      <p className="text-[13px] text-sse-muted">
        Historial de conversaciones con el asistente. Las conversaciones expiran a las 24 horas de su última actividad.
      </p>
      <IIAConversations wsId={wsId} />
    </div>
  );
}
