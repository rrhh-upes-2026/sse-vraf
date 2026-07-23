import { GWPGmail } from "@/components/workspace/gwp/Gmail";

export default async function GWPGmailPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Gmail</h1>
      <p className="text-[13px] text-sse-muted">
        Envío de correos individuales, respuesta a hilos y consulta del log de envíos.
      </p>
      <GWPGmail wsId={wsId} />
    </div>
  );
}
