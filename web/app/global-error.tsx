"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SSE-VRAF] Global error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 px-6 text-center font-sans">
        <div className="flex size-14 items-center justify-center rounded-full bg-red-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={1.5} className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-slate-800">Error crítico del sistema</h2>
          <p className="mt-2 text-[13px] text-slate-500 max-w-sm">
            SSE-VRAF encontró un error que impidió cargar la aplicación correctamente.
          </p>
        </div>
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Reiniciar aplicación
        </button>
      </body>
    </html>
  );
}
