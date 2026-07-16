import { WorkspaceShell } from "@/components/layout/WorkspaceShell";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <WorkspaceShell wsId={wsId}>{children}</WorkspaceShell>;
}
