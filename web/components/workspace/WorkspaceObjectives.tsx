"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ObjetivoEstrategico } from "@/types/entities";
import { useObjetivos, useObjetivosActions } from "@/hooks/useObjetivos";
import { usePlanes } from "@/hooks/usePlanes";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField } from "@/components/ui/drawer";

interface WorkspaceObjectivesProps {
  wsId: WorkspaceId;
}

function ObjetivoRow({
  objetivo,
  proyectoCount,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  canEdit,
}: {
  objetivo: ObjetivoEstrategico;
  proyectoCount: number;
  onEdit: (obj: ObjetivoEstrategico) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const isConfirming = confirmDeleteId === objetivo.id;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sse-border last:border-b-0">
      <span className="shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-sse-pill-blue-bg text-sse-pill-blue-fg">
        {objetivo.id}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-sse-ink leading-snug">{objetivo.nombre}</p>
        {objetivo.descripcion && (
          <p className="text-[12px] text-sse-muted mt-0.5 line-clamp-2">{objetivo.descripcion}</p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <Badge variant={proyectoCount > 0 ? "info" : "gray"}>
          {proyectoCount} {proyectoCount === 1 ? "proyecto" : "proyectos"}
        </Badge>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(objetivo)}
              className="px-2 py-0.5 rounded text-[11px] text-sse-primary hover:bg-sse-pill-blue-bg"
            >
              Editar
            </button>
            {isConfirming ? (
              <>
                <button
                  onClick={() => onConfirmDelete(objetivo.id)}
                  className="px-2 py-0.5 rounded text-[11px] text-sse-sem-red-fg hover:bg-sse-sem-red-bg"
                >
                  Confirmar
                </button>
                <button
                  onClick={onCancelDelete}
                  className="px-2 py-0.5 rounded text-[11px] text-sse-muted hover:bg-sse-shell-canvas"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => onDelete(objetivo.id)}
                className="px-2 py-0.5 rounded text-[11px] text-sse-muted hover:text-sse-sem-red-fg hover:bg-sse-sem-red-bg"
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkspaceObjectives({ wsId }: WorkspaceObjectivesProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ObjetivoEstrategico | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [planId, setPlanId] = useState("");
  const [resultadoEsperado, setResultadoEsperado] = useState("");

  const { data: objetivos, isLoading } = useObjetivos();
  const { data: planes } = usePlanes({ wsId });
  const actions = useObjetivosActions();
  const planOptions = (planes ?? []).map((p) => ({ value: p.id, label: p.nombre }));
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("process.edit");

  function openCreate() {
    setEditing(null);
    setNombre("");
    setDescripcion("");
    setPlanId(planOptions[0]?.value ?? "");
    setResultadoEsperado("");
    setDrawerOpen(true);
  }

  function openEdit(obj: ObjetivoEstrategico) {
    setEditing(obj);
    setNombre(obj.nombre);
    setDescripcion(obj.descripcion ?? "");
    setPlanId(obj.planId);
    setResultadoEsperado(obj.resultadoEsperado ?? "");
    setDrawerOpen(true);
  }

  async function handleSave() {
    const payload = { nombre, descripcion, planId, resultadoEsperado };
    if (editing) {
      await actions.update.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await actions.create.mutateAsync(payload as Partial<ObjetivoEstrategico>);
    }
    setDrawerOpen(false);
  }

  async function handleConfirmDelete(id: string) {
    await actions.remove.mutateAsync(id);
    setConfirmDeleteId(null);
  }

  const isPending = actions.create.isPending || actions.update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Objetivos estratégicos</h1>
        <div className="flex items-center gap-2">
          {objetivos && (
            <span className="text-[12px] text-sse-muted">
              {objetivos.length} objetivo{objetivos.length !== 1 ? "s" : ""}
            </span>
          )}
          {canEdit && (
            <Button size="sm" variant="primary" onClick={openCreate}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo objetivo
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan estratégico institucional</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          )}

          {!isLoading && (!objetivos || objetivos.length === 0) && (
            <EmptyState
              icon="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              title="Sin objetivos estratégicos"
              description="No se encontraron objetivos en el plan institucional."
              action={canEdit ? <Button size="sm" onClick={openCreate}>Crear primer objetivo</Button> : undefined}
            />
          )}

          {!isLoading && objetivos && objetivos.length > 0 && (
            <div>
              {objetivos.map((obj) => (
                <ObjetivoRow
                  key={obj.id}
                  objetivo={obj}
                  proyectoCount={0}
                  onEdit={openEdit}
                  onDelete={(id) => setConfirmDeleteId(id)}
                  confirmDeleteId={confirmDeleteId}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  onConfirmDelete={handleConfirmDelete}
                  canEdit={canEdit}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-[12px] text-sse-muted">
        Los objetivos estratégicos son compartidos entre todas las unidades.
      </p>

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar objetivo" : "Nuevo objetivo estratégico"}
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!nombre || isPending}>
              {isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear objetivo"}
            </Button>
          </>
        }
      >
        <DrawerSection>
          <DrawerField label="Plan estratégico" required>
            {planOptions.length > 0 ? (
              <Select
                value={planId}
                onValueChange={setPlanId}
                options={planOptions}
                placeholder="Seleccionar plan…"
              />
            ) : (
              <p className="text-[12px] text-sse-muted">Sin planes registrados en esta unidad.</p>
            )}
          </DrawerField>

          <DrawerField label="Nombre del objetivo" required>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Fortalecer la gestión académica"
            />
          </DrawerField>

          <DrawerField label="Descripción">
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Descripción del objetivo estratégico…"
            />
          </DrawerField>

          <DrawerField label="Resultado esperado">
            <Textarea
              value={resultadoEsperado}
              onChange={(e) => setResultadoEsperado(e.target.value)}
              rows={2}
              placeholder="Resultado concreto al lograr este objetivo…"
            />
          </DrawerField>
        </DrawerSection>
      </Drawer>
    </div>
  );
}
