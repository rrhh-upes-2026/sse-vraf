import { WorkspaceFMI } from "@/components/workspace/WorkspaceFMI";

export default async function FMIFrameworkPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <WorkspaceFMI wsId={wsId} />;
}
