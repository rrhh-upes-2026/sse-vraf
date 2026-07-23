"use client";

import { useState } from "react";
import { useNCETemplates, useCreateNCETemplate, useUpdateNCETemplate } from "@/hooks/useNCE";
import type { NCETemplateType, NCEChannel, NCETemplate } from "@/types/nce";

const TYPE_LABELS: Record<NCETemplateType, string> = {
  alerta_plan:         "Alerta de Plan",
  tarea_vencida:       "Tarea Vencida",
  nueva_recomendacion: "Nueva Recomendación",
  diagnostico_nuevo:   "Diagnóstico Nuevo",
  hito_completado:     "Hito Completado",
  regla_activada:      "Regla Activada",
  evidencia_nueva:     "Evidencia Nueva",
  resumen_diario:      "Resumen Diario",
};

const CHANNEL_LABELS: Record<NCEChannel, string> = {
  interna:     "Interna",
  correo:      "Correo",
  google_chat: "Google Chat",
};

function TemplateCard({
  tpl,
  onEdit,
}: {
  tpl: NCETemplate;
  onEdit: (t: NCETemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border ${tpl.enabled ? "border-sse-border" : "border-dashed border-sse-border opacity-60"} bg-sse-surface`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-sse-border/30 transition-colors"
      >
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-sse-ink truncate">{tpl.name}</p>
            {!tpl.enabled && (
              <span className="text-[10px] px-1.5 rounded bg-gray-200 text-gray-500">inactivo</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-sse-muted">
            <span className="rounded-full bg-sky-100 text-sky-700 px-2 py-0.5">
              {TYPE_LABELS[tpl.type] ?? tpl.type}
            </span>
            <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">
              {CHANNEL_LABELS[tpl.channel] ?? tpl.channel}
            </span>
            <span>v{tpl.version}</span>
            <span>{tpl.usageCount} usos</span>
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-sse-muted">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-sse-border space-y-3 pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-1">Asunto</p>
            <p className="text-[12px] text-sse-ink font-mono bg-sse-border/30 rounded px-2 py-1">{tpl.subject}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-1">Cuerpo</p>
            <p className="text-[12px] text-sse-ink font-mono bg-sse-border/30 rounded px-2 py-2 whitespace-pre-wrap">{tpl.body}</p>
          </div>
          {tpl.variables.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-1">Variables</p>
              <div className="flex flex-wrap gap-1">
                {tpl.variables.map((v) => (
                  <code key={v} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => onEdit(tpl)}
            className="text-[11px] px-3 py-1 rounded border border-sky-300 text-sky-600 hover:bg-sky-50"
          >
            Editar template
          </button>
        </div>
      )}
    </div>
  );
}

function TemplateForm({
  initial,
  onClose,
}: {
  initial?: NCETemplate;
  onClose: () => void;
}) {
  const create = useCreateNCETemplate();
  const update = useUpdateNCETemplate();

  const [form, setForm] = useState({
    name:      initial?.name    ?? "",
    type:      initial?.type    ?? "alerta_plan" as NCETemplateType,
    channel:   initial?.channel ?? "interna" as NCEChannel,
    subject:   initial?.subject ?? "",
    body:      initial?.body    ?? "",
    variables: initial?.variables.join(", ") ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const vars = form.variables.split(",").map((v) => v.trim()).filter(Boolean);
    if (initial) {
      update.mutate(
        { id: initial.id, name: form.name, subject: form.subject, body: form.body, variables: vars },
        { onSuccess: onClose }
      );
    } else {
      create.mutate(
        { name: form.name, type: form.type, channel: form.channel, subject: form.subject, body: form.body, variables: vars },
        { onSuccess: onClose }
      );
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-sky-300 bg-sky-50/30 p-4 space-y-3">
      <p className="text-[13px] font-semibold text-sse-ink">{initial ? "Editar Template" : "Nuevo Template"}</p>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">Nombre</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
        </div>
        {!initial && (
          <>
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as NCETemplateType })}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink">
                {(Object.keys(TYPE_LABELS) as NCETemplateType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-sse-muted mb-0.5">Canal</label>
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as NCEChannel })}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink">
                <option value="interna">Interna</option>
                <option value="correo">Correo (contrato)</option>
                <option value="google_chat">Google Chat (contrato)</option>
              </select>
            </div>
          </>
        )}
      </div>
      <div>
        <label className="block text-[11px] text-sse-muted mb-0.5">Asunto</label>
        <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink font-mono"
          placeholder="Ej: Alerta: Plan {{planId}} requiere atención" />
      </div>
      <div>
        <label className="block text-[11px] text-sse-muted mb-0.5">Cuerpo</label>
        <textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
          className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink font-mono resize-y"
          placeholder="Usa {{variable}} para valores dinámicos" />
      </div>
      <div>
        <label className="block text-[11px] text-sse-muted mb-0.5">Variables (separadas por coma)</label>
        <input value={form.variables} onChange={(e) => setForm({ ...form, variables: e.target.value })}
          className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
          placeholder="planId, priority, detail" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending}
          className="text-[12px] px-4 py-1.5 rounded bg-[#0369A1] text-white hover:bg-sky-700 disabled:opacity-50">
          {isPending ? "Guardando…" : initial ? "Guardar cambios" : "Crear template"}
        </button>
        <button type="button" onClick={onClose}
          className="text-[12px] px-3 py-1.5 rounded border border-sse-border text-sse-muted hover:text-sse-ink">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function NCETemplates({ wsId }: { wsId: string }) {
  void wsId;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<NCETemplate | null>(null);
  const [typeFilter, setTypeFilter] = useState<NCETemplateType | "">("");

  const params = typeFilter ? { type: typeFilter } : {};
  const { data = [], isLoading } = useNCETemplates(params);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as NCETemplateType | "")}
          className="text-[12px] rounded-md border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
        >
          <option value="">Todos los tipos</option>
          {(Object.entries(TYPE_LABELS) as [NCETemplateType, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="text-[12px] px-4 py-1.5 rounded bg-[#0369A1] text-white hover:bg-sky-700"
        >
          + Nuevo template
        </button>
      </div>

      {/* Create/edit form */}
      {(showForm || editing) && (
        <TemplateForm
          initial={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {isLoading && (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-sse-border" />
          ))}
        </div>
      )}

      {!isLoading && data.length === 0 && (
        <p className="text-center text-[13px] text-sse-muted py-8">No hay templates</p>
      )}

      <div className="space-y-2">
        {data.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            onEdit={(t) => { setEditing(t); setShowForm(false); }}
          />
        ))}
      </div>
    </div>
  );
}
