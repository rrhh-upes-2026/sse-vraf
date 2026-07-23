import { EvidenciaRepositorio } from "@/components/workspace/eme/EvidenciaRepositorio";
import Link from "next/link";

export default async function EMERepositorioPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-sse-ink">Repositorio de Evidencias</h1>
        <Link
          href={`/ws/${wsId}/eme-carga/nuevo`}
          className="rounded-md bg-sse-primary px-3 py-1.5 text-[13px] font-medium text-white hover:bg-sse-primary/90 transition-colors"
        >
          + Cargar evidencia
        </Link>
      </div>
      <EvidenciaRepositorio wsId={wsId} />
    </div>
  );
}
