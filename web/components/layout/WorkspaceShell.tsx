import { notFound } from "next/navigation";
import { getWorkspace, type WorkspaceId } from "@/config/nav";

interface WorkspaceShellProps {
  wsId: string;
  children: React.ReactNode;
}

/**
 * Validates the [wsId] route param against the 6 official units before
 * rendering a workspace section. The Sidebar/Topbar derive their own
 * highlight/breadcrumb state from the URL independently — this layout's
 * job is purely to 404 on an unknown unit rather than let every page
 * re-implement that check.
 */
export function WorkspaceShell({ wsId, children }: WorkspaceShellProps) {
  const unit = getWorkspace(wsId);
  if (!unit) notFound();

  return <>{children}</>;
}

export type { WorkspaceId };
