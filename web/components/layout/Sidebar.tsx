"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DEFAULT_WORKSPACE,
  WORKSPACE_SECTIONS,
  isWorkspaceId,
} from "@/config/nav";
import { GlyphIcon } from "@/components/layout/GlyphIcon";
import { WorkspaceSwitcher } from "@/components/layout/WorkspaceSwitcher";

export interface SidebarUser {
  name: string;
  initials: string;
  role?: string;
}

interface SidebarProps {
  user: SidebarUser;
}

function parseWorkspaceSegment(pathname: string) {
  const match = pathname.match(/^\/ws\/([^/]+)\/([^/]+)?/);
  const wsId = match?.[1] && isWorkspaceId(match[1]) ? match[1] : DEFAULT_WORKSPACE;
  const section = match?.[2];
  return { wsId, section };
}

const DASHBOARD_EJECUTIVO = {
  href: "/dashboard",
  label: "Dashboard Ejecutivo",
  icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const { wsId, section } = parseWorkspaceSegment(pathname);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  const dashboardActive = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  return (
    <aside className="flex h-screen w-[262px] flex-none flex-col bg-sse-sidebar-bg text-sse-sidebar-text">
      {/* Brand */}
      <div className="flex items-center gap-[11px] border-b border-white/8 px-4 pt-[18px] pb-[14px]">
        <div
          className="flex size-9 flex-none items-center justify-center rounded-[10px] text-[14px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #2E6BE6, #5B8DEF)" }}
        >
          SS
        </div>
        <div className="leading-[1.15]">
          <div className="text-[14px] font-bold text-white">SSE-VRAF</div>
          <div className="text-[11px] font-medium text-sse-sidebar-text-dim">
            Monitoreo Estratégico
          </div>
        </div>
      </div>

      {/* Nav body */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-[18px]">
        {/* Dashboard Ejecutivo — vista global */}
        <div className="mb-2">
          <Link
            href={DASHBOARD_EJECUTIVO.href}
            className={`flex w-full items-center gap-[11px] rounded-[9px] px-2.5 py-2 text-left text-[12.5px] font-sans ${
              dashboardActive
                ? "bg-[rgba(46,107,230,.20)] font-semibold text-white shadow-[inset_3px_0_0_#5B8DEF]"
                : "font-medium text-sse-sidebar-text"
            }`}
          >
            <GlyphIcon d={DASHBOARD_EJECUTIVO.icon} size={17} />
            <span className="flex-1">{DASHBOARD_EJECUTIVO.label}</span>
          </Link>
        </div>

        {/* Workspace switcher + sections */}
        <WorkspaceSwitcher currentId={wsId} />

        <div className="mt-3.5 flex flex-col gap-0.5">
          {WORKSPACE_SECTIONS.map((s) => {
            const active = section === s.id;
            return (
              <Link
                key={s.id}
                href={`/ws/${wsId}/${s.id}`}
                className={`flex w-full items-center gap-[11px] rounded-[9px] px-2.5 py-2 text-left text-[12.5px] font-sans ${
                  active
                    ? "bg-[rgba(46,107,230,.20)] font-semibold text-white shadow-[inset_3px_0_0_#5B8DEF]"
                    : "font-medium text-sse-sidebar-text"
                }`}
              >
                <GlyphIcon d={s.icon} size={17} />
                <span className="flex-1">{s.label}</span>
                {s.badge ? (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-white/10 px-1.5 text-[10px] font-bold text-sse-sidebar-text">
                    {s.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / profile */}
      <div className="flex items-center gap-2.5 border-t border-white/8 px-3 py-2.5">
        <div className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-sse-primary text-[12px] font-bold text-white">
          {user.initials}
        </div>
        <div className="min-w-0 flex-1 leading-[1.2]">
          <div className="truncate text-[12px] font-semibold text-white">
            {user.name}
          </div>
          <div className="text-[10.5px] text-sse-sidebar-text-dim">
            {user.role ?? "Administrador General"}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex size-[30px] items-center justify-center rounded-[8px] border border-white/12 text-sse-sidebar-icon-muted transition hover:border-white/30 hover:text-white"
        >
          <GlyphIcon
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            size={15}
            strokeWidth={2}
          />
        </button>
      </div>
    </aside>
  );
}
