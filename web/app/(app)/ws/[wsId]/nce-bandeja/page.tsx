import { NCEInbox } from "@/components/workspace/nce/Inbox";

export default async function NCEBandejaPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Bandeja Institucional</h1>
      <p className="text-[13px] text-sse-muted">
        Notificaciones institucionales filtradas por estado, canal y prioridad. Marcar leídas y archivar desde aquí.
      </p>
      <NCEInbox wsId={wsId} />
    </div>
  );
}
