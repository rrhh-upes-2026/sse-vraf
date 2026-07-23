"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePMEProceso, usePMEProcesoActions, usePMECatalogosPorTipo } from "@/hooks/usePME";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PMEProceso } from "@/types/pme";

interface Props {
  wsId: string;
  procesoId: string;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-sse-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function ProcesoEditForm({ wsId, procesoId }: Props) {
  const router = useRouter();
  const { data: proceso, isLoading } = usePMEProceso(procesoId);
  const { update }                   = usePMEProcesoActions();

  const { data: tipos }        = usePMECatalogosPorTipo("tipoProceso");
  const { data: periodicidades } = usePMECatalogosPorTipo("periodicidad");

  const [form, setForm] = useState<Partial<PMEProceso> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (proceso && !form) setForm({ ...proceso });
  }, [proceso, form]);

  function patch(updates: Partial<PMEProceso>) {
    setForm((prev) => (prev ? { ...prev, ...updates } : updates));
    setError(null);
  }

  function submit() {
    if (!form) return;
    if (!form.code?.trim() || !form.name?.trim()) {
      setError("Código y nombre son requeridos.");
      return;
    }
    update.mutate(
      { id: procesoId, patch: form },
      {
        onSuccess: () => router.push(`/ws/${wsId}/procesos-pme/${procesoId}`),
        onError: (err) => setError(err instanceof Error ? err.message : String(err)),
      },
    );
  }

  if (isLoading || !form) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 rounded-md" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Editar Proceso</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          {proceso?.code} — {proceso?.name}
        </p>
      </div>

      <div className="bg-sse-surface border border-sse-border rounded-md p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Código" required>
            <Input
              value={form.code ?? ""}
              onChange={(e) => patch({ code: e.target.value.toUpperCase() })}
            />
          </Field>
          <Field label="Versión">
            <Input value={form.version ?? ""} onChange={(e) => patch({ version: e.target.value })} />
          </Field>
        </div>

        <Field label="Nombre" required>
          <Input
            value={form.name ?? ""}
            onChange={(e) => patch({ name: e.target.value })}
            maxLength={120}
          />
        </Field>

        <Field label="Descripción">
          <textarea
            value={form.description ?? ""}
            onChange={(e) => patch({ description: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo de Proceso">
            <Select
              value={form.tipoProcesoId ?? ""}
              onValueChange={(v) => patch({ tipoProcesoId: v })}
              options={[
                { value: "", label: "Sin tipo" },
                ...(tipos ?? []).map((t) => ({ value: t.id, label: t.nombre })),
              ]}
            />
          </Field>
          <Field label="Periodicidad">
            <Select
              value={form.periodicidad ?? ""}
              onValueChange={(v) => patch({ periodicidad: v })}
              options={[
                { value: "", label: "Sin periodicidad" },
                ...(periodicidades ?? []).map((p) => ({ value: p.nombre, label: p.nombre })),
              ]}
            />
          </Field>
        </div>

        <Field label="Objetivo">
          <textarea
            value={form.objetivo ?? ""}
            onChange={(e) => patch({ objetivo: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cargo Responsable">
            <Input
              value={form.responsiblePosition ?? ""}
              onChange={(e) => patch({ responsiblePosition: e.target.value })}
            />
          </Field>
          <Field label="Usuario Responsable">
            <Input
              value={form.responsibleUser ?? ""}
              onChange={(e) => patch({ responsibleUser: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Observaciones">
          <textarea
            value={form.observations ?? ""}
            onChange={(e) => patch({ observations: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-md border border-sse-sem-red-border bg-sse-sem-red-bg px-3 py-2 text-[12px] text-sse-sem-red-fg">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button size="sm" onClick={submit} disabled={update.isPending}>
          {update.isPending ? "Guardando…" : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
