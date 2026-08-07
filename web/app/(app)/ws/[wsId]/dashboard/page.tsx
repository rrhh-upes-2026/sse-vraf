import { UnidadDashboard } from '@/components/monitoring/UnidadDashboard';

export default async function Page({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <UnidadDashboard wsId={wsId} />;
}
