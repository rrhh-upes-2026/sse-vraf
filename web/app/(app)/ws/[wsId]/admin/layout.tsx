import { WorkspaceAdminShell } from "@/components/workspace/admin/WorkspaceAdminShell";
import type { WorkspaceId } from "@/config/nav";

export default async function WorkspaceAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <WorkspaceAdminShell wsId={wsId as WorkspaceId}>
      {children}
    </WorkspaceAdminShell>
  );
}
