"use client";

import { useState } from "react";
import { useEditAuthStore } from "@/store/useEditAuthStore";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditAuthModal({ onSuccess, onCancel }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useEditAuthStore((s) => s.setAuthenticated);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Credenciales inválidas.");
        return;
      }
      setAuthenticated(true);
      onSuccess();
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#1A2540] rounded-xl shadow-2xl border border-[#CBD5E1] dark:border-[#2D3F5E] p-6">
        <h2 className="text-[15px] font-bold text-[#0F172A] dark:text-white mb-1">
          Verificar identidad
        </h2>
        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mb-5">
          Ingresa tus credenciales institucionales para continuar editando.
        </p>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
              Correo institucional
            </label>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@upes.edu.sv"
              disabled={loading}
              className="w-full rounded-lg border border-[#CBD5E1] dark:border-[#2D3F5E] bg-white dark:bg-[#0F1A2D] px-3 py-2.5 text-[13px] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full rounded-lg border border-[#CBD5E1] dark:border-[#2D3F5E] bg-white dark:bg-[#0F1A2D] px-3 py-2.5 text-[13px] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 px-3 py-2 text-[12px] font-medium text-red-700 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 text-[13px] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white border border-[#CBD5E1] dark:border-[#2D3F5E] rounded-lg transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Verificando…" : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
