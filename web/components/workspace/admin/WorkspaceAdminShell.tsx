"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/permissions";

interface AdminSection {
  id: string;
  label: string;
  icon: string;
  permission: Permission;
}

const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: "",
    label: "Resumen",
    icon: "M4 6h16M4 10h16M4 14h10",
    permission: "ws.admin.access",
  },
  {
    id: "procesos",
    label: "Procesos",
    icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7",
    permission: "ws.processes.manage",
  },
  {
    id: "indicadores",
    label: "Indicadores",
    icon: "M4 20a8 8 0 1 1 16 0M12 14l4-4",
    permission: "ws.indicators.manage",
  },
  {
    id: "solicitudes",
    label: "Catálogo de Solicitudes",
    icon: "M4 13h4l2 3h4l2-3h4M5 5h14v13H5z",
    permission: "ws.requests.manage",
  },
  {
    id: "automatizaciones",
    label: "Automatizaciones",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    permission: "ws.automations.manage",
  },
  {
    id: "usuarios",
    label: "Usuarios",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    permission: "ws.users.manage",
  },
  {
    id: "config",
    label: "Configuración",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
    permission: "ws.settings.manage",
  },
];

interface WorkspaceAdminShellProps {
  wsId: WorkspaceId;
  children: React.ReactNode;
}

export function WorkspaceAdminShell({ wsId, children }: WorkspaceAdminShellProps) {
  const pathname = usePathname();
  const { hasPermission, isLoaded } = usePermissions();

  if (isLoaded && !hasPermission("ws.admin.access")) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-10 h-10 text-sse-muted mx-auto mb-3">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-[15px] font-semibold text-sse-ink">Acceso restringido</p>
          <p className="text-[13px] text-sse-muted mt-1">No tienes permisos para acceder al área de administración.</p>
        </div>
      </div>
    );
  }

  const visibleSections = ADMIN_SECTIONS.filter(
    (s) => !isLoaded || hasPermission(s.permission)
  );

  return (
    <div className="flex gap-0 min-h-0">
      {/* Admin sidebar */}
      <aside className="w-52 shrink-0 border-r border-sse-border bg-sse-canvas pr-0 pt-1">
        <div className="px-3 mb-3">
          <div className="flex items-center gap-2 px-2 py-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
              className="w-4 h-4 text-sse-primary shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span className="text-[12px] font-semibold text-sse-ink uppercase tracking-wide">Administración</span>
          </div>
        </div>

        <nav className="space-y-0.5 px-2">
          {visibleSections.map((section) => {
            const href = `/ws/${wsId}/admin${section.id ? `/${section.id}` : ""}`;
            const isActive = section.id === ""
              ? pathname === `/ws/${wsId}/admin`
              : pathname.startsWith(`/ws/${wsId}/admin/${section.id}`);

            return (
              <Link
                key={section.id}
                href={href}
                className={
                  "flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] transition-colors " +
                  (isActive
                    ? "bg-sse-primary/10 text-sse-primary font-medium"
                    : "text-sse-ink hover:bg-sse-hover hover:text-sse-ink")
                }
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                  className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
                </svg>
                {section.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 px-6 py-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
