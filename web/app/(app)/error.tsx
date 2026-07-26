"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SSE-VRAF] App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <h2 className="text-[16px] font-semibold text-sse-ink">Ocurrió un error inesperado</h2>
        <p className="mt-1.5 text-[13px] text-sse-muted max-w-sm">
          {error.message || "El sistema encontró un problema al procesar la solicitud."}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-sse-muted">
            Referencia: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-[8px] bg-[#2E6BE6] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#2558c4] transition-colors"
        >
          Intentar nuevamente
        </button>
        <a
          href="/mi-trabajo"
          className="rounded-[8px] border border-sse-border px-4 py-2 text-[13px] font-medium text-sse-ink hover:bg-sse-hover transition-colors"
        >
          Ir a Mi Trabajo
        </a>
      </div>
    </div>
  );
}
