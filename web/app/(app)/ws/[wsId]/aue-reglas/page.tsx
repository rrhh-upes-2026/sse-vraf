import { AUERules } from "@/components/workspace/aue/Rules";

export default async function AUEReglasPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Reglas de Automatización</h1>
      <p className="text-[13px] text-sse-muted">
        Motor de reglas WHEN/IF/THEN. Define qué sucede cuando se produce un evento institucional. Sin código dinámico, sin eval().
      </p>
      <AUERules wsId={wsId} />
    </div>
  );
}
