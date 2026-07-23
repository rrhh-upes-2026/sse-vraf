import { FMIRanges } from "@/components/workspace/fmi/Ranges";

export default async function FMIRangosPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Configuración de Rangos</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Motor de rangos por nivel: Excelente, Bueno, Aceptable y Crítico.</p>
      </div>
      <FMIRanges wsId={wsId} />
    </div>
  );
}
