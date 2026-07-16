import { WorkflowRunner } from "@/components/workflow/WorkflowRunner";

export default async function WorkflowInstancePage({
  params,
}: {
  params: Promise<{ wsId: string; instanceId: string }>;
}) {
  const { instanceId } = await params;
  return <WorkflowRunner instanceId={instanceId} />;
}
