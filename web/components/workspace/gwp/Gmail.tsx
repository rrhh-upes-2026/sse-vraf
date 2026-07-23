"use client";

import { useState } from "react";
import { useGWPSendMail, useGWPReplyToThread, useGWPMailLogs } from "@/hooks/useGWP";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

function parseRecipients(str: string) {
  try { return JSON.parse(str); } catch { return str; }
}

export function GWPGmail({ wsId }: { wsId: string }) {
  void wsId;
  const [userId, setUserId]   = useState("");
  const [tab, setTab]         = useState<"compose" | "reply" | "logs">("compose");

  const [to, setTo]           = useState("");
  const [cc, setCc]           = useState("");
  const [bcc, setBcc]         = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody]       = useState("");
  const [priority, setPriority] = useState<"high" | "normal" | "low">("normal");
  const [threadId, setThreadId] = useState("");
  const [lastSent, setLastSent] = useState<string | null>(null);

  const sendMail   = useGWPSendMail();
  const replyThread = useGWPReplyToThread();
  const { data: logs = [], isLoading } = useGWPMailLogs({ userId: userId || undefined });

  function parseEmails(s: string): string[] {
    return s.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
  }

  async function handleSend() {
    const result = await sendMail.mutateAsync({
      userId,
      to:       parseEmails(to),
      cc:       cc ? parseEmails(cc) : undefined,
      bcc:      bcc ? parseEmails(bcc) : undefined,
      subject,
      htmlBody: body ? `<div style="font-family:sans-serif;">${body.replace(/\n/g, "<br>")}</div>` : undefined,
      priority,
    });
    setLastSent(result.id);
    setTo(""); setCc(""); setBcc(""); setSubject(""); setBody("");
  }

  async function handleReply() {
    await replyThread.mutateAsync({
      userId,
      threadId,
      to:       parseEmails(to),
      subject,
      htmlBody: body ? `<div style="font-family:sans-serif;">${body.replace(/\n/g, "<br>")}</div>` : undefined,
    });
    setLastSent("replied");
    setThreadId(""); setTo(""); setSubject(""); setBody("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sse-border bg-sse-surface px-4 py-3">
        <label className="block text-[11px] text-sse-muted mb-1">ID de usuario Google</label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="sub de Google OAuth"
          className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-green-400" />
      </div>

      <div className="flex rounded border border-sse-border overflow-hidden text-[11px]">
        {(["compose", "reply", "logs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-3 py-1.5 capitalize ${tab === t ? "bg-[#0F9D58] text-white" : "bg-sse-surface text-sse-muted hover:text-sse-ink"}`}>
            {t === "compose" ? "Redactar" : t === "reply" ? "Responder hilo" : "Log de envíos"}
          </button>
        ))}
      </div>

      {tab === "compose" && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          {lastSent && (
            <div className="rounded bg-green-50 border border-green-200 px-3 py-2 text-[11px] text-green-700">
              ✓ Correo enviado — ID: {lastSent}
            </div>
          )}
          {[
            { label: "Para *", value: to, set: setTo, placeholder: "correo1@gmail.com, correo2@upes.edu.sv" },
            { label: "CC",     value: cc, set: setCc, placeholder: "Opcional" },
            { label: "BCC",    value: bcc, set: setBcc, placeholder: "Opcional" },
            { label: "Asunto *", value: subject, set: setSubject, placeholder: "Asunto del correo" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="block text-[11px] text-sse-muted mb-0.5">{label}</label>
              <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Cuerpo (HTML permitido)</label>
            <textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Cuerpo del correo…"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink font-mono" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[11px] text-sse-muted">Prioridad:</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="text-[11px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink">
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baja</option>
            </select>
            <div className="flex-1" />
            <button onClick={handleSend} disabled={!userId || !to || !subject || sendMail.isPending}
              className="text-[12px] px-5 py-1.5 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50">
              {sendMail.isPending ? "Enviando…" : "Enviar correo"}
            </button>
          </div>
        </div>
      )}

      {tab === "reply" && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Thread ID *</label>
            <input value={threadId} onChange={(e) => setThreadId(e.target.value)} placeholder="ID del hilo de Gmail"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Para *</label>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="correo@dominio.com"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Asunto</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Re: …"
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Respuesta</label>
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          </div>
          <button onClick={handleReply} disabled={!userId || !threadId || !to || replyThread.isPending}
            className="text-[12px] px-5 py-1.5 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50">
            {replyThread.isPending ? "Enviando…" : "Responder hilo"}
          </button>
          {lastSent === "replied" && (
            <p className="text-[11px] text-green-700 bg-green-50 rounded px-3 py-1.5">✓ Respuesta enviada</p>
          )}
        </div>
      )}

      {tab === "logs" && (
        <>
          {isLoading && (
            <div className="animate-pulse space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 rounded bg-sse-border" />)}
            </div>
          )}
          {!isLoading && logs.length === 0 && (
            <p className="text-center text-[13px] text-sse-muted py-8">Sin registros de correo</p>
          )}
          {!isLoading && logs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-sse-border text-left text-[10px] uppercase tracking-wide text-sse-muted">
                    <th className="pb-2 pr-4">Asunto</th>
                    <th className="pb-2 pr-4">Para</th>
                    <th className="pb-2 pr-4">Estado</th>
                    <th className="pb-2 pr-4">Prioridad</th>
                    <th className="pb-2">Enviado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sse-border">
                  {logs.map((m) => (
                    <tr key={m.id} className="hover:bg-sse-border/20">
                      <td className="py-2 pr-4 font-medium text-sse-ink">{m.subject || "(Sin asunto)"}</td>
                      <td className="py-2 pr-4 text-sse-muted text-[11px]">{String(parseRecipients(m.recipients))}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${m.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-sse-muted text-[10px]">{m.status}</td>
                      <td className="py-2 text-sse-muted">{fmtDate(m.sentAt)}</td>
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
