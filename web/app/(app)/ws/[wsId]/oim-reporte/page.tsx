import { ValidationReport } from "@/components/workspace/oim/ValidationReport";

export default async function OIMReportePage({ params: _ }: { params: Promise<{ wsId: string }> }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Reporte de Validación</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">
          Resultado detallado de la última migración: estado por indicador, catálogos creados, warnings y recomendaciones.
        </p>
      </div>
      <ValidationReport />
    </div>
  );
}
