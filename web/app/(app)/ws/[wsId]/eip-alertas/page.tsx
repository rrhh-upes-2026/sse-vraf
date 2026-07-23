import { AlertsPanel } from "@/components/workspace/eip/AlertsPanel";

export default async function EIPAlertasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Alertas Ejecutivas</h1>
      <p className="text-[13px] text-sse-muted">
        Alertas generadas por los motores CPE, EME y APE clasificadas por severidad: crítica, alta, media e informativa.
      </p>
      <AlertsPanel />
    </div>
  );
}
