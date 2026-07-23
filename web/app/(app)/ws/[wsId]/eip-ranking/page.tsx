import { Ranking } from "@/components/workspace/eip/Ranking";

export default async function EIPRankingPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Rankings Institucionales</h1>
      <p className="text-[13px] text-sse-muted">
        Clasificación por nivel de desempeño de unidades, procesos, indicadores y responsables.
      </p>
      <Ranking />
    </div>
  );
}
