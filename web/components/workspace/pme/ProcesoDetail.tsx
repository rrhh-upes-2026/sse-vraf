"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePMEProceso, usePMEProcesoActions, usePMEHistorial, usePMEProcedimientos } from "@/hooks/usePME";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  wsId: string;
  procesoId: string;
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

export function ProcesoDetail({ wsId, procesoId }: Props) {
  const router = useRouter();
  const { data: proceso, isLoading }      = usePMEProceso(procesoId);
  const { data: historial }               = usePMEHistorial(procesoId, "proceso");
  const { data: procedimientos }          = usePMEProcedimientos({ procesoId });
  const { archivar, activar, duplicar }   = usePMEProcesoActions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-md" />
      </div>
    );
  }

  if (!proceso) {
    return (
      <div className="text-[13px] text-sse-muted">Proceso no encontrado.</div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[12px] text-sse-muted">{proceso.code}</p>
          <h1 className="text-[20px] font-semibold text-sse-ink">{proceso.name}</h1>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              proceso.active
                ? "bg-sse-sem-green-bg text-sse-sem-green-fg border border-sse-sem-green-border"
                : "bg-sse-border/60 text-sse-muted"
            }`}
          >
            {proceso.active ? "Activo" : "Archivado"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicar.mutate({ id: procesoId })}
            disabled={duplicar.isPending}
          >
            Duplicar
          </Button>
          {proceso.active ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => archivar.mutate({ id: procesoId })}
              disabled={archivar.isPending}
            >
              Archivar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => activar.mutate({ id: procesoId })}
              disabled={activar.isPending}
            >
              Activar
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => router.push(`/ws/${wsId}/procesos-pme/${procesoId}/editar`)}
          >
            Editar
          </Button>
        </div>
      </div>

      {/* Data */}
      <Section title="Identificación">
        <DataRow label="Código"      value={proceso.code} />
        <DataRow label="Versión"     value={proceso.version} />
        <DataRow label="Descripción" value={proceso.description} />
      </Section>

      <Section title="Clasificación">
        <DataRow label="Periodicidad" value={proceso.periodicidad} />
        <DataRow label="Objetivo"     value={proceso.objetivo} />
      </Section>

      <Section title="Responsables">
        <DataRow label="Cargo"   value={proceso.responsiblePosition} />
        <DataRow label="Usuario" value={proceso.responsibleUser} />
      </Section>

      {/* Procedimientos */}
      <Section title={`Procedimientos (${(procedimientos ?? []).length})`}>
        {(procedimientos ?? []).length === 0 ? (
          <p className="text-[12px] text-sse-muted">Sin procedimientos registrados.</p>
        ) : (
          <div className="space-y-1">
            {(procedimientos ?? []).slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center gap-2 py-1">
                <span
                  className={`w-2 h-2 rounded-full ${p.active ? "bg-sse-sem-green-fg" : "bg-sse-border"}`}
                />
                <span className="font-mono text-[11px] text-sse-muted w-24">{p.code}</span>
                <span className="text-[13px] text-sse-ink">{p.name}</span>
              </div>
            ))}
          </div>
        )}
        <Link
          href={`/ws/${wsId}/procedimientos/nuevo?procesoId=${procesoId}`}
          className="inline-flex items-center gap-1 text-[12px] text-sse-primary hover:underline mt-1"
        >
          + Agregar procedimiento
        </Link>
      </Section>

      {/* Historial */}
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
