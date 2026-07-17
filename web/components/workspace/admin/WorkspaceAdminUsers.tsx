"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useWorkspaceUsers } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { WorkspaceUser, RoleCode } from "@/types/workspace-admin";
import { UserDrawer } from "./drawers/UserDrawer";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

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

function UserRow({
  user,
  onAction,
  onEdit,
}: {
  user: WorkspaceUser;
  onAction: () => void;
  onEdit: (user: WorkspaceUser) => void;
}) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("ws.users.manage");
  const [busy, setBusy] = useState(false);
  const [editingRole, setEditingRole] = useState(false);

  const handleToggleActive = async (checked: boolean) => {
    setBusy(true);
    await WorkspaceAdminService.toggleUserActive(user.id, checked);
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
    <tr
      className="border-b border-sse-border last:border-0 hover:bg-sse-shell-canvas cursor-pointer transition-colors"
      onClick={() => onEdit(user)}
    >
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
      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
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
      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
        {canManage ? (
          <Switch
            checked={user.activo}
            onCheckedChange={handleToggleActive}
            disabled={busy}
            label={user.activo ? "Activo" : "Inactivo"}
          />
        ) : (
          <span className={
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold " +
            (user.activo ? "bg-green-50 text-green-700" : "bg-sse-hover text-sse-muted")
          }>
            <span className={"w-1.5 h-1.5 rounded-full " + (user.activo ? "bg-green-500" : "bg-sse-muted")} />
            {user.activo ? "Activo" : "Inactivo"}
          </span>
        )}
      </td>
      <td className="py-3 px-3">
        <span className="text-[12px] text-sse-muted">{lastLogin}</span>
      </td>
    </tr>
  );
}

export function WorkspaceAdminUsers({ wsId }: { wsId: WorkspaceId }) {
  const { hasPermission } = usePermissions();
  const { data: users, loading, refetch } = useWorkspaceUsers(wsId);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<WorkspaceUser | null>(null);

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

  function openNew() { setSelectedUser(null); setDrawerOpen(true); }
  function openEdit(user: WorkspaceUser) { setSelectedUser(user); setDrawerOpen(true); }

  return (
    <div className="space-y-4">
      <UserDrawer
        wsId={wsId}
        user={selectedUser}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={refetch}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Gestión de Usuarios</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Scoped a este workspace · Un administrador no puede modificar usuarios fuera de su unidad.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="sm" onClick={openNew}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Usuario
          </Button>
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
                  : "text-sse-muted hover:bg-sse-shell-canvas hover:text-sse-ink")
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
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 animate-pulse rounded-full bg-sse-shell-canvas shrink-0" />
                <div className="h-8 flex-1 animate-pulse rounded-md bg-sse-shell-canvas" />
                <div className="h-8 w-20 animate-pulse rounded-md bg-sse-shell-canvas" />
                <div className="h-8 w-16 animate-pulse rounded-md bg-sse-shell-canvas" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-10 text-sse-border">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <p className="text-[13px] font-medium text-sse-muted">No se encontraron usuarios.</p>
            {canManage && filter === "all" && !search && (
              <Button variant="primary" size="sm" onClick={openNew} className="mt-2">Agregar primer usuario</Button>
            )}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border">
                {["Usuario", "Rol", "Estado", "Último acceso"].map((h) => (
                  <th key={h} className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide py-2.5 px-3 first:px-4 last:px-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <UserRow key={user.id} user={user} onAction={refetch} onEdit={openEdit} />
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
