"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useWorkspaceUsers } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { WorkspaceUser, RoleCode } from "@/types/workspace-admin";

const ROLE_LABELS: Record<RoleCode, string> = {
  ADMIN: "Administrador",
  HEAD: "Jefatura",
  ANALYST: "Analista",
  OPS: "Operativo",
  AUDIT: "Auditor",
};

const ROLE_COLORS: Record<RoleCode, string> = {
  ADMIN: "#E54D4D",
  HEAD: "#2E6BE6",
  ANALYST: "#5B4FD0",
  OPS: "#12A150",
  AUDIT: "#637083",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function UserRow({ user, onAction }: { user: WorkspaceUser; onAction: () => void }) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("ws.users.manage");
  const [busy, setBusy] = useState(false);
  const [editingRole, setEditingRole] = useState(false);

  const handleToggleActive = async () => {
    if (!confirm(`¿${user.activo ? "Desactivar" : "Activar"} al usuario "${user.nombre}"?`)) return;
    setBusy(true);
    await WorkspaceAdminService.toggleUserActive(user.id, !user.activo);
    setBusy(false);
    onAction();
  };

  const handleRoleChange = async (rol: RoleCode) => {
    setBusy(true);
    await WorkspaceAdminService.updateUserRole(user.id, rol);
    setEditingRole(false);
    setBusy(false);
    onAction();
  };

  const avatarColor = ROLE_COLORS[user.rol];
  const lastLogin = user.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleDateString("es-SV", { day: "2-digit", month: "short" })
    : "—";

  return (
    <tr className="border-b border-sse-border last:border-0 hover:bg-sse-hover/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initials(user.nombre)}
          </div>
          <div>
            <p className="text-[13px] font-medium text-sse-ink">{user.nombre}</p>
            <p className="text-[11px] text-sse-muted">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        {editingRole && canManage ? (
          <select
            defaultValue={user.rol}
            onChange={(e) => handleRoleChange(e.target.value as RoleCode)}
            disabled={busy}
            className="text-[12px] border border-sse-border rounded px-2 py-1 bg-sse-surface text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary/50"
          >
            {(Object.keys(ROLE_LABELS) as RoleCode[]).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => canManage && setEditingRole(true)}
            className="flex items-center gap-1.5 group"
          >
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: `${avatarColor}18`, color: avatarColor }}
            >
              {ROLE_LABELS[user.rol]}
            </span>
            {canManage && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                className="w-3 h-3 text-sse-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            )}
          </button>
        )}
      </td>
      <td className="py-3 px-3">
        <span className={
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold " +
          (user.activo ? "bg-green-50 text-green-700" : "bg-sse-hover text-sse-muted")
        }>
          <span className={
            "w-1.5 h-1.5 rounded-full " +
            (user.activo ? "bg-green-500" : "bg-sse-muted")
          } />
          {user.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="py-3 px-3">
        <span className="text-[12px] text-sse-muted">{lastLogin}</span>
      </td>
      <td className="py-3 px-4 text-right">
        {canManage && (
          <button
            onClick={handleToggleActive}
            disabled={busy}
            className="text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-50"
          >
            {user.activo ? "Desactivar" : "Activar"}
          </button>
        )}
      </td>
    </tr>
  );
}

export function WorkspaceAdminUsers({ wsId }: { wsId: WorkspaceId }) {
  const { hasPermission } = usePermissions();
  const { data: users, loading, refetch } = useWorkspaceUsers(wsId);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");

  const canManage = hasPermission("ws.users.manage");

  const filtered = (users ?? []).filter((u) => {
    if (filter === "active" && !u.activo) return false;
    if (filter === "inactive" && u.activo) return false;
    if (search && !u.nombre.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: users?.length ?? 0,
    active: (users ?? []).filter((u) => u.activo).length,
    inactive: (users ?? []).filter((u) => !u.activo).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Gestión de Usuarios</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Scoped a este workspace · Un administrador no puede modificar usuarios fuera de su unidad.
          </p>
        </div>
        {canManage && (
          <button className="flex items-center gap-1.5 text-[12px] font-medium bg-sse-primary text-white px-3 py-1.5 rounded-md hover:bg-sse-primary/90 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Invitar Usuario
          </button>
        )}
      </div>

      {/* Role summary */}
      <div className="flex gap-3 flex-wrap">
        {(Object.keys(ROLE_LABELS) as RoleCode[]).map((rol) => {
          const count = (users ?? []).filter((u) => u.rol === rol).length;
          if (count === 0) return null;
          return (
            <div key={rol} className="flex items-center gap-1.5 text-[12px]">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ROLE_COLORS[rol] }}
              />
              <span className="text-sse-muted">{ROLE_LABELS[rol]}</span>
              <span className="font-semibold text-sse-ink tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        {(["all", "active", "inactive"] as const).map((f) => {
          const labels = { all: "Todos", active: "Activos", inactive: "Inactivos" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors " +
                (filter === f
                  ? "bg-sse-primary/10 text-sse-primary"
                  : "text-sse-muted hover:bg-sse-hover hover:text-sse-ink")
              }
            >
              {labels[f]}
              <span className="ml-1.5 text-[10px] opacity-70">{counts[f]}</span>
            </button>
          );
        })}
        <div className="ml-auto">
          <input
            type="search"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[12px] px-3 py-1.5 rounded-md border border-sse-border bg-sse-surface text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary/50 w-48"
          />
        </div>
      </div>

      <div className="bg-sse-surface rounded-md border border-sse-border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-5 h-5 border-2 border-sse-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] text-sse-muted">No se encontraron usuarios.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border">
                {["Usuario", "Rol", "Estado", "Último acceso", ""].map((h) => (
                  <th key={h} className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide py-2.5 px-3 first:px-4 last:px-4 last:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <UserRow key={user.id} user={user} onAction={refetch} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-sse-hover rounded-md border border-sse-border px-4 py-3">
        <p className="text-[11px] text-sse-muted">
          <strong className="text-sse-ink">Scope:</strong> Este listado solo muestra usuarios de este workspace.
          Un administrador no puede ver ni modificar usuarios de otras unidades.
          Los cambios de rol se aplican solo dentro del contexto de este workspace.
        </p>
      </div>
    </div>
  );
}
