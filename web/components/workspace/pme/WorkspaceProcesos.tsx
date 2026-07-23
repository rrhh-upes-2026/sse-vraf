"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePMEProcesos, usePMEProcesoActions, usePMECatalogosPorTipo } from "@/hooks/usePME";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { PMEProceso } from "@/types/pme";

interface Props {
  wsId: string;
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-sse-sem-green-bg px-2 py-0.5 text-[11px] font-medium text-sse-sem-green-fg border border-sse-sem-green-border">
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-sse-border/60 px-2 py-0.5 text-[11px] font-medium text-sse-muted">
      Archivado
    </span>
  );
}

export function WorkspaceProcesos({ wsId }: Props) {
  const router = useRouter();
  const [search, setSearch]     = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [filterTipo, setFilterTipo]     = useState("");

  const { data: procesos, isLoading } = usePMEProcesos();
  const { data: tipos }               = usePMECatalogosPorTipo("tipoProceso");
  const { archivar, activar, duplicar } = usePMEProcesoActions();

  const filtered = (procesos ?? []).filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchActive = !filterActive || String(p.active) === filterActive;
    const matchTipo   = !filterTipo || p.tipoProcesoId === filterTipo;
    return matchSearch && matchActive && matchTipo;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-sse-ink">Procesos</h1>
        <Button size="sm" onClick={() => router.push(`/ws/${wsId}/procesos-pme/nuevo`)}>
          + Nuevo Proceso
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código o nombre…"
          className="w-64"
        />
        <Select
          value={filterActive}
          onValueChange={setFilterActive}
          options={[
            { value: "", label: "Todos los estados" },
            { value: "true",  label: "Activos" },
            { value: "false", label: "Archivados" },
          ]}
        />
        <Select
          value={filterTipo}
          onValueChange={setFilterTipo}
          options={[
            { value: "", label: "Todos los tipos" },
            ...(tipos ?? []).map((t) => ({ value: t.id, label: t.nombre })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No hay procesos"
          description="Cree el primer proceso institucional."
          action={
            <Button size="sm" onClick={() => router.push(`/ws/${wsId}/procesos-pme/nuevo`)}>
              + Nuevo Proceso
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-sse-border">
                <th className="pb-2 text-left font-medium text-sse-muted">Código</th>
                <th className="pb-2 text-left font-medium text-sse-muted">Nombre</th>
                <th className="pb-2 text-left font-medium text-sse-muted">Periodicidad</th>
                <th className="pb-2 text-left font-medium text-sse-muted">Estado</th>
                <th className="pb-2 text-right font-medium text-sse-muted">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sse-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-sse-hover">
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/ws/${wsId}/procesos-pme/${p.id}`}
                      className="font-mono text-[12px] text-sse-primary hover:underline"
                    >
                      {p.code}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-sse-ink max-w-xs truncate">{p.name}</td>
                  <td className="py-2.5 pr-4 text-sse-muted">{p.periodicidad || "—"}</td>
                  <td className="py-2.5 pr-4">
                    <StatusBadge active={p.active} />
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/ws/${wsId}/procesos-pme/${p.id}`}
                        className="text-[12px] text-sse-primary hover:underline"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/ws/${wsId}/procesos-pme/${p.id}/editar`}
                        className="text-[12px] text-sse-ink hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => duplicar.mutate({ id: p.id })}
                        className="text-[12px] text-sse-muted hover:text-sse-ink"
                      >
                        Duplicar
                      </button>
                      {p.active ? (
                        <button
                          onClick={() => archivar.mutate({ id: p.id })}
                          className="text-[12px] text-sse-sem-red-fg hover:underline"
                        >
                          Archivar
                        </button>
                      ) : (
                        <button
                          onClick={() => activar.mutate({ id: p.id })}
                          className="text-[12px] text-sse-sem-green-fg hover:underline"
                        >
                          Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
