"use client";

import { useState, useRef, useEffect } from "react";
import { useIIAConversations, useIIAConversation, useIIAChat } from "@/hooks/useIIA";
import type { IIAPromptType, IIAContextSource, IIAMessage } from "@/types/iia";

const PROMPT_TYPES: { value: IIAPromptType; label: string }[] = [
  { value: "institutional",   label: "Institucional" },
  { value: "executive",       label: "Ejecutivo" },
  { value: "analytical",      label: "Analítico" },
  { value: "operational",     label: "Operacional" },
  { value: "administrative",  label: "Administrativo" },
];

const CONTEXT_SOURCES: { value: IIAContextSource; label: string }[] = [
  { value: "isp", label: "Identidad (ISP)" },
  { value: "iie", label: "Indicadores (IIE)" },
  { value: "gwp", label: "Workspace (GWP)" },
  { value: "ioe", label: "Operaciones (IOE)" },
  { value: "nce", label: "Notificaciones (NCE)" },
];

const USER_ID = "current-user";

function renderMarkdown(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-indigo-50 text-indigo-800 px-1 rounded text-[11px] font-mono">$1</code>')
    .replace(/^#{3} (.+)$/gm, '<h3 class="text-[13px] font-semibold text-sse-ink mt-3 mb-1">$1</h3>')
    .replace(/^#{2} (.+)$/gm, '<h2 class="text-[14px] font-bold text-sse-ink mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-[15px] font-bold text-sse-ink mt-3 mb-1">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-[12px]">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="my-1">$1</ul>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, "<br/>");
  return `<p class="mb-2">${html}</p>`;
}

function MessageBubble({ msg }: { msg: IIAMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}
      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-[12px] ${
        isUser
          ? "bg-indigo-600 text-white"
          : "bg-sse-surface border border-sse-border text-sse-ink"
      }`}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
        )}
        <div className={`text-[10px] mt-1 ${isUser ? "text-indigo-200" : "text-sse-muted"} flex gap-2`}>
          <span>{new Date(msg.timestamp).toLocaleTimeString("es-SV", { timeStyle: "short" })}</span>
          {msg.tokensOut && <span>{msg.tokensIn}↑ {msg.tokensOut}↓</span>}
        </div>
      </div>
    </div>
  );
}

export function IIAChat({ wsId }: { wsId: string }) {
  void wsId;
  const [convId, setConvId]           = useState<string | undefined>();
  const [input, setInput]             = useState("");
  const [promptType, setPromptType]   = useState<IIAPromptType>("institutional");
  const [sources, setSources]         = useState<IIAContextSource[]>(["isp", "iie"]);
  const bottomRef                     = useRef<HTMLDivElement>(null);

  const { data: conversations }       = useIIAConversations({ userId: USER_ID });
  const { data: conversation }        = useIIAConversation(convId ?? "");
  const chat                          = useIIAChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  function toggleSource(s: IIAContextSource) {
    setSources((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function handleSend() {
    const msg = input.trim();
    if (!msg || chat.isPending) return;
    setInput("");
    const result = await chat.mutateAsync({
      userId: USER_ID,
      conversationId: convId,
      message: msg,
      promptType,
      contextSources: sources,
    });
    setConvId(result.conversationId);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const messages = conversation?.messages ?? [];

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[400px] gap-4">
      {/* Sidebar — conversation list */}
      <div className="w-48 flex-shrink-0 flex flex-col gap-1 overflow-y-auto">
        <button
          onClick={() => setConvId(undefined)}
          className="text-[11px] rounded-lg border border-dashed border-indigo-300 px-3 py-2 text-indigo-600 hover:bg-indigo-50 mb-1"
        >
          + Nueva conversación
        </button>
        {(conversations ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => setConvId(c.id)}
            className={`text-left rounded-lg px-3 py-2 text-[11px] truncate ${
              c.id === convId
                ? "bg-indigo-600 text-white"
                : "bg-sse-surface border border-sse-border text-sse-ink hover:bg-indigo-50"
            }`}
          >
            <p className="font-medium truncate">{c.title}</p>
            <p className={`text-[10px] ${c.id === convId ? "text-indigo-200" : "text-sse-muted"}`}>
              {c.messageCount} mensajes
            </p>
          </button>
        ))}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 rounded-lg border border-sse-border bg-sse-bg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-sse-border bg-sse-surface">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[12px] font-semibold text-sse-ink">
              {conversation?.title ?? "Nueva conversación"}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={promptType}
              onChange={(e) => setPromptType(e.target.value as IIAPromptType)}
              className="text-[11px] border border-sse-border rounded px-2 py-1 bg-sse-surface text-sse-ink focus:outline-none"
            >
              {PROMPT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-sse-muted">
              <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-[13px]">Haz una pregunta institucional</p>
              <p className="text-[11px]">El asistente tiene acceso al contexto de tu organización.</p>
            </div>
          )}
          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          {chat.isPending && (
            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707" />
                </svg>
              </div>
              <div className="rounded-xl bg-sse-surface border border-sse-border px-4 py-2.5">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Context sources */}
        <div className="px-4 py-1.5 border-t border-sse-border bg-sse-surface flex gap-1.5 flex-wrap">
          {CONTEXT_SOURCES.map((s) => (
            <button
              key={s.value}
              onClick={() => toggleSource(s.value)}
              className={`text-[10px] rounded-full px-2 py-0.5 border transition-colors ${
                sources.includes(s.value)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-sse-border text-sse-muted hover:border-indigo-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-sse-border bg-sse-surface">
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta… (Enter para enviar, Shift+Enter para nueva línea)"
              className="flex-1 text-[12px] rounded-lg border border-sse-border px-3 py-2 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <button
              onClick={() => void handleSend()}
              disabled={!input.trim() || chat.isPending}
              className="self-end px-4 py-2 rounded-lg bg-indigo-600 text-white text-[12px] font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
