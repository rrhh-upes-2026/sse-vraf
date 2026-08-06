import { Sidebar, type SidebarUser } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/shell/CommandPalette";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "U";
}

// BYPASS_AUTH: acceso directo sin login mientras se configura el backend.
// Restaurar el bloque original cuando el backend esté listo.
const BYPASS_USER = {
  usuarioId: "usr-admin-vraf-001",
  nombre: "Administrador VRAF",
  name: "Administrador VRAF",
  email: "rrhh@upes.edu.sv",
  rol: "ADMINISTRADOR_UNIDAD" as import("@/types/roles").RoleCode,
  unidadId: "vraf" as const,
  mustChangePassword: false,
};

export async function AppShell({ children }: { children: React.ReactNode }) {
  const sessionUser = BYPASS_USER;

  const isAdmin =
    sessionUser.rol === "ADMINISTRADOR_GENERAL" ||
    sessionUser.rol === "ADMINISTRADOR_UNIDAD";

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
