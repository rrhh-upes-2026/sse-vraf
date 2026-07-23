import { IIENarratives } from "@/components/workspace/iie/Narratives";

export default async function IIENarrativasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Narrativas Ejecutivas</h1>
      <p className="text-[13px] text-sse-muted">
        Informes narrativos generados automáticamente por el motor de plantillas: resumen ejecutivo, hallazgos clave, diagnóstico institucional y proyección estratégica.
      </p>
      <IIENarratives wsId={wsId} />
    </div>
  );
}
