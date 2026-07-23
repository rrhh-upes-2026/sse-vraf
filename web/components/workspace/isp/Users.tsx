"use client";

import { useState } from "react";
import { useISPUsers, useISPRoles, useCreateISPUser, useUpdateISPUser, useSetISPUserStatus } from "@/hooks/useISP";
import type { ISPUserStatus, ISPUser, ISPCreateUserParams } from "@/types/isp";

const STATUS_BADGE: Record<ISPUserStatus, string> = {
  activo:    "bg-green-100 text-green-700",
  inactivo:  "bg-gray-100 text-gray-600",
  bloqueado: "bg-red-100 text-red-700",
  pendiente: "bg-amber-100 text-amber-700",
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

function UserForm({ roles, onClose }: { roles: { id: string; name: string }[]; onClose: () => void }) {
  const create = useCreateISPUser();
  const [form, setForm] = useState<ISPCreateUserParams>({
    employeeId: "", fullName: "", email: "", username: "", password: "", roleId: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(form, { onSuccess: onClose });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-3">
      <p className="text-[13px] font-semibold text-sse-ink">Nuevo Usuario</p>
      <div className="grid md:grid-cols-2 gap-3">
        {[
          { field: "employeeId" as const, label: "ID Empleado" },
          { field: "fullName"   as const, label: "Nombre completo" },
          { field: "email"      as const, label: "Email", type: "email" },
          { field: "username"   as const, label: "Username" },
          { field: "password"   as const, label: "Contraseña", type: "password" },
        ].map(({ field, label, type }) => (
          <div key={field}>
            <label className="block text-[11px] text-sse-muted mb-0.5">{label}</label>
            <input
              required={field !== "employeeId"}
              type={type ?? "text"}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
            />
          </div>
        ))}
        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">Rol</label>
          <select
            required
            value={form.roleId}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
          >
            <option value="">Selecciona un rol</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>
      <p className="text-[10px] text-sse-muted">La contraseña se almacenará como SHA-256(salt + password).</p>
      <div className="flex gap-2">
        <button type="submit" disabled={create.isPending}
          className="text-[12px] px-4 py-1.5 rounded bg-[#1E3A8A] text-white hover:bg-blue-900 disabled:opacity-50">
          {create.isPending ? "Creando…" : "Crear usuario"}
        </button>
        <button type="button" onClick={onClose}
          className="text-[12px] px-3 py-1.5 rounded border border-sse-border text-sse-muted hover:text-sse-ink">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function UserDetail({ user, roles, onClose }: { user: ISPUser; roles: { id: string; name: string }[]; onClose: () => void }) {
  const update     = useUpdateISPUser();
  const setStatus  = useSetISPUserStatus();
  const [roleId, setRoleId] = useState(user.roleId);

  function handleRoleChange() {
    update.mutate({ id: user.id, roleId }, { onSuccess: onClose });
  }

  function handleStatus(status: ISPUserStatus) {
    setStatus.mutate({ userId: user.id, status }, { onSuccess: onClose });
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/20 p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14px] font-semibold text-sse-ink">{user.fullName}</p>
          <p className="text-[12px] text-sse-muted">{user.email} · @{user.username}</p>
        </div>
        <button onClick={onClose} className="text-[11px] text-sse-muted hover:text-sse-ink">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div><span className="text-sse-muted">Estado:</span> <span className={`ml-1 rounded-full px-2 py-0.5 ${STATUS_BADGE[user.status]}`}>{user.status}</span></div>
        <div><span className="text-sse-muted">Empleado ID:</span> <span className="ml-1 text-sse-ink">{user.employeeId || "—"}</span></div>
        <div><span className="text-sse-muted">Último acceso:</span> <span className="ml-1 text-sse-ink">{fmtDate(user.lastLogin)}</span></div>
        <div><span className="text-sse-muted">Intentos fallidos:</span> <span className="ml-1 text-sse-ink">{user.failedAttempts}</span></div>
        {user.lockedUntil && <div className="col-span-2"><span className="text-red-600">Bloqueado hasta: {fmtDate(user.lockedUntil)}</span></div>}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-[11px] text-sse-muted mb-0.5">Cambiar rol</label>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink">
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button onClick={handleRoleChange} disabled={update.isPending || roleId === user.roleId}
          className="text-[11px] px-3 py-1.5 rounded bg-[#1E3A8A] text-white hover:bg-blue-900 disabled:opacity-50">
          Guardar rol
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-sse-border">
        {user.status !== "activo"    && <button onClick={() => handleStatus("activo")}    className="text-[11px] px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200">Activar</button>}
        {user.status !== "inactivo"  && <button onClick={() => handleStatus("inactivo")}  className="text-[11px] px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">Desactivar</button>}
        {user.status !== "bloqueado" && <button onClick={() => handleStatus("bloqueado")} className="text-[11px] px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">Bloquear</button>}
      </div>
    </div>
  );
}

export function ISPUsers({ wsId }: { wsId: string }) {
  void wsId;
  const [statusFilter, setStatusFilter] = useState<ISPUserStatus | "">("");
  const [search, setSearch]             = useState("");
  const [showCreate, setShowCreate]     = useState(false);
  const [selected, setSelected]         = useState<ISPUser | null>(null);

  const params = { status: statusFilter || undefined, search: search || undefined };
  const { data: users = [], isLoading } = useISPUsers(params);
  const { data: roles = [] }            = useISPRoles();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o username…"
          className="flex-1 min-w-[180px] text-[12px] rounded-md border border-sse-border px-3 py-1.5 bg-sse-surface text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ISPUserStatus | "")}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="bloqueado">Bloqueado</option>
          <option value="pendiente">Pendiente</option>
        </select>
        <button onClick={() => { setShowCreate(true); setSelected(null); }}
          className="text-[12px] px-4 py-1.5 rounded bg-[#1E3A8A] text-white hover:bg-blue-900">
          + Nuevo usuario
        </button>
      </div>

      {showCreate && <UserForm roles={roles} onClose={() => setShowCreate(false)} />}
      {selected && <UserDetail user={selected} roles={roles} onClose={() => setSelected(null)} />}

      {isLoading && (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-sse-border" />)}
        </div>
      )}
      {!isLoading && users.length === 0 && (
        <p className="text-center text-[13px] text-sse-muted py-8">No hay usuarios</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-sse-border text-left text-[10px] uppercase tracking-wide text-sse-muted">
              <th className="pb-2 pr-4">Usuario</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Rol</th>
              <th className="pb-2 pr-4">Estado</th>
              <th className="pb-2 pr-4">Último Acceso</th>
              <th className="pb-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sse-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-sse-border/20">
                <td className="py-2 pr-4">
                  <div>
                    <p className="font-medium text-sse-ink">{u.fullName}</p>
                    <p className="text-[10px] text-sse-muted">@{u.username}</p>
                  </div>
                </td>
                <td className="py-2 pr-4 text-sse-muted">{u.email}</td>
                <td className="py-2 pr-4">
                  <span className="rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[10px]">
                    {u.roleName || u.roleId || "—"}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[u.status]}`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-2 pr-4 text-sse-muted">{fmtDate(u.lastLogin)}</td>
                <td className="py-2">
                  <button onClick={() => { setSelected(u); setShowCreate(false); }}
                    className="text-[11px] text-blue-700 hover:underline">
                    Gestionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
