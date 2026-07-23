"use client";

import { useState } from "react";
import { useIIAConversations, useIIAConversation, useDeleteIIAConversation } from "@/hooks/useIIA";

const USER_ID = "current-user";

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

export function IIAConversations({ wsId }: { wsId: string }) {
  void wsId;
  const [selected, setSelected] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const { data: conversations, isLoading } = useIIAConversations({ userId: USER_ID });
  const { data: detail, isLoading: loadingDetail } = useIIAConversation(selected ?? "");
  const deleteConv = useDeleteIIAConversation();

  async function confirmDelete() {
    if (!toDelete) return;
    await deleteConv.mutateAsync(toDelete);
    if (selected === toDelete) setSelected(null);
    setToDelete(null);
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-sse-border" />)}
      </div>
    );
  }

  const list = conversations ?? [];

  return (
    <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[400px]">
      {/* List */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-1 overflow-y-auto">
        {list.length === 0 && (
          <p className="text-[12px] text-sse-muted text-center mt-8">No hay conversaciones.</p>
        )}
        {list.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`rounded-lg border cursor-pointer px-3 py-2.5 ${
              c.id === selected
                ? "border-indigo-400 bg-indigo-50/60"
                : "border-sse-border bg-sse-surface hover:border-indigo-300"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-sse-ink truncate">{c.title}</p>
                <p className="text-[10px] text-sse-muted mt-0.5 truncate">{c.lastMessage}</p>
                <p className="text-[10px] text-sse-muted mt-0.5">
                  {c.messageCount} mensajes · {fmtDate(c.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setToDelete(c.id); }}
                className="flex-shrink-0 text-sse-muted hover:text-red-500 p-1"
                title="Eliminar"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div className="flex-1 min-w-0 rounded-lg border border-sse-border bg-sse-surface overflow-hidden flex flex-col">
        {!selected && (
          <div className="flex-1 flex items-center justify-center text-sse-muted text-[12px]">
            Selecciona una conversación para ver sus mensajes.
          </div>
        )}
        {selected && loadingDetail && (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        )}
        {selected && detail && !loadingDetail && (
          <>
            <div className="px-4 py-3 border-b border-sse-border">
              <p className="text-[13px] font-semibold text-sse-ink">{detail.title}</p>
              <p className="text-[10px] text-sse-muted">{detail.messageCount} mensajes · Expira: {fmtDate(detail.expiresAt)}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {detail.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-xl px-3 py-2 text-[11px] ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-sse-border text-sse-ink"
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-0.5 ${msg.role === "user" ? "text-indigo-200" : "text-sse-muted"}`}>
                      {fmtDate(msg.timestamp)}
                      {msg.tokensOut ? ` · ${msg.tokensIn}↑ ${msg.tokensOut}↓` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {toDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-sse-surface rounded-xl border border-sse-border p-6 w-80 space-y-4">
            <p className="text-[13px] font-semibold text-sse-ink">¿Eliminar conversación?</p>
            <p className="text-[12px] text-sse-muted">Esta acción es irreversible. Se eliminarán todos los mensajes.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setToDelete(null)} className="text-[12px] px-4 py-1.5 rounded border border-sse-border text-sse-ink hover:bg-sse-border">
                Cancelar
              </button>
              <button onClick={() => void confirmDelete()} disabled={deleteConv.isPending} className="text-[12px] px-4 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {deleteConv.isPending ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
