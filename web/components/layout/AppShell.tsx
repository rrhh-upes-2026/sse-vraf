import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { ROLES } from "@/types/roles";
import { Sidebar, type SidebarUser } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/shell/CommandPalette";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const cookieStore  = await cookies();
  const token        = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionUser  = token ? await verifySessionToken(token) : null;

  if (!sessionUser) redirect("/login");

  const roleLabel = ROLES[sessionUser.rol]?.label ?? "Administrador";

  const user: SidebarUser = {
    name:     sessionUser.nombre,
    initials: initialsFromName(sessionUser.nombre),
    role:     roleLabel,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-sse-shell-canvas">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-7 pt-6 pb-[60px]">{children}</main>
        <CommandPalette />
      </div>
    </div>
  );
}
