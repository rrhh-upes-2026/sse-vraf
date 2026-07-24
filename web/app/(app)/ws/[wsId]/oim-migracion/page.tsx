import { MigrationPanel } from "@/components/workspace/oim/MigrationPanel";

export default async function OIMMigracionPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Panel de Importación</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">
          Ejecuta la migración oficial de los 10 indicadores VRAF. Cada fila pasa por IndicatorValidator, DuplicateDetector y VersionManager.
        </p>
      </div>
      <MigrationPanel wsId={wsId} />
    </div>
  );
}
