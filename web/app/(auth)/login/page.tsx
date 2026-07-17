"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión.");
        return;
      }
      const callbackUrl = searchParams.get("callbackUrl") ?? "/mi-trabajo";
      router.push(callbackUrl);
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-7" onSubmit={handleSubmit}>
      <label className="block text-[12px] font-semibold text-sse-ink mb-1.5" htmlFor="email">
        Correo institucional
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        placeholder="usuario@upes.edu.sv"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-[9px] border border-sse-shell-border bg-white px-3.5 py-2.5 text-[13px] text-sse-ink placeholder:text-sse-muted focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      {error && (
        <p className="mt-2 text-[11.5px] font-medium text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#2E6BE6] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#2558c4] disabled:opacity-60"
      >
        {loading ? "Verificando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sse-shell-canvas px-4">
      <div className="w-full max-w-sm rounded-[16px] border border-sse-shell-border bg-white p-8 shadow-[0_12px_32px_rgba(15,38,71,0.12)]">
        <div
          className="mx-auto mb-5 flex size-12 items-center justify-center rounded-[12px] text-[16px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #2E6BE6, #5B8DEF)" }}
        >
          SS
        </div>
        <h1 className="text-center text-[17px] font-extrabold text-sse-ink">SSE-VRAF</h1>
        <p className="mt-1.5 text-center text-[12.5px] leading-relaxed text-sse-muted">
          Sistema de Seguimiento Estratégico · Vicerrectoría Administrativa y
          Financiera · Universidad Politécnica de El Salvador
        </p>
        <Suspense fallback={<div className="mt-7 h-28" />}>
          <LoginForm />
        </Suspense>
        <p className="mt-5 text-center text-[10.5px] text-sse-muted">
          Acceso restringido a cuentas institucionales UPES
        </p>
      </div>
    </div>
  );
}
