"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Step = "email" | "otp";

function LoginFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep]   = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode]   = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
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
        setError(data.error ?? "Error al enviar el código.");
        return;
      }
      setStep("otp");
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Código inválido o expirado.");
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

  if (step === "otp") {
    return (
      <form className="mt-7" onSubmit={handleVerifyOtp}>
        <p className="text-[12px] text-sse-muted mb-4 text-center leading-relaxed">
          Enviamos un código de 6 dígitos a<br />
          <strong className="text-sse-ink">{email}</strong>
        </p>
        <label className="block text-[12px] font-semibold text-sse-ink mb-1.5" htmlFor="code">
          Código de verificación
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full rounded-[9px] border border-sse-shell-border bg-white px-3.5 py-2.5 text-[15px] font-semibold tracking-[0.35em] text-sse-ink placeholder:text-sse-muted placeholder:tracking-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {error && (
          <p className="mt-2 text-[11.5px] font-medium text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#2E6BE6] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#2558c4] disabled:opacity-60"
        >
          {loading ? "Verificando…" : "Ingresar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError("");
          }}
          className="mt-3 w-full text-center text-[11.5px] text-sse-muted hover:text-sse-ink transition"
        >
          ← Cambiar correo
        </button>
      </form>
    );
  }

  return (
    <form className="mt-7" onSubmit={handleSendOtp}>
      <label className="block text-[12px] font-semibold text-sse-ink mb-1.5" htmlFor="email">
        Correo institucional
      </label>
      <input
        id="email"
        type="email"
        required
        autoFocus
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
        {loading ? "Enviando código…" : "Enviar código"}
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
        <Suspense fallback={<div className="mt-7 h-36" />}>
          <LoginFlow />
        </Suspense>
        <p className="mt-5 text-center text-[10.5px] text-sse-muted">
          Acceso restringido a cuentas institucionales UPES
        </p>
      </div>
    </div>
  );
}
