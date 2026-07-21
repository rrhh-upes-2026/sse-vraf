import { WorkspaceMatrizRiesgos } from "@/components/workspace/sso/WorkspaceMatrizRiesgos";
import type { WorkspaceId } from "@/config/nav";

export default async function MatrizRiesgosPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceMatrizRiesgos wsId={wsId as WorkspaceId} />;
}
