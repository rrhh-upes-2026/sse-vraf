import { GWPOAuth } from "@/components/workspace/gwp/OAuth";

export default async function GWPOAuthPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Google OAuth 2.0</h1>
      <p className="text-[13px] text-sse-muted">
        Gestión del ciclo de vida del token: autorización, renovación y revocación.
      </p>
      <GWPOAuth wsId={wsId} />
    </div>
  );
}
