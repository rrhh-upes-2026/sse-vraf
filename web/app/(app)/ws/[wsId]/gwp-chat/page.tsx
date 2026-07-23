import { GWPChat } from "@/components/workspace/gwp/Chat";

export default async function GWPChatPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Google Chat</h1>
      <p className="text-[13px] text-sse-muted">
        Envío de mensajes de texto y tarjetas interactivas (cardsV2) a espacios de Google Chat.
      </p>
      <GWPChat wsId={wsId} />
    </div>
  );
}
