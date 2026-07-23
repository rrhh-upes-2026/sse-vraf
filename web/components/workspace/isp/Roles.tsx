"use client";

import { useState } from "react";
import {
  useISPRoles, useISPPermissions, useISPRolePermissions,
  useCreateISPRole, useUpdateISPRole, useDeleteISPRole, useDuplicateISPRole,
  useAssignISPPermissions,
} from "@/hooks/useISP";
import type { ISPRole } from "@/types/isp";

const MODULES = ["ime","pme","ape","aee","eme","cpe","eip","iie","ioe","aue","nce","isp"];
const ACTIONS = ["read","create","edit","delete","manage"];

function RoleForm({ onClose }: { onClose: () => void }) {
  const create = useCreateISPRole();
  const [name, setName]        = useState("");
  const [desc, setDesc]        = useState("");
  const [level, setLevel]      = useState("99");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ name, description: desc, level: Number(level) }, { onSuccess: onClose });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-3">
      <p className="text-[13px] font-semibold text-sse-ink">Nuevo Rol</p>
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">Nombre</label>
          <input required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] text-sse-muted mb-0.5">Descripción</label>
          <input value={desc} onChange={(e) => setDesc(e.target.value)}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
        </div>
        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">Nivel (0=mayor autoridad)</label>
          <input type="number" min={1} value={level} onChange={(e) => setLevel(e.target.value)}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={create.isPending}
          className="text-[12px] px-4 py-1.5 rounded bg-[#1E3A8A] text-white hover:bg-blue-900 disabled:opacity-50">
          {create.isPending ? "Creando…" : "Crear rol"}
        </button>
        <button type="button" onClick={onClose}
          className="text-[12px] px-3 py-1.5 rounded border border-sse-border text-sse-muted hover:text-sse-ink">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function PermissionPanel({ role, onClose }: { role: ISPRole; onClose: () => void }) {
  const { data: allPerms = [] } = useISPPermissions();
  const { data: rolePerms = [] } = useISPRolePermissions(role.id);
  const assign = useAssignISPPermissions();

  const assignedIds = new Set(rolePerms.map((p) => p.id));
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedIds));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleModule(mod: string) {
    const modPerms = allPerms.filter((p) => p.module === mod).map((p) => p.id);
    const allSelected = modPerms.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      modPerms.forEach((id) => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  }

  function handleSave() {
    assign.mutate({ roleId: role.id, permissionIds: Array.from(selected) }, { onSuccess: onClose });
  }

  return (
    <div className="rounded-lg border border-blue-300 bg-blue-50/20 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-sse-ink">
          Permisos — <span className="text-blue-700">{role.name}</span>
        </p>
        <button onClick={onClose} className="text-[11px] text-sse-muted hover:text-sse-ink">✕</button>
      </div>

      <div className="overflow-x-auto">
        <table className="text-[11px] w-full">
          <thead>
            <tr>
              <th className="text-left pb-2 pr-3 text-[10px] uppercase tracking-wide text-sse-muted font-medium">Módulo</th>
              {ACTIONS.map((a) => (
                <th key={a} className="pb-2 px-2 text-[10px] uppercase tracking-wide text-sse-muted font-medium text-center">
                  {a}
                </th>
              ))}
              <th className="pb-2 px-2 text-[10px] text-sse-muted font-medium">Todos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sse-border">
            {MODULES.map((mod) => {
              const modPerms = allPerms.filter((p) => p.module === mod);
              const allSelected = modPerms.length > 0 && modPerms.every((p) => selected.has(p.id));
              return (
                <tr key={mod} className="hover:bg-sse-border/20">
                  <td className="py-1.5 pr-3 font-mono font-semibold text-sse-ink">{mod.toUpperCase()}</td>
                  {ACTIONS.map((action) => {
                    const perm = modPerms.find((p) => p.action === action);
                    return (
                      <td key={action} className="py-1.5 px-2 text-center">
                        {perm ? (
                          <input type="checkbox" checked={selected.has(perm.id)} onChange={() => toggle(perm.id)}
                            className="accent-blue-700 w-3.5 h-3.5" />
                        ) : (
                          <span className="text-sse-border">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-1.5 px-2 text-center">
                    <input type="checkbox" checked={allSelected} onChange={() => toggleModule(mod)}
                      className="accent-blue-700 w-3.5 h-3.5" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-sse-border">
        <span className="text-[11px] text-sse-muted">{selected.size} permisos seleccionados</span>
        <div className="flex-1" />
        <button onClick={handleSave} disabled={assign.isPending}
          className="text-[12px] px-4 py-1.5 rounded bg-[#1E3A8A] text-white hover:bg-blue-900 disabled:opacity-50">
          {assign.isPending ? "Guardando…" : "Guardar permisos"}
        </button>
      </div>
    </div>
  );
}

export function ISPRoles({ wsId }: { wsId: string }) {
  void wsId;
  const { data: roles = [], isLoading } = useISPRoles();
  const deleteRole    = useDeleteISPRole();
  const duplicateRole = useDuplicateISPRole();
  const [showCreate, setShowCreate] = useState(false);
  const [editPerms, setEditPerms]   = useState<ISPRole | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)}
          className="text-[12px] px-4 py-1.5 rounded bg-[#1E3A8A] text-white hover:bg-blue-900">
          + Nuevo rol
        </button>
      </div>

      {showCreate && <RoleForm onClose={() => setShowCreate(false)} />}
      {editPerms  && <PermissionPanel role={editPerms} onClose={() => setEditPerms(null)} />}

      {isLoading && (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-sse-border" />)}
        </div>
      )}

      {!isLoading && roles.length === 0 && (
        <p className="text-center text-[13px] text-sse-muted py-8">No hay roles</p>
      )}

      <div className="space-y-2">
        {roles.map((role) => (
          <div key={role.id} className="rounded-lg border border-sse-border bg-sse-surface px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-sse-ink">{role.name}</p>
                {role.isSystem && (
                  <span className="text-[9px] rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 font-medium">SISTEMA</span>
                )}
                <span className="text-[10px] text-sse-muted">Nivel {role.level}</span>
              </div>
              <p className="text-[11px] text-sse-muted truncate">{role.description}</p>
            </div>
            <span className="shrink-0 text-[11px] text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">
              {role.permissionCount ?? 0} permisos
            </span>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setEditPerms(role); setShowCreate(false); }}
                className="text-[11px] text-blue-700 hover:underline">Permisos</button>
              <button onClick={() => duplicateRole.mutate(role.id)} disabled={duplicateRole.isPending}
                className="text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-50">Duplicar</button>
              {!role.isSystem && (
                <button onClick={() => deleteRole.mutate(role.id)} disabled={deleteRole.isPending}
                  className="text-[11px] text-red-500 hover:text-red-700 disabled:opacity-50">Eliminar</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
