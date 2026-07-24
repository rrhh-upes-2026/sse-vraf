import { ImportHistory } from "@/components/workspace/oim/ImportHistory";

export default async function OIMHistorialPage({ params: _ }: { params: Promise<{ wsId: string }> }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Historial de Importaciones</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">
          Registro de todas las ejecuciones OIM con sus resultados. Expandir cada entrada para ver el reporte completo.
        </p>
      </div>
      <ImportHistory />
    </div>
  );
}
