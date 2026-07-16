"use client";

import { useState } from "react";
import { useBlueprintRegistry } from "@/hooks/useBlueprintRegistry";
import { BlueprintCard } from "./BlueprintCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { BlueprintStatus } from "@/types/studio";

type StatusFilter = BlueprintStatus | "all";

const STATUS_PILLS: { id: StatusFilter; label: string }[] = [
  { id: "all",        label: "Todos" },
  { id: "published",  label: "Publicados" },
  { id: "draft",      label: "Borradores" },
  { id: "validating", label: "Validando" },
  { id: "deprecated", label: "Deprecados" },
  { id: "archived",   label: "Archivados" },
];

function RegistrySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-sse-surface border border-sse-border rounded-md p-4 space-y-3">
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-20 rounded-sm" />
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="pt-2 border-t border-sse-border flex justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlueprintRegistry() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: blueprints = [], isLoading, isError } = useBlueprintRegistry();

  const categories = Array.from(new Set(blueprints.map((b) => b.category))).sort();

  const filtered = blueprints.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchCategory = categoryFilter === "all" || b.category === categoryFilter;
    return matchStatus && matchCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Blueprint Registry</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            {isLoading ? "Cargando…" : `${blueprints.length} blueprints`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {STATUS_PILLS.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium transition-colors",
                statusFilter === pill.id
                  ? "bg-sse-primary text-white"
                  : "bg-sse-pill-gray-bg text-sse-ink hover:bg-sse-border",
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={cn(
              "text-[12px] bg-sse-surface border border-sse-border rounded-sm px-2 py-1",
              "text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary",
            )}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading && <RegistrySkeleton />}

      {isError && (
        <p className="text-[13px] text-sse-muted py-8 text-center">
          No se pudo cargar el registro de blueprints.
        </p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-[14px] text-sse-muted">No hay blueprints que coincidan con el filtro.</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bp) => (
            <BlueprintCard key={bp.id} blueprint={bp} />
          ))}
        </div>
      )}
    </div>
  );
}
