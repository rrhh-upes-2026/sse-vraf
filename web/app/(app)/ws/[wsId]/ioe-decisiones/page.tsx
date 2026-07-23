import { IOEDecisions } from "@/components/workspace/ioe/Decisions";

export default async function IOEDecisionesPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Decisiones Institucionales</h1>
      <p className="text-[13px] text-sse-muted">
        Registro cronológico de decisiones tomadas durante la ejecución de planes. Incluye justificación, resultado esperado y trazabilidad de implementación.
      </p>
      <IOEDecisions wsId={wsId} />
    </div>
  );
}
