"use client";

import { useRouter } from "next/navigation";
import { usePMEActividad, usePMEActividadActions, usePMEHistorial } from "@/hooks/usePME";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  wsId: string;
  actividadId: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 space-y-3">
      <h2 className="text-[12px] font-semibold text-sse-muted uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[12px] text-sse-muted w-36 shrink-0">{label}</span>
      <span className="text-[13px] text-sse-ink">{value || "—"}</span>
    </div>
  );
}

export function ActividadDetail({ wsId, actividadId }: Props) {
  const router = useRouter();
  const { data: actividad, isLoading }   = usePMEActividad(actividadId);
  const { data: historial }              = usePMEHistorial(actividadId, "actividad");
  const { archivar, activar, duplicar }  = usePMEActividadActions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-md" />
      </div>
    );
  }

  if (!actividad) {
    return <div className="text-[13px] text-sse-muted">Actividad no encontrada.</div>;
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[12px] text-sse-muted">{actividad.code}</p>
          <h1 className="text-[20px] font-semibold text-sse-ink">{actividad.name}</h1>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              actividad.active
                ? "bg-sse-sem-green-bg text-sse-sem-green-fg border border-sse-sem-green-border"
                : "bg-sse-border/60 text-sse-muted"
            }`}
          >
            {actividad.active ? "Activo" : "Archivado"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicar.mutate({ id: actividadId })}
            disabled={duplicar.isPending}
          >
            Duplicar
          </Button>
          {actividad.active ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => archivar.mutate({ id: actividadId })}
              disabled={archivar.isPending}
            >
              Archivar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => activar.mutate({ id: actividadId })}
              disabled={activar.isPending}
            >
              Activar
            </Button>
          )}
        </div>
      </div>

      <Section title="Identificación">
        <DataRow label="Código"      value={actividad.code} />
        <DataRow label="Versión"     value={actividad.version} />
        <DataRow label="Descripción" value={actividad.description} />
      </Section>

      <Section title="Jerarquía">
        <DataRow label="Proceso ID"       value={actividad.procesoId} />
        <DataRow label="Procedimiento ID" value={actividad.procedimientoId} />
      </Section>

      <Section title="Clasificación">
        <DataRow label="Periodicidad" value={actividad.periodicidad} />
        <DataRow label="Objetivo"     value={actividad.objetivo} />
        <DataRow label="Duración"     value={actividad.duracion ? String(actividad.duracion) : undefined} />
      </Section>

      <Section title="Responsables">
        <DataRow label="Cargo"   value={actividad.responsiblePosition} />
        <DataRow label="Usuario" value={actividad.responsibleUser} />
      </Section>

      <Section title="Historial de Cambios">
        {(historial ?? []).length === 0 ? (
          <p className="text-[12px] text-sse-muted">Sin registros.</p>
        ) : (
          <div className="space-y-2">
            {(historial ?? []).slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-start gap-3">
                <span className="text-[11px] text-sse-muted w-32 shrink-0">
                  {new Date(h.createdAt).toLocaleDateString("es-SV")}
                </span>
                <span className="text-[12px] font-medium text-sse-ink capitalize">{h.accion}</span>
                <span className="text-[12px] text-sse-muted">{h.usuario}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    </div>
  );
}
