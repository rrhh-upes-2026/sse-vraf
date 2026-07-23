import { ComparativeAnalytics } from "@/components/workspace/eip/ComparativeAnalytics";

export default async function EIPComparativoPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Analítica Comparativa</h1>
      <p className="text-[13px] text-sse-muted">
        Comparaciones período a período, año a año y entre unidades, procesos e indicadores para identificar mejoras y retrocesos.
      </p>
      <ComparativeAnalytics />
    </div>
  );
}
