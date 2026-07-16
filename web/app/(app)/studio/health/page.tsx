import { RuntimeHealthDashboard } from "@/components/studio/RuntimeHealthDashboard";

export default function RuntimeHealthPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Runtime Health</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">
          Salud operativa de la plataforma — instancias, blueprints y métricas de ejecución.
        </p>
      </div>
      <RuntimeHealthDashboard />
    </div>
  );
}
