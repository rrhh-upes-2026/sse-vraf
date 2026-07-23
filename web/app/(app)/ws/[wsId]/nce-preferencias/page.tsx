import { NCEPreferences } from "@/components/workspace/nce/Preferences";

export default async function NCEPreferenciasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Preferencias de Notificación</h1>
      <p className="text-[13px] text-sse-muted">
        Configura los canales, tipos de alerta que recibes, horario de silencio y frecuencia de digest.
      </p>
      <NCEPreferences wsId={wsId} />
    </div>
  );
}
