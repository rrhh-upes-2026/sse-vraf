"use client";

import { useSession } from "next-auth/react";
import { ROLES } from "@/types/roles";
import type { RoleCode } from "@/types/roles";
import { VRAF_WORKSPACE } from "@/config/nav";
import { moduleRegistry } from "@/lib/sdk/registry";
import type { WorkspaceId } from "@/config/nav";

function todayLabel() {
  return new Intl.DateTimeFormat("es-SV", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function WelcomeBanner() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Usuario";
  const role = session?.user?.rol as RoleCode | undefined;
  const unidadId = session?.user?.unidadId as WorkspaceId | undefined;

  const roleDef = role ? ROLES[role] : undefined;
  const allWorkspaces = [VRAF_WORKSPACE, ...moduleRegistry.getWorkspaceUnits()];
  const unidad = unidadId ? allWorkspaces.find((u) => u.id === unidadId) : undefined;

  const firstName = name.split(" ")[0];

  return (
    <div
      className="rounded-md p-6 flex items-center justify-between gap-6"
      style={{ background: "linear-gradient(135deg, #0f2647 0%, #2e6be6 100%)" }}
    >
      <div className="space-y-1.5">
        <p className="text-[13px] text-blue-200 font-medium capitalize">{todayLabel()}</p>
        <h1 className="text-[22px] font-bold text-white leading-tight">
          Buenos días, {firstName}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          {roleDef && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded-sm text-[12px] text-white font-medium">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-80">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {roleDef.label}
            </span>
          )}
          {unidad && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded-sm text-[12px] text-white font-medium">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-80">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              {unidad.short}
            </span>
          )}
        </div>
      </div>

      {/* SSE-VRAF monogram */}
      <div
        className="hidden md:flex w-16 h-16 rounded-md items-center justify-center text-white text-xl font-bold shrink-0 opacity-30"
        style={{ border: "2px solid rgba(255,255,255,0.3)" }}
      >
        SSE
      </div>
    </div>
  );
}
