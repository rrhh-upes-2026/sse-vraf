import { CumplimientoTabla } from "@/components/workspace/cpe/CumplimientoTabla";

export default async function CPECumplimientoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Reporte de Cumplimiento</h1>
      <p className="text-[13px] text-sse-muted">
        Historial de snapshots de cumplimiento por periodo. Cada fila representa un cálculo ejecutado.
      </p>
      <CumplimientoTabla wsId={wsId} />
    </div>
  );
}
