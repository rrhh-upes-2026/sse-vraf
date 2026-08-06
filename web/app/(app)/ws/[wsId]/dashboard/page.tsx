import { UnidadDashboard } from '@/components/monitoring/UnidadDashboard';
import { getUnidad } from '@/types/unidad';

export default async function Page({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  const unidad = getUnidad(wsId);
  return (
    <div className="space-y-0">
      <div className="border-b px-7 py-4" style={{ borderLeftColor: unidad?.color, borderLeftWidth: 3 }}>
        <h1 className="text-[18px] font-semibold text-sse-ink">{unidad?.nombre ?? wsId.toUpperCase()}</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">Dashboard estratégico · {unidad?.codigo}</p>
      </div>
      <div className="px-7 pt-6">
        <UnidadDashboard wsId={wsId} />
      </div>
    </div>
  );
}
