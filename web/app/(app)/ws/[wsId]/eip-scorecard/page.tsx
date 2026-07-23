import { Scorecard } from "@/components/workspace/eip/Scorecard";

export default async function EIPScorecardPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Balanced Scorecard</h1>
      <p className="text-[13px] text-sse-muted">
        Indicadores estratégicos agrupados por perspectiva BSC: financiera, procesos internos, aprendizaje y clientes.
      </p>
      <Scorecard />
    </div>
  );
}
