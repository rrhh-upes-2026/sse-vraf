import { Sidebar, type SidebarUser } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/shell/CommandPalette";

const BYPASS_USER: SidebarUser = {
  name: "SSE-VRAF",
  initials: "SS",
  role: "Administrador General",
};

export async function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-sse-shell-canvas">
      <Sidebar user={BYPASS_USER} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-7 pt-6 pb-[60px]">{children}</main>
        <CommandPalette />
      </div>
    </div>
  );
}
