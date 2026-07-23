import { AUEEvents } from "@/components/workspace/aue/Events";

export default async function AUEEventosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Eventos Institucionales</h1>
      <p className="text-[13px] text-sse-muted">
        Registro de todos los eventos generados por los motores del ecosistema. Cada evento puede activar reglas de automatización.
      </p>
      <AUEEvents wsId={wsId} />
    </div>
  );
}
