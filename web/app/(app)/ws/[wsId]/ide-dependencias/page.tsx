import { IDEDependencyConfig } from "@/components/workspace/ide/DependencyConfig";

export default async function IDEDependenciasPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Configuración de Dependencias</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Registra relaciones entre indicadores. Estructura para indicadores derivados — el cálculo se implementará en un sprint posterior.</p>
      </div>
      <IDEDependencyConfig wsId={wsId} />
    </div>
  );
}
