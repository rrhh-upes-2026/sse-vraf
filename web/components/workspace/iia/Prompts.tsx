"use client";

import { useState } from "react";
import { useIIAPrompts, useUpdateIIAPrompt } from "@/hooks/useIIA";
import type { IIAPromptTemplate } from "@/types/iia";

const TYPE_LABELS: Record<string, string> = {
  institutional:  "Institucional",
  executive:      "Ejecutivo",
  analytical:     "Analítico",
  operational:    "Operacional",
  administrative: "Administrativo",
};

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

function PromptEditor({ prompt, onClose }: { prompt: IIAPromptTemplate; onClose: () => void }) {
  const [content, setContent] = useState(prompt.content);
  const [saved, setSaved] = useState(false);
  const update = useUpdateIIAPrompt();

  async function handleSave() {
    await update.mutateAsync({ id: prompt.id, content, version: prompt.version + 1 });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-sse-surface rounded-xl border border-sse-border w-full max-w-2xl flex flex-col" style={{ maxHeight: "80vh" }}>
        <div className="px-5 py-4 border-b border-sse-border flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-sse-ink">{prompt.name}</p>
            <p className="text-[10px] text-sse-muted">Tipo: {TYPE_LABELS[prompt.type] ?? prompt.type} · v{prompt.version}</p>
          </div>
          <button onClick={onClose} className="text-sse-muted hover:text-sse-ink">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {saved && (
            <div className="mb-3 rounded border border-green-200 bg-green-50/40 px-3 py-2 text-[11px] text-green-700">
              ✓ Prompt guardado correctamente.
            </div>
          )}
          <p className="text-[11px] text-sse-muted mb-1.5">Contenido del prompt (Markdown soportado)</p>
          <textarea
            rows={18}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-[11px] font-mono rounded border border-sse-border px-3 py-2 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <p className="text-[10px] text-sse-muted mt-1">{content.length} caracteres</p>
        </div>

        <div className="px-5 py-3 border-t border-sse-border flex justify-end gap-2">
          <button onClick={onClose} className="text-[12px] px-4 py-1.5 rounded border border-sse-border text-sse-ink hover:bg-sse-border">
            Cancelar
          </button>
          <button onClick={() => void handleSave()} disabled={update.isPending} className="text-[12px] px-5 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium">
            {update.isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function IIAPrompts({ wsId }: { wsId: string }) {
  void wsId;
  const [editing, setEditing] = useState<IIAPromptTemplate | null>(null);
  const { data: prompts, isLoading } = useIIAPrompts();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-sse-border" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-sse-muted">
        Los prompts institucionales guían el comportamiento del asistente Gemini para cada contexto.
        Modificarlos afecta a todas las conversaciones futuras de ese tipo.
      </p>

      {(prompts ?? []).map((p) => (
        <div key={p.id} className="rounded-lg border border-sse-border bg-sse-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 rounded px-2 py-0.5">
                  {TYPE_LABELS[p.type] ?? p.type}
                </span>
                <span className="text-[10px] text-sse-muted">v{p.version}</span>
              </div>
              <p className="text-[12px] font-medium text-sse-ink">{p.name}</p>
              <p className="text-[11px] text-sse-muted mt-1 line-clamp-2 font-mono">{p.content.slice(0, 120)}…</p>
              <p className="text-[10px] text-sse-muted mt-1.5">
                Actualizado: {fmtDate(p.updatedAt)} por {p.updatedBy || "—"}
              </p>
            </div>
            <button
              onClick={() => setEditing(p)}
              className="flex-shrink-0 text-[11px] rounded border border-indigo-300 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 font-medium"
            >
              Editar
            </button>
          </div>
        </div>
      ))}

      {editing && <PromptEditor prompt={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
