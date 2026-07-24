"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ newPassword }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Error al cambiar la contraseña.");
        return;
      }
      router.push("/mi-trabajo");
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sse-shell-canvas px-4">
      <div className="w-full max-w-sm rounded-[16px] border border-sse-shell-border bg-white p-8 shadow-[0_12px_32px_rgba(15,38,71,0.12)]">
        <div
          className="mx-auto mb-5 flex size-12 items-center justify-center rounded-[12px] text-[16px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #2E6BE6, #5B8DEF)" }}
        >
          SS
        </div>
        <h1 className="text-center text-[17px] font-extrabold text-sse-ink">Cambiar contraseña</h1>
        <p className="mt-1.5 text-center text-[12.5px] leading-relaxed text-sse-muted">
          Su cuenta requiere establecer una nueva contraseña antes de continuar.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[12px] font-semibold text-sse-ink mb-1.5" htmlFor="newPassword">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              type="password"
              required
              autoFocus
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-[9px] border border-sse-shell-border bg-white px-3.5 py-2.5 text-[13px] text-sse-ink placeholder:text-sse-muted focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-sse-ink mb-1.5" htmlFor="confirmPassword">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repita la nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-[9px] border border-sse-shell-border bg-white px-3.5 py-2.5 text-[13px] text-sse-ink placeholder:text-sse-muted focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="rounded-[8px] bg-red-50 border border-red-100 px-3 py-2 text-[12px] font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#2E6BE6] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#2558c4] disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Establecer contraseña"}
          </button>
        </form>

        <p className="mt-5 text-center text-[10.5px] text-sse-muted">
          SSE-VRAF · Universidad Politécnica de El Salvador
        </p>
      </div>
    </div>
  );
}
