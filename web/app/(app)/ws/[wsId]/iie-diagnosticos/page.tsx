import { IIEDiagnostics } from "@/components/workspace/iie/Diagnostics";

export default async function IIEDiagnosticosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Diagnósticos Institucionales</h1>
      <p className="text-[13px] text-sse-muted">
        Evaluación automatizada de entidades institucionales: unidades, procesos, actividades e indicadores. Basada en reglas de conocimiento configurables.
      </p>
      <IIEDiagnostics wsId={wsId} />
    </div>
  );
}
