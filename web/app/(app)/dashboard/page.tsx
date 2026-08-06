import { DashboardEjecutivo } from '@/components/monitoring/DashboardEjecutivo';

export const metadata = { title: 'Dashboard Ejecutivo — SSE-VRAF' };

export default function DashboardEjecutivoPage() {
  return (
    <div className="space-y-0">
      <div className="border-b px-7 py-4">
        <h1 className="text-[18px] font-semibold text-sse-ink">Dashboard Ejecutivo</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">Monitoreo estratégico institucional — VRAF</p>
      </div>
      <div className="px-7 pt-6">
        <DashboardEjecutivo />
      </div>
    </div>
  );
}
