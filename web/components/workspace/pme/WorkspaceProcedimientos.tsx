"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePMEProcesos, usePMEProcedimientos, usePMEProcedimientoActions } from "@/hooks/usePME";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { PMEProceso, PMEProcedimiento } from "@/types/pme";

interface Props {
  wsId: string;
}

function TreeNode({
  proceso,
  procedimientos,
  wsId,
  onArchivar,
  onActivar,
  onDuplicar,
}: {
  proceso: PMEProceso;
  procedimientos: PMEProcedimiento[];
  wsId: string;
  onArchivar: (id: string) => void;
  onActivar: (id: string) => void;
  onDuplicar: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = procedimientos.filter((p) => p.procesoId === proceso.id);

  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-md bg-sse-surface border border-sse-border hover:border-sse-primary/30 transition-colors"
      >
        <span className="text-[11px] text-sse-muted">{expanded ? "▼" : "▶"}</span>
        <span className="font-mono text-[12px] text-sse-muted">{proceso.code}</span>
        <span className="text-[13px] font-medium text-sse-ink flex-1 text-left">{proceso.name}</span>
        <span className="text-[11px] text-sse-muted">{children.length} procedimientos</span>
      </button>

      {expanded && (
        <div className="ml-6 mt-1 space-y-1 border-l-2 border-sse-border pl-3">
          {children.length === 0 ? (
            <p className="py-2 text-[12px] text-sse-muted italic">Sin procedimientos registrados.</p>
          ) : (
            children.map((proc) => (
              <div
                key={proc.id}
                className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-sse-hover"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${proc.active ? "bg-sse-sem-green-fg" : "bg-sse-border"}`}
                />
                <Link
                  href={`/ws/${wsId}/procedimientos`}
                  className="font-mono text-[11px] text-sse-muted hover:text-sse-primary"
                >
                  {proc.code}
                </Link>
                <span className="text-[13px] text-sse-ink flex-1 truncate">{proc.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDuplicar(proc.id)}
                    className="text-[11px] text-sse-muted hover:text-sse-ink"
                  >
                    Duplicar
                  </button>
                  {proc.active ? (
                    <button
                      onClick={() => onArchivar(proc.id)}
                      className="text-[11px] text-sse-sem-red-fg hover:underline"
                    >
                      Archivar
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivar(proc.id)}
                      className="text-[11px] text-sse-sem-green-fg hover:underline"
                    >
                      Activar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <Link
            href={`/ws/${wsId}/procedimientos/nuevo?procesoId=${proceso.id}`}
            className="inline-flex items-center gap-1 py-1.5 px-3 text-[12px] text-sse-primary hover:underline"
          >
            + Agregar procedimiento
          </Link>
        </div>
      )}
    </div>
  );
}

export function WorkspaceProcedimientos({ wsId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: procesos,        isLoading: loadingP }  = usePMEProcesos();
  const { data: procedimientos,  isLoading: loadingPr } = usePMEProcedimientos();
  const { archivar, activar, duplicar } = usePMEProcedimientoActions();

  const isLoading = loadingP || loadingPr;

  const filteredProcesos = (procesos ?? []).filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-sse-ink">Procedimientos</h1>
        <Button size="sm" onClick={() => router.push(`/ws/${wsId}/procedimientos/nuevo`)}>
          + Nuevo Procedimiento
        </Button>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filtrar procesos…"
        className="w-64"
      />

      {filteredProcesos.length === 0 ? (
        <EmptyState
          title="No hay procesos"
          description="Cree procesos primero para poder agregar procedimientos."
          action={
            <Button size="sm" onClick={() => router.push(`/ws/${wsId}/procesos-pme/nuevo`)}>
              + Nuevo Proceso
            </Button>
          }
        />
      ) : (
        <div>
          {filteredProcesos.map((p) => (
            <TreeNode
              key={p.id}
              proceso={p}
              procedimientos={procedimientos ?? []}
              wsId={wsId}
              onArchivar={(id) => archivar.mutate({ id })}
              onActivar={(id) => activar.mutate({ id })}
              onDuplicar={(id) => duplicar.mutate({ id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
