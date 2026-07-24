import { IDEVersionManager } from "@/components/workspace/ide/VersionManager";

export default async function IDEVersionesPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Administrador de Versiones</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Consulta el historial de versiones de cada indicador. Las versiones publicadas nunca se sobrescriben.</p>
      </div>
      <IDEVersionManager wsId={wsId} />
    </div>
  );
}
