"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DEFAULT_WORKSPACE,
  MY_WORK_ICON,
  ADMIN_NAV_ITEMS,
  WORKSPACE_SECTIONS,
  ORG_WORKSPACE_IDS,
  isWorkspaceId,
} from "@/config/nav";
import { moduleRegistry } from "@/lib/sdk/registry";
import { GlyphIcon } from "@/components/layout/GlyphIcon";
import { WorkspaceSwitcher } from "@/components/layout/WorkspaceSwitcher";
import { useRoleStore } from "@/store/useRoleStore";
import { demoRoleLabel } from "@/types/roles";

export interface SidebarUser {
  name: string;
  initials: string;
  isAdmin?: boolean;
}

interface SidebarProps {
  user: SidebarUser;
  myWorkBadge?: number;
}

function parseWorkspaceSegment(pathname: string) {
  const match = pathname.match(/^\/ws\/([^/]+)\/([^/]+)?/);
  const wsId = match?.[1] && isWorkspaceId(match[1]) ? match[1] : DEFAULT_WORKSPACE;
  const section = match?.[2];
  return { wsId, section };
}

export function Sidebar({ user, myWorkBadge = 7 }: SidebarProps) {
  const pathname = usePathname();
  const role = useRoleStore((s) => s.role);
  const toggleRole = useRoleStore((s) => s.toggleRole);

  const isMyWork = pathname.startsWith("/mi-trabajo");
  const { wsId, section } = parseWorkspaceSegment(pathname);

  return (
    <aside className="flex h-screen w-[262px] flex-none flex-col bg-sse-sidebar-bg text-sse-sidebar-text">
      {/* Brand */}
      <div className="flex items-center gap-[11px] border-b border-white/8 px-4 pt-[18px] pb-[14px]">
        <div
          className="flex size-9 flex-none items-center justify-center rounded-[10px] text-[14px] font-extrabold text-white"
          style={{
            background: "linear-gradient(135deg, #2E6BE6, #5B8DEF)",
          }}
        >
          SS
        </div>
        <div className="leading-[1.15]">
          <div className="text-[14px] font-bold text-white">SSE-VRAF</div>
          <div className="text-[11px] font-medium text-sse-sidebar-text-dim">
            Centro de operaciones
          </div>
        </div>
      </div>

      {/* Nav body */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-[18px]">
        {/* Mi Trabajo */}
        <Link
          href="/mi-trabajo"
          className={`flex w-full items-center gap-[11px] rounded-[10px] p-2.5 text-[13px] font-bold font-sans ${
            isMyWork
              ? "bg-[rgba(46,107,230,.20)] text-white shadow-[inset_3px_0_0_#5B8DEF]"
              : "bg-white/4 text-sse-sidebar-text-bright"
          }`}
        >
          <GlyphIcon d={MY_WORK_ICON} size={18} />
          <span className="flex-1 text-left">Mi Trabajo</span>
          {myWorkBadge > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-sse-sidebar-badge-bg px-1.5 text-[10px] font-bold text-sse-sidebar-bg">
              {myWorkBadge}
            </span>
          )}
        </Link>

        {/* Workspace switcher + sections */}
        <WorkspaceSwitcher currentId={wsId} />

        <div className="mt-3.5 flex flex-col gap-0.5">
          {WORKSPACE_SECTIONS.map((s) => {
            const active = !isMyWork && section === s.id;
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

        {/* Module navigation extensions — only for org unit workspaces */}
        {ORG_WORKSPACE_IDS.has(wsId) && moduleRegistry.getNavigationExtensions(wsId).length > 0 && (
          <div className="my-2 h-px bg-white/8" />
        )}
        {ORG_WORKSPACE_IDS.has(wsId) && moduleRegistry.getNavigationExtensions(wsId).map((ext) => {
          const active = !isMyWork && section === ext.id;
          return (
            <Link
              key={ext.id}
              href={`/ws/${wsId}/${ext.href}`}
              className={`flex w-full items-center gap-[11px] rounded-[9px] px-2.5 py-2 text-left text-[12.5px] font-sans ${
                active
                  ? "bg-[rgba(46,107,230,.20)] font-semibold text-white shadow-[inset_3px_0_0_#5B8DEF]"
                  : "font-medium text-sse-sidebar-text"
              }`}
            >
              <GlyphIcon d={ext.icon} size={17} />
              <span className="flex-1">{ext.label}</span>
            </Link>
          );
        })}

        {/* ── Administración — solo ADMIN / SUPER_ADMIN ─────────────────── */}
        {user.isAdmin && (
          <>
            <div className="mt-4 mb-1.5 flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-sse-sidebar-text-dim">
                Administración
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex flex-col gap-0.5">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex w-full items-center gap-[11px] rounded-[9px] px-2.5 py-[7px] text-left text-[12px] font-sans ${
                      active
                        ? "bg-[rgba(46,107,230,.20)] font-semibold text-white shadow-[inset_3px_0_0_#5B8DEF]"
                        : "font-medium text-sse-sidebar-text"
                    }`}
                  >
                    <GlyphIcon d={item.icon} size={15} />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
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
            {demoRoleLabel(role)}
          </div>
        </div>
        <button
          type="button"
          onClick={toggleRole}
          title="Cambiar perfil"
          className="flex size-[30px] items-center justify-center rounded-[8px] border border-white/12 text-sse-sidebar-icon-muted"
        >
          <GlyphIcon
            d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"
            size={15}
            strokeWidth={2}
          />
        </button>
      </div>
    </aside>
  );
}
