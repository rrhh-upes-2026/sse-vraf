"use client";

import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/utils";
import { BLUEPRINT_STATUS_VARIANT, BLUEPRINT_STATUS_LABEL } from "@/lib/studio/blueprintStatusConfig";
import type { BlueprintVersion } from "@/types/studio";

interface VersionHistoryProps {
  versions: BlueprintVersion[];
}

export function VersionHistory({ versions }: VersionHistoryProps) {
  const sorted = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-[13px] text-sse-muted py-4">No hay versiones registradas.</p>
    );
  }

  return (
    <div className="divide-y divide-sse-border">
      {sorted.map((v) => (
        <div key={v.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-sse-ink font-mono">v{v.version}</span>
              <Badge variant={BLUEPRINT_STATUS_VARIANT[v.status]}>{BLUEPRINT_STATUS_LABEL[v.status]}</Badge>
            </div>
            <span className="text-[11px] text-sse-muted shrink-0">{fmtDate(v.createdAt)}</span>
          </div>

          {v.changelog && (
            <p className="text-[12px] text-sse-ink mt-1.5">{v.changelog}</p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
            <span className="text-[11px] text-sse-muted">Por {v.createdByName}</span>
            {v.publishedAt && (
              <span className="text-[11px] text-sse-muted">
                Publicado: {fmtDate(v.publishedAt)}
              </span>
            )}
            {v.deprecatedAt && (
              <span className="text-[11px] text-sse-muted">
                Deprecado: {fmtDate(v.deprecatedAt)}
              </span>
            )}
            {v.archivedAt && (
              <span className="text-[11px] text-sse-muted">
                Archivado: {fmtDate(v.archivedAt)}
              </span>
            )}
            <span className="text-[11px] text-sse-muted">
              {v.instanceCount} {v.instanceCount === 1 ? "instancia" : "instancias"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
