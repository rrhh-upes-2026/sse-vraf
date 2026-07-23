import { NCETemplates } from "@/components/workspace/nce/Templates";

export default async function NCEPlantillasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Plantillas de Notificación</h1>
      <p className="text-[13px] text-sse-muted">
        8 tipos de plantilla con sustitución {"{{variable}}"}. Sin eval(), sin código dinámico. Versionado automático al modificar asunto o cuerpo.
      </p>
      <NCETemplates wsId={wsId} />
    </div>
  );
}
