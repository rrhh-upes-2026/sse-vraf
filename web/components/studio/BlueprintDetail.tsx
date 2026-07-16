"use client";

import { useState } from "react";
import Link from "next/link";
import { useBlueprint, useBlueprintLifecycle } from "@/hooks/useBlueprintRegistry";
import { useInstanceSummaries } from "@/hooks/useRuntimeMonitor";
import { useWorkflowBlueprint } from "@/hooks/useWorkflow";
import { validateBlueprint } from "@/lib/studio/blueprintValidator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VersionHistory } from "./VersionHistory";
import { ValidationReportView } from "./ValidationReportView";
import { DependencyView } from "./DependencyView";
import { DependencyGraph } from "./DependencyGraph";
import { BlueprintLifecycleActions } from "./BlueprintLifecycleActions";
import { MaturityBadge } from "./MaturityBadge";
import { MaturitySelector } from "./MaturitySelector";
import { ImpactAnalysis } from "./ImpactAnalysis";
import { cn, fmtDate } from "@/lib/utils";
import { buildDependencyGraph } from "@/lib/studio/dependencyResolver";
import { useBlueprintRegistry } from "@/hooks/useBlueprintRegistry";
import { BLUEPRINT_STATUS_VARIANT, BLUEPRINT_STATUS_LABEL } from "@/lib/studio/blueprintStatusConfig";
import { WORKFLOW_STATE_LABEL, WORKFLOW_STATE_VARIANT } from "@/lib/workflowStateConfig";
import type { BlueprintLifecycleTransition, ValidationReport } from "@/types/studio";

type Tab = "resumen" | "versiones" | "validacion" | "impacto" | "dependencias" | "instancias";

const TABS: { id: Tab; label: string }[] = [
  { id: "resumen",      label: "Resumen" },
  { id: "versiones",    label: "Versiones" },
  { id: "validacion",   label: "Validación" },
  { id: "impacto",      label: "Impacto" },
  { id: "dependencias", label: "Dependencias" },
  { id: "instancias",   label: "Instancias" },
];

interface BlueprintDetailProps {
  blueprintId: string;
}

export function BlueprintDetail({ blueprintId }: BlueprintDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("resumen");
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { data: blueprint, isLoading, isError } = useBlueprint(blueprintId);
  const { data: processBlueprint } = useWorkflowBlueprint(blueprintId);
  const { transition, setMaturity } = useBlueprintLifecycle(blueprintId);
  const { data: instances = [] } = useInstanceSummaries(blueprintId);
  const { data: allBlueprints = [] } = useBlueprintRegistry();

  const handleTransition = async (action: BlueprintLifecycleTransition) => {
    if (!blueprint) return;
    await transition.mutateAsync({ blueprint, action });
  };

  const handleRunValidation = () => {
    if (!processBlueprint) return;
    setIsValidating(true);
    setTimeout(() => {
      const report = validateBlueprint(processBlueprint, new Date().toISOString());
      setValidationReport(report);
      setIsValidating(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-sm" />)}
        </div>
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
    );
  }

  if (isError || !blueprint) {
    return (
      <div className="py-12 text-center">
        <p className="text-[14px] text-sse-muted">No se encontró el blueprint.</p>
        <Link href="/studio/registry" className="text-[13px] text-sse-primary hover:underline mt-2 inline-block">
          Volver al registro
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href="/studio/registry"
        className="inline-flex items-center gap-1 text-[12px] text-sse-muted hover:text-sse-ink transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Blueprint Registry
      </Link>

      <div className="bg-sse-surface border border-sse-border rounded-md p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="gray">{blueprint.category}</Badge>
              <Badge variant={BLUEPRINT_STATUS_VARIANT[blueprint.status]}>{BLUEPRINT_STATUS_LABEL[blueprint.status]}</Badge>
              <MaturityBadge level={blueprint.maturityLevel} />
            </div>
            <h1 className="text-[20px] font-semibold text-sse-ink">{blueprint.nombre}</h1>
            <p className="text-[12px] text-sse-muted mt-0.5 font-mono">{blueprint.id}</p>
          </div>
          <MaturitySelector
            current={blueprint.maturityLevel}
            onChange={(level) => setMaturity.mutateAsync(level).then(() => {})}
            isLoading={setMaturity.isPending}
          />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
          <span className="text-[12px] text-sse-muted">
            Propietario: <span className="text-sse-ink">{blueprint.ownerName}</span>
          </span>
          <span className="text-[12px] text-sse-muted">
            Versión actual: <span className="text-sse-ink font-mono">v{blueprint.currentVersion}</span>
          </span>
          {blueprint.publishedVersion && (
            <span className="text-[12px] text-sse-muted">
              Versión publicada: <span className="text-sse-ink font-mono">v{blueprint.publishedVersion}</span>
            </span>
          )}
          <span className="text-[12px] text-sse-muted">
            Actualizado: <span className="text-sse-ink">{fmtDate(blueprint.updatedAt)}</span>
          </span>
          <span className="text-[12px] text-sse-muted">
            Creado: <span className="text-sse-ink">{fmtDate(blueprint.createdAt)}</span>
          </span>
        </div>

        {transition.isPending || transition.isError ? (
          <div className="mt-4">
            {transition.isPending && (
              <p className="text-[12px] text-sse-muted">Aplicando transición…</p>
            )}
            {transition.isError && (
              <p className="text-[12px] text-sse-sem-red-fg">
                Error: {transition.error instanceof Error ? transition.error.message : "Ocurrió un error."}
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-4 pt-4 border-t border-sse-border">
          <BlueprintLifecycleActions
            blueprint={blueprint}
            onTransition={handleTransition}
            isLoading={transition.isPending}
          />
        </div>
      </div>

      <div>
        <div className="flex border-b border-sse-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-sse-primary text-sse-primary"
                  : "border-transparent text-sse-muted hover:text-sse-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-sse-surface border border-sse-border border-t-0 rounded-b-md p-5">
          {activeTab === "resumen" && (
            <div className="space-y-4">
              {blueprint.description && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted mb-1">Descripción</p>
                  <p className="text-[13px] text-sse-ink">{blueprint.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] text-sse-muted">Categoría</p>
                  <p className="text-[13px] font-medium text-sse-ink">{blueprint.category}</p>
                </div>
                <div>
                  <p className="text-[11px] text-sse-muted">Unidad</p>
                  <p className="text-[13px] font-medium text-sse-ink">{blueprint.unidadId}</p>
                </div>
                <div>
                  <p className="text-[11px] text-sse-muted">Total instancias</p>
                  <p className="text-[20px] font-semibold text-sse-ink">{blueprint.totalInstances}</p>
                </div>
                <div>
                  <p className="text-[11px] text-sse-muted">Activas</p>
                  <p className="text-[20px] font-semibold text-sse-sem-green-fg">{blueprint.activeInstances}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-sse-muted">Versiones</p>
                <p className="text-[13px] font-medium text-sse-ink">{blueprint.versions.length}</p>
              </div>
            </div>
          )}

          {activeTab === "versiones" && (
            <VersionHistory versions={blueprint.versions} />
          )}

          {activeTab === "validacion" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRunValidation}
                  disabled={isValidating || !processBlueprint}
                >
                  {isValidating ? "Validando…" : "Ejecutar validación"}
                </Button>
                {!processBlueprint && (
                  <p className="text-[12px] text-sse-muted">
                    El blueprint de proceso no está disponible para validar.
                  </p>
                )}
              </div>
              <ValidationReportView report={validationReport} isRunning={isValidating} />
            </div>
          )}

          {activeTab === "impacto" && (
            <ImpactAnalysis
              blueprint={blueprint}
              allBlueprints={allBlueprints}
              instances={instances}
              allBlueprintNames={Object.fromEntries(allBlueprints.map((b) => [b.id, b.nombre]))}
            />
          )}

          {activeTab === "dependencias" && (
            <div className="space-y-4">
              <DependencyGraph
                graph={buildDependencyGraph(blueprint, allBlueprints)}
                allBlueprintNames={Object.fromEntries(allBlueprints.map((b) => [b.id, b.nombre]))}
              />
              <details className="text-[12px]">
                <summary className="cursor-pointer text-sse-muted hover:text-sse-ink">
                  Ver lista de dependencias
                </summary>
                <div className="mt-2">
                  <DependencyView blueprint={blueprint} />
                </div>
              </details>
            </div>
          )}

          {activeTab === "instancias" && (
            <div>
              {instances.length === 0 ? (
                <p className="text-[13px] text-sse-muted py-4">No hay instancias para este blueprint.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-sse-border">
                        <th className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-sse-muted">Nombre</th>
                        <th className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-sse-muted">Estado</th>
                        <th className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-sse-muted">Etapa actual</th>
                        <th className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-sse-muted">Asignado a</th>
                        <th className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-sse-muted">Iniciado</th>
                        <th className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-sse-muted">Actualizado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sse-border">
                      {instances.map((inst) => (
                        <tr key={inst.id} className="hover:bg-sse-border transition-colors">
                          <td className="py-2.5 pr-4 text-[12px] font-medium text-sse-ink">{inst.nombre}</td>
                          <td className="py-2.5 pr-4">
                            <Badge variant={WORKFLOW_STATE_VARIANT[inst.estado] ?? "gray"}>
                              {WORKFLOW_STATE_LABEL[inst.estado] ?? inst.estado}
                            </Badge>
                          </td>
                          <td className="py-2.5 pr-4 text-[12px] text-sse-muted">{inst.currentStageLabel}</td>
                          <td className="py-2.5 pr-4 text-[12px] text-sse-muted">{inst.assigneeName ?? "—"}</td>
                          <td className="py-2.5 pr-4 text-[12px] text-sse-muted">{fmtDate(inst.startedAt)}</td>
                          <td className="py-2.5 text-[12px] text-sse-muted">{fmtDate(inst.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
