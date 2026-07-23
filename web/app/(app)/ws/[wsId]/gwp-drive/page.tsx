import { GWPDrive } from "@/components/workspace/gwp/Drive";

export default async function GWPDrivePage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Google Drive</h1>
      <p className="text-[13px] text-sse-muted">
        Gestión de archivos y carpetas: subida, compartir, mover, versiones y metadatos.
      </p>
      <GWPDrive wsId={wsId} />
    </div>
  );
}
