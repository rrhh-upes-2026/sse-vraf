import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { Sidebar, type SidebarUser } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/shell/CommandPalette";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "U";
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionUser = token ? await verifySessionToken(token) : null;

  if (!sessionUser) {
    redirect("/login");
  }

  // Force password change before accessing any (app) page.
  // /change-password lives in (auth) group so AppShell is not called there — no redirect loop.
  if (sessionUser.mustChangePassword) {
    redirect("/change-password");
  }

  const isAdmin = sessionUser.rol === "ADMIN";

  const user: SidebarUser = {
    name: sessionUser.name,
    initials: initialsFromName(sessionUser.name),
    isAdmin,
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
