import { EjecucionDetail } from "@/components/workspace/aee/EjecucionDetail";

export default async function AEEEjecucionPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = await params;
  return <EjecucionDetail wsId={wsId} id={id} />;
}
