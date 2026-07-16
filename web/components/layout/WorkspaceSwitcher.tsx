"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlyphIcon } from "@/components/layout/GlyphIcon";
import { VRAF_WORKSPACE, getWorkspace, type WorkspaceId } from "@/config/nav";
import { moduleRegistry } from "@/lib/sdk/registry";

interface WorkspaceSwitcherProps {
  currentId: WorkspaceId;
}

export function WorkspaceSwitcher({ currentId }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = getWorkspace(currentId) ?? VRAF_WORKSPACE;

  // VRAF is always first; enabled modules follow in registration order.
  const workspaces = [VRAF_WORKSPACE, ...moduleRegistry.getWorkspaceUnits()];

  function select(id: string) {
    setOpen(false);
    router.push(`/ws/${id}/dashboard`);
  }

  return (
    <div>
      <div className="mb-1.5 mt-4 flex items-center justify-between px-1.5">
        <span className="font-mono-sse text-[9.5px] font-bold uppercase tracking-[.9px] text-sse-sidebar-caption">
          Workspace
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-[10px] border border-white/12 bg-white/4 px-2.5 py-2.5 font-sans text-white"
      >
        <span
          className="flex size-[26px] flex-none items-center justify-center rounded-[7px]"
          style={{ background: current.bg, color: current.color }}
        >
          <GlyphIcon d={current.icon} size={15} strokeWidth={2} />
        </span>
        <span className="flex-1 text-left text-[12.5px] font-semibold leading-[1.15]">
          {current.short}
        </span>
        <GlyphIcon
          d="M6 9l6 6 6-6"
          size={15}
          strokeWidth={2}
          className="text-sse-sidebar-chevron"
        />
      </button>

      {open && (
        <div className="mt-1.5 rounded-[10px] border border-white/10 bg-sse-ws-dropdown-bg p-[5px] shadow-[0_8px_24px_rgba(0,0,0,.3)]">
          {workspaces.map((u) => {
            const active = u.id === currentId;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => select(u.id)}
                className={`flex w-full items-center gap-2.5 rounded-[8px] px-[9px] py-2 font-sans text-[12px] font-semibold text-sse-sidebar-text-bright ${
                  active ? "bg-[rgba(46,107,230,.16)]" : "bg-transparent"
                }`}
              >
                <span
                  className="flex size-[22px] flex-none items-center justify-center rounded-[6px]"
                  style={{ background: u.bg, color: u.color }}
                >
                  <GlyphIcon d={u.icon} size={13} strokeWidth={2} />
                </span>
                <span className="flex-1 text-left">{u.short}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
