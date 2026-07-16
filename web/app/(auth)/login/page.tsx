import { signIn } from "@/auth";

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

        <form
          className="mt-7"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/mi-trabajo" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2.5 rounded-[9px] border border-sse-shell-border bg-white px-4 py-2.5 text-[13px] font-semibold text-sse-ink transition hover:bg-sse-shell-search-bg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.87c2.27-2.09 3.58-5.17 3.58-8.73z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.3v3.1C3.26 21.3 7.29 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.29A7.13 7.13 0 0 1 4.9 12c0-.8.14-1.57.37-2.29v-3.1H1.3A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.3 5.39l3.97-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0 7.29 0 3.26 2.7 1.3 6.61l3.97 3.1c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            Iniciar sesión con Google Workspace
          </button>
        </form>

        <p className="mt-5 text-center text-[10.5px] text-sse-muted">
          Acceso restringido a cuentas institucionales UPES
        </p>
      </div>
    </div>
  );
}
