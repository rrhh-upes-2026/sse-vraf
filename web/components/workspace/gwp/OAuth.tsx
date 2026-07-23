"use client";

import { useState } from "react";
import { useGWPOAuthStatus, useGetGWPAuthUrl, useRevokeGWPToken, useRefreshGWPToken, useGWPConfig } from "@/hooks/useGWP";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "medium", timeStyle: "short" }); } catch { return iso; }
}

function ScopeTag({ scope }: { scope: string }) {
  const label = scope.replace("https://www.googleapis.com/auth/", "").replace(/\./g, " ");
  return (
    <span className="text-[10px] rounded bg-green-50 text-green-700 px-1.5 py-0.5 font-mono">{label}</span>
  );
}

export function GWPOAuth({ wsId }: { wsId: string }) {
  void wsId;
  const [userId, setUserId] = useState("");
  const { data: status, isLoading } = useGWPOAuthStatus(userId || undefined);
  const { data: config } = useGWPConfig();
  const getUrl   = useGetGWPAuthUrl();
  const revoke   = useRevokeGWPToken();
  const refresh  = useRefreshGWPToken();

  const connected = status?.connected ?? false;
  const missingConfig = !config?.clientId;

  async function handleConnect() {
    const result = await getUrl.mutateAsync(config?.redirectUri);
    if (result.authUrl) {
      window.location.href = result.authUrl;
    }
  }

  return (
    <div className="space-y-6">
      {missingConfig && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/40 px-4 py-3 text-[12px] text-amber-700">
          ⚠ El Client ID de Google OAuth no está configurado. Ve a <strong>Configuración</strong> para ingresar las credenciales antes de conectar.
        </div>
      )}

      {/* Connection card */}
      <div className={`rounded-lg border p-5 ${connected ? "border-green-200 bg-green-50/30" : "border-sse-border bg-sse-surface"}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[24px] font-bold shrink-0 ${connected ? "bg-green-100 text-green-700" : "bg-sse-border text-sse-muted"}`}>
            G
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-sse-ink">
              {connected ? "Sesión Google activa" : "Sin sesión Google"}
            </p>
            {connected && status ? (
              <>
                <p className="text-[12px] text-sse-muted">{status.userEmail} · {status.domain}</p>
                <p className="text-[11px] text-sse-muted mt-0.5">Expira: {fmtDate(status.expiresAt)}</p>
              </>
            ) : (
              <p className="text-[12px] text-sse-muted">Inicia sesión con Google Workspace para habilitar los adaptadores.</p>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {!connected && (
              <button
                onClick={handleConnect}
                disabled={getUrl.isPending || missingConfig}
                className="text-[12px] px-4 py-2 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {getUrl.isPending ? "Generando URL…" : "Conectar con Google"}
              </button>
            )}
            {connected && (
              <>
                <button
                  onClick={() => userId && refresh.mutateAsync(userId)}
                  disabled={refresh.isPending || !userId}
                  className="text-[11px] px-3 py-1.5 rounded border border-sse-border text-sse-muted hover:text-sse-ink disabled:opacity-50"
                >
                  Renovar token
                </button>
                <button
                  onClick={() => userId && revoke.mutateAsync(userId)}
                  disabled={revoke.isPending || !userId}
                  className="text-[11px] px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {revoke.isPending ? "Revocando…" : "Revocar"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User ID input (for demo — real implementation uses session) */}
      <div className="rounded-lg border border-sse-border bg-sse-surface px-4 py-3 space-y-2">
        <p className="text-[11px] font-medium text-sse-ink">ID de usuario para consultas</p>
        <p className="text-[10px] text-sse-muted">En producción este valor proviene de la sesión ISP autenticada.</p>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="sub de Google (ej: 11782…)"
          className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Scopes */}
      {status?.scope && (
        <div className="rounded-lg border border-sse-border bg-sse-surface px-4 py-3 space-y-2">
          <p className="text-[11px] font-medium text-sse-ink">Scopes autorizados</p>
          <div className="flex flex-wrap gap-1.5">
            {status.scope.split(" ").filter(Boolean).map((s) => <ScopeTag key={s} scope={s} />)}
          </div>
        </div>
      )}

      {/* OAuth 2.0 flow diagram */}
      <div className="rounded-lg border border-sse-border bg-sse-surface px-4 py-4 space-y-3">
        <p className="text-[11px] font-semibold text-sse-ink">Flujo OAuth 2.0 implementado</p>
        <ol className="space-y-2">
          {[
            { step: "1", label: "getAuthUrl()", desc: "Genera URL de autorización con state CSRF almacenado en PropertiesService" },
            { step: "2", label: "Redirect → Google", desc: "Usuario autoriza los scopes solicitados en la pantalla de consentimiento de Google" },
            { step: "3", label: "handleCallback(code, state)", desc: "Verifica state CSRF, intercambia código por access/refresh tokens vía oauth2.googleapis.com/token" },
            { step: "4", label: "Token storage", desc: "Tokens almacenados con obfuscación XOR+base64 (Script ID como clave). clientSecret nunca sale del servidor" },
            { step: "5", label: "Auto-refresh", desc: "Cada llamada a _getAccessToken_() verifica expiración y refresca automáticamente si quedan < 60s" },
            { step: "6", label: "Revocación", desc: "oauth2.googleapis.com/revoke borra el token en Google + limpia el registro local" },
          ].map((item) => (
            <li key={item.step} className="flex gap-3 text-[11px]">
              <span className="shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold text-[10px] flex items-center justify-center">{item.step}</span>
              <div>
                <span className="font-mono font-semibold text-sse-ink">{item.label}</span>
                <span className="text-sse-muted"> — {item.desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {isLoading && <p className="text-center text-[12px] text-sse-muted">Verificando estado OAuth…</p>}
    </div>
  );
}
