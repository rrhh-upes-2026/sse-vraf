"use client";

import { useState } from "react";
import { useISPPermissions, useISPRoles, useISPPermissionMatrix } from "@/hooks/useISP";

const MODULES = ["ime","pme","ape","aee","eme","cpe","eip","iie","ioe","aue","nce","isp"];
const ACTIONS = ["read","create","edit","delete","manage"];

export function ISPPermissions({ wsId }: { wsId: string }) {
  void wsId;
  const [view, setView] = useState<"list" | "matrix">("matrix");
  const [moduleFilter, setModuleFilter] = useState("");

  const { data: perms = [], isLoading: loadingPerms } = useISPPermissions();
  const { data: roles = [] } = useISPRoles();
  const { data: matrix, isLoading: loadingMatrix } = useISPPermissionMatrix();

  const filtered = moduleFilter
    ? perms.filter((p) => p.module === moduleFilter)
    : perms;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded border border-sse-border overflow-hidden text-[11px]">
          <button
            onClick={() => setView("matrix")}
            className={`px-3 py-1.5 ${view === "matrix" ? "bg-[#1E3A8A] text-white" : "bg-sse-surface text-sse-muted hover:text-sse-ink"}`}
          >
            Matriz de roles
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 ${view === "list" ? "bg-[#1E3A8A] text-white" : "bg-sse-surface text-sse-muted hover:text-sse-ink"}`}
          >
            Lista de permisos
          </button>
        </div>
        {view === "list" && (
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
          >
            <option value="">Todos los módulos</option>
            {MODULES.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
          </select>
        )}
      </div>

      {view === "list" && (
        <>
          {loadingPerms && (
            <div className="animate-pulse space-y-1">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-8 rounded bg-sse-border" />)}
            </div>
          )}
          {!loadingPerms && (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-sse-border text-left text-[10px] uppercase tracking-wide text-sse-muted">
                    <th className="pb-2 pr-4">Módulo</th>
                    <th className="pb-2 pr-4">Acción</th>
                    <th className="pb-2">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sse-border">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-sse-border/20">
                      <td className="py-2 pr-4">
                        <span className="font-mono text-[11px] rounded bg-blue-50 text-blue-800 px-1.5 py-0.5">
                          {p.module.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="text-[11px] rounded bg-sse-border/50 px-1.5 py-0.5 text-sse-ink">
                          {p.action}
                        </span>
                      </td>
                      <td className="py-2 text-sse-muted">{p.description || `${p.module}.${p.action}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center text-[13px] text-sse-muted py-8">No hay permisos</p>
              )}
            </div>
          )}
        </>
      )}

      {view === "matrix" && (
        <>
          {loadingMatrix && (
            <div className="animate-pulse space-y-1">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 rounded bg-sse-border" />)}
            </div>
          )}
          {!loadingMatrix && matrix && (
            <div className="overflow-x-auto">
              <table className="text-[11px] w-full border border-sse-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-sse-border/30">
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide text-sse-muted font-medium border-r border-sse-border" style={{ minWidth: 100 }}>
                      Módulo / Acción
                    </th>
                    {roles.map((r) => (
                      <th key={r.id} className="px-2 py-2 text-[10px] text-sse-muted font-medium text-center border-r border-sse-border last:border-r-0">
                        <div className="font-semibold text-sse-ink">{r.name}</div>
                        <div className="text-[9px]">Nv {r.level}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-sse-border">
                  {MODULES.map((mod) =>
                    ACTIONS.map((action, ai) => {
                      const permKey = `${mod}.${action}`;
                      return (
                        <tr key={permKey} className={`hover:bg-sse-border/20 ${ai === 0 ? "border-t-2 border-sse-border" : ""}`}>
                          <td className="px-3 py-1.5 border-r border-sse-border whitespace-nowrap">
                            {ai === 0 ? (
                              <span className="font-mono font-semibold text-sse-ink">{mod.toUpperCase()}</span>
                            ) : (
                              <span className="text-sse-muted pl-2">{action}</span>
                            )}
                            {ai === 0 && <span className="text-sse-muted ml-1 text-[9px]">.{action}</span>}
                            {ai > 0 && null}
                          </td>
                          {roles.map((role) => {
                            const roleMatrix = matrix.matrix.find((m) => m.roleId === role.id);
                            const has = roleMatrix?.permissions?.[permKey] ?? false;
                            return (
                              <td key={role.id} className="py-1.5 px-2 text-center border-r border-sse-border last:border-r-0">
                                {has ? (
                                  <span className="text-green-600 text-[13px]">✓</span>
                                ) : (
                                  <span className="text-sse-border text-[11px]">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!loadingMatrix && !matrix && (
            <p className="text-center text-[13px] text-sse-muted py-8">No se pudo cargar la matriz</p>
          )}
        </>
      )}
    </div>
  );
}
