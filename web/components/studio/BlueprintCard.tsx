"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn, fmtDate } from "@/lib/utils";
import { MaturityBadge } from "./MaturityBadge";
import { BLUEPRINT_STATUS_VARIANT, BLUEPRINT_STATUS_LABEL } from "@/lib/studio/blueprintStatusConfig";
import type { BlueprintMetadata } from "@/types/studio";

interface BlueprintCardProps {
  blueprint: BlueprintMetadata;
}

export function BlueprintCard({ blueprint }: BlueprintCardProps) {
  const updatedDate = fmtDate(blueprint.updatedAt);

  return (
    <Link
      href={`/studio/registry/${blueprint.id}`}
      className={cn(
        "block bg-sse-surface border border-sse-border rounded-md p-4",
        "hover:border-sse-primary transition-colors",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="gray">{blueprint.category}</Badge>
          <Badge variant={BLUEPRINT_STATUS_VARIANT[blueprint.status]}>{BLUEPRINT_STATUS_LABEL[blueprint.status]}</Badge>
        </div>
        <MaturityBadge level={blueprint.maturityLevel} />
      </div>

      <h3 className="text-[14px] font-semibold text-sse-ink leading-snug mb-1">
        {blueprint.nombre}
      </h3>

      {blueprint.description && (
        <p className="text-[12px] text-sse-muted line-clamp-2 mb-3">
          {blueprint.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-sse-border">
        <div className="space-y-0.5">
          <p className="text-[11px] text-sse-muted">
            <span className="text-sse-ink font-medium">{blueprint.ownerName}</span>
            {" · "}v{blueprint.currentVersion}
          </p>
          <p className="text-[11px] text-sse-muted">
            {blueprint.totalInstances} instancias
            {blueprint.activeInstances > 0 && (
              <span className="text-sse-sem-green-fg"> · {blueprint.activeInstances} activas</span>
            )}
          </p>
        </div>
        <p className="text-[11px] text-sse-muted shrink-0">{updatedDate}</p>
      </div>
    </Link>
  );
}
