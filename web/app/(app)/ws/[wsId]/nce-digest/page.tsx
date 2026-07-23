import { NCEDigest } from "@/components/workspace/nce/Digest";

export default async function NCEDigestPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Digest Periódico</h1>
      <p className="text-[13px] text-sse-muted">
        Resúmenes diarios, semanales o quincenales de actividad de notificaciones. Generación manual o automática vía preferencias.
      </p>
      <NCEDigest wsId={wsId} />
    </div>
  );
}
