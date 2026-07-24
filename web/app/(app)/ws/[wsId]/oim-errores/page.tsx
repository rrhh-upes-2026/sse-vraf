import { ConflictReport } from "@/components/workspace/oim/ConflictReport";

export default async function OIMErroresPage({ params: _ }: { params: Promise<{ wsId: string }> }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Conflictos y Errores</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">
          Indicadores no importados por falta de catálogo FMI o duplicados detectados. Regla OIM: nunca auto-crear, siempre registrar.
        </p>
      </div>
      <ConflictReport />
    </div>
  );
}
