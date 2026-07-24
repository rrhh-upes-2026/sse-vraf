import { IDEImportPrep } from "@/components/workspace/ide/ImportPrep";

export default async function IDEImportacionPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Preparación de Importación</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Valida indicadores desde Excel, CSV o JSON antes de importarlos. La inserción masiva se habilitará en el Sprint 017.</p>
      </div>
      <IDEImportPrep wsId={wsId} />
    </div>
  );
}
