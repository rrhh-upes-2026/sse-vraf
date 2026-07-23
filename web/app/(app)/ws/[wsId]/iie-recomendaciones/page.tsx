import { IIERecommendations } from "@/components/workspace/iie/Recommendations";

export default async function IIERecomendacionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Recomendaciones Prioritarias</h1>
      <p className="text-[13px] text-sse-muted">
        Acciones correctivas y de mejora generadas por el motor de reglas: priorizadas por impacto, urgencia y nivel de confianza.
      </p>
      <IIERecommendations wsId={wsId} />
    </div>
  );
}
