"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-sse-shell-canvas px-6 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-[12px] text-[16px] font-extrabold text-white"
        style={{ background: "linear-gradient(135deg, #2E6BE6, #5B8DEF)" }}
      >
        SS
      </div>
      <div>
        <p className="text-[64px] font-extrabold text-sse-ink leading-none">404</p>
        <h2 className="mt-2 text-[17px] font-semibold text-sse-ink">Página no encontrada</h2>
        <p className="mt-1.5 text-[13px] text-sse-muted max-w-sm">
          La dirección que solicitó no existe o fue removida. Verifique la URL o regrese al inicio.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/mi-trabajo"
          className="rounded-[8px] bg-[#2E6BE6] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#2558c4] transition-colors"
        >
          Ir a Mi Trabajo
        </Link>
        <button
          onClick={() => router.back()}
          className="rounded-[8px] border border-sse-shell-border px-4 py-2.5 text-[13px] font-medium text-sse-ink hover:bg-sse-hover transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
