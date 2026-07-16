"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBlueprintRegistry } from "@/hooks/useBlueprintRegistry";
import { cn } from "@/lib/utils";
import type { BlueprintMetadata } from "@/types/studio";

interface InstanceFactoryProps {
  blueprintId?: string;
  onClose: () => void;
  onCreated?: (instanceId: string) => void;
}

type FormState = "idle" | "submitting" | "success" | "error";

function generateId(blueprintId: string): string {
  const prefix = blueprintId.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6);
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `INST-${prefix}-${suffix}`;
}

export function InstanceFactory({ blueprintId, onClose, onCreated }: InstanceFactoryProps) {
  const { data: blueprints = [], isLoading } = useBlueprintRegistry();
  const published = blueprints.filter((b: BlueprintMetadata) => b.status === "published");

  const [selectedId, setSelectedId] = useState<string>(blueprintId ?? "");
  const [nombre, setNombre] = useState("");
  const [description, setDescription] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [result, setResult] = useState<{ id: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function validate(): string | null {
    if (!selectedId) return "Selecciona un blueprint.";
    if (!nombre.trim()) return "El nombre de la instancia es requerido.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg(null);
    setFormState("submitting");

    await new Promise((r) => setTimeout(r, 600));

    const instanceId = generateId(selectedId);
    setResult({ id: instanceId });
    setFormState("success");
    onCreated?.(instanceId);
  }

  const inputClass = cn(
    "w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2",
    "text-[13px] text-sse-ink placeholder:text-sse-muted",
    "focus:outline-none focus:ring-2 focus:ring-sse-primary/40 focus:border-sse-primary",
    "disabled:opacity-50",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md bg-sse-surface rounded-md border border-sse-border shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sse-border">
          <h2 className="text-[14px] font-semibold text-sse-ink">
            Nueva Instancia
          </h2>
          <button
            onClick={onClose}
            className="text-sse-muted hover:text-sse-ink transition-colors text-[16px] leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-5">
          {formState === "success" && result ? (
            <div className="space-y-4">
              <div className="rounded-sm bg-sse-sem-green-bg border border-sse-sem-green-border p-4">
                <p className="text-[13px] font-semibold text-sse-sem-green-fg mb-1">
                  Instancia creada
                </p>
                <p className="text-[12px] text-sse-muted font-mono">{result.id}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-sse-muted block">
                  Blueprint <span className="text-sse-sem-red-fg">*</span>
                </label>
                {isLoading ? (
                  <div className={cn(inputClass, "text-sse-muted")}>Cargando...</div>
                ) : (
                  <select
                    className={inputClass}
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={formState === "submitting" || Boolean(blueprintId)}
                  >
                    <option value="">Seleccionar blueprint...</option>
                    {published.map((b: BlueprintMetadata) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-sse-muted block">
                  Nombre de la instancia <span className="text-sse-sem-red-fg">*</span>
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ej. Contratación Docente — Plaza Ing. 2026"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={formState === "submitting"}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-sse-muted block">
                  Contexto / Descripción
                </label>
                <textarea
                  className={cn(inputClass, "resize-none")}
                  rows={3}
                  placeholder="Información adicional relevante para esta instancia..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={formState === "submitting"}
                />
              </div>

              {errorMsg && (
                <p className="text-[12px] text-sse-sem-red-fg">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={formState === "submitting"}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={formState === "submitting"}
                >
                  {formState === "submitting" ? "Creando..." : "Crear Instancia"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
