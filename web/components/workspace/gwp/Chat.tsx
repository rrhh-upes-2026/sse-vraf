"use client";

import { useState } from "react";
import {
  useGWPSpaces as useGWPListSpaces, useGWPSendChatMessage, useGWPCreateChatCard as useGWPCreateCard,
  useGWPReplyToSpace, useGWPChatLogs,
} from "@/hooks/useGWP";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

export function GWPChat({ wsId }: { wsId: string }) {
  void wsId;
  const [userId, setUserId]   = useState("");
  const [tab, setTab]         = useState<"spaces" | "message" | "card" | "logs">("spaces");

  const [selectedSpace, setSelectedSpace] = useState("");
  const [messageText, setMessageText]     = useState("");
  const [replyTo, setReplyTo]             = useState("");

  const [cardTitle, setCardTitle]   = useState("");
  const [cardBody, setCardBody]     = useState("");
  const [cardImage, setCardImage]   = useState("");
  const [cardSpace, setCardSpace]   = useState("");

  const { data: spaces = [], isLoading: spacesLoading } = useGWPListSpaces(userId);
  const { data: logs = [],   isLoading: logsLoading }   = useGWPChatLogs({ userId: userId || undefined });

  const sendMessage  = useGWPSendChatMessage();
  const createCard   = useGWPCreateCard();
  const replyToSpace = useGWPReplyToSpace();

  async function handleSendMessage() {
    if (replyTo) {
      await replyToSpace.mutateAsync({ userId, spaceId: selectedSpace, threadKey: replyTo, text: messageText });
    } else {
      await sendMessage.mutateAsync({ userId, spaceId: selectedSpace, text: messageText });
    }
    setMessageText(""); setReplyTo("");
  }

  async function handleCreateCard() {
    await createCard.mutateAsync({
      userId,
      spaceId: cardSpace || selectedSpace,
      card: {
        title:    cardTitle,
        subtitle: cardBody,
      },
    });
    setCardTitle(""); setCardBody(""); setCardImage("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sse-border bg-sse-surface px-4 py-3">
        <label className="block text-[11px] text-sse-muted mb-1">ID de usuario Google</label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="sub de Google OAuth"
          className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-green-400" />
      </div>

      <div className="flex rounded border border-sse-border overflow-hidden text-[11px]">
        {(["spaces", "message", "card", "logs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-2 py-1.5 ${tab === t ? "bg-[#0F9D58] text-white" : "bg-sse-surface text-sse-muted hover:text-sse-ink"}`}>
            {t === "spaces" ? "Espacios" : t === "message" ? "Enviar mensaje" : t === "card" ? "Crear tarjeta" : "Historial"}
          </button>
        ))}
      </div>

      {tab === "spaces" && (
        <>
          {spacesLoading && (
            <div className="animate-pulse space-y-1.5">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded bg-sse-border" />)}
            </div>
          )}
          {!spacesLoading && spaces.length === 0 && (
            <p className="text-center text-[13px] text-sse-muted py-8">Sin espacios de Chat disponibles</p>
          )}
          {!spacesLoading && spaces.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-sse-muted">{spaces.length} espacios</p>
              {spaces.map((space) => (
                <button
                  key={space.name}
                  onClick={() => { setSelectedSpace(space.id ?? ""); setTab("message"); }}
                  className="w-full flex items-center gap-3 rounded-lg border border-sse-border bg-sse-surface px-4 py-3 text-left hover:bg-sse-border/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#0F9D58]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-sse-ink truncate">{space.name}</p>
                    <p className="text-[10px] text-sse-muted font-mono">{space.id}</p>
                  </div>
                  <span className="text-[10px] text-sse-muted">→</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "message" && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Espacio (nombre del recurso) *</label>
            <input value={selectedSpace} onChange={(e) => setSelectedSpace(e.target.value)} placeholder="spaces/AAAA…"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Responder a hilo (opcional)</label>
            <input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="spaces/…/threads/…"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Mensaje *</label>
            <textarea rows={4} value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Escribe tu mensaje…"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!userId || !selectedSpace || !messageText || sendMessage.isPending || replyToSpace.isPending}
            className="text-[12px] px-5 py-1.5 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50">
            {(sendMessage.isPending || replyToSpace.isPending) ? "Enviando…" : replyTo ? "Responder en hilo" : "Enviar mensaje"}
          </button>
          {(sendMessage.isSuccess || replyToSpace.isSuccess) && (
            <p className="text-[11px] text-green-700 bg-green-50 rounded px-3 py-1.5">✓ Mensaje enviado</p>
          )}
        </div>
      )}

      {tab === "card" && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <p className="text-[12px] font-semibold text-sse-ink">Crear tarjeta interactiva (cardsV2)</p>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Espacio destino *</label>
            <input value={cardSpace || selectedSpace} onChange={(e) => setCardSpace(e.target.value)} placeholder="spaces/AAAA…"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Título de la tarjeta *</label>
            <input value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} placeholder="Título"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Cuerpo de la tarjeta *</label>
            <textarea rows={3} value={cardBody} onChange={(e) => setCardBody(e.target.value)} placeholder="Texto descriptivo…"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">URL de imagen (opcional)</label>
            <input value={cardImage} onChange={(e) => setCardImage(e.target.value)} placeholder="https://…"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <button
            onClick={handleCreateCard}
            disabled={!userId || !(cardSpace || selectedSpace) || !cardTitle || !cardBody || createCard.isPending}
            className="text-[12px] px-5 py-1.5 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50">
            {createCard.isPending ? "Enviando tarjeta…" : "Enviar tarjeta"}
          </button>
          {createCard.isSuccess && (
            <p className="text-[11px] text-green-700 bg-green-50 rounded px-3 py-1.5">✓ Tarjeta enviada</p>
          )}
        </div>
      )}

      {tab === "logs" && (
        <>
          {logsLoading && (
            <div className="animate-pulse space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 rounded bg-sse-border" />)}
            </div>
          )}
          {!logsLoading && logs.length === 0 && (
            <p className="text-center text-[13px] text-sse-muted py-8">Sin registros de Chat</p>
          )}
          {!logsLoading && logs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-sse-border text-left text-[10px] uppercase tracking-wide text-sse-muted">
                    <th className="pb-2 pr-4">Espacio</th>
                    <th className="pb-2 pr-4">Tipo</th>
                    <th className="pb-2 pr-4">Estado</th>
                    <th className="pb-2">Enviado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sse-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-sse-border/20">
                      <td className="py-2 pr-4 font-mono text-[11px] text-sse-ink truncate max-w-[120px]">{log.spaceName}</td>
                      <td className="py-2 pr-4 text-sse-muted text-[11px] truncate max-w-[100px]">{log.message}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${log.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2 text-sse-muted text-[11px]">{fmtDate(log.sentAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
