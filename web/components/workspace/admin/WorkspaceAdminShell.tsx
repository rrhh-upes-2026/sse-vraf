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
    id: "formularios",
    label: "Formularios",
    icon: "M8 3h6l4 4v14H6V5a2 2 0 012-2zM14 3v4h4M9 13h6M9 9h2",
    permission: "ws.forms.manage",
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    permission: "ws.documents.manage",
  },
  {
    id: "notificaciones",
    label: "Notificaciones",
    icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
    permission: "ws.automations.manage",
  },
  {
    id: "builders",
    label: "Constructores",
    icon: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z",
    permission: "studio.access",
  },
  {
    id: "system",
    label: "Salud del Sistema",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    permission: "ws.settings.manage",
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
