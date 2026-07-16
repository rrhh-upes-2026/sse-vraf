"use client";

import { useSession } from "next-auth/react";
import type { Evidencia } from "@/types/entities";
import { useEvidencias, useEvidenciasActions } from "@/hooks/useEvidencias";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtShortDate } from "@/lib/utils";

const ESTADO_BADGE: Record<Evidencia["estado"], BadgeVariant> = {
  pendiente:  "warning",
  cargada:    "info",
  validada:   "success",
  rechazada:  "danger",
};

const ESTADO_LABEL: Record<Evidencia["estado"], string> = {
  pendiente: "Pendiente",
  cargada:   "Cargada",
  validada:  "Validada",
  rechazada: "Rechazada",
};

const TIPO_ICON: Record<string, string> = {
  documento:    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  informe:      "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  acta:         "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  registro:     "M4 6h16M4 10h16M4 14h16M4 18h7",
  fotografia:   "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
};

const defaultIcon = "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13";

function EvidenceRow({ evidencia }: { evidencia: Evidencia }) {
  const { hasPermission } = usePermissions();
  const canUpload = hasPermission("evidence.upload");
  const canReplace = hasPermission("evidence.replace") && evidencia.estado === "cargada";

  const icon = TIPO_ICON[evidencia.tipo] ?? defaultIcon;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sse-border last:border-b-0">
      <div className="mt-0.5 w-7 h-7 rounded-sm bg-sse-pill-gray-bg flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
          className="w-4 h-4 text-sse-muted">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-sse-ink truncate">{evidencia.nombre}</p>
          {evidencia.obligatoria && (
            <span className="shrink-0 text-[10px] font-semibold text-sse-danger">*</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-sse-muted capitalize">{evidencia.tipo}</span>
          <span className="text-sse-border">·</span>
          <span className="text-[11px] text-sse-muted">v{evidencia.version}</span>
          {evidencia.fechaCarga && (
            <>
              <span className="text-sse-border">·</span>
              <span className="text-[11px] text-sse-muted">
                {fmtShortDate(evidencia.fechaCarga)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Badge variant={ESTADO_BADGE[evidencia.estado]}>{ESTADO_LABEL[evidencia.estado]}</Badge>
        {canUpload && evidencia.estado === "pendiente" && (
          <Button variant="secondary" size="sm" title="Cargar evidencia">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Cargar
          </Button>
        )}
        {canReplace && (
          <Button variant="ghost" size="sm" title="Reemplazar archivo">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
          </Button>
        )}
        {evidencia.driveFileId && (
          <Button variant="ghost" size="sm" title="Vista previa">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}

export function MyEvidences() {
  const { data: session } = useSession();
  const usuarioId = session?.user?.usuarioId;

  const { data: evidencias, isLoading } = useEvidencias(
    usuarioId ? { responsableId: usuarioId } : undefined,
  );

  const pending = evidencias?.filter((e) => e.estado !== "validada") ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mis Evidencias</CardTitle>
          {pending.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-sse-sem-amber-bg text-sse-sem-amber-fg border border-sse-sem-amber-border rounded-sm">
              {pending.filter((e) => e.estado === "pendiente").length} pendiente
              {pending.filter((e) => e.estado === "pendiente").length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        )}

        {!isLoading && pending.length === 0 && (
          <p className="text-[13px] text-sse-muted py-2">Todas las evidencias están al día.</p>
        )}

        {!isLoading && pending.length > 0 && (
          <div>
            {pending.map((e) => (
              <EvidenceRow key={e.id} evidencia={e} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
