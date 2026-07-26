import Link from "next/link";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: string;
}

export function ComingSoonPage({ title, description, icon }: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-[14px] bg-sse-surface border border-sse-border">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7 text-sse-muted"
        >
          <path d={icon} />
        </svg>
      </div>
      <div className="max-w-sm">
        <h1 className="text-[17px] font-semibold text-sse-ink">{title}</h1>
        <p className="mt-1.5 text-[13px] text-sse-muted leading-relaxed">{description}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-[11px] font-semibold text-amber-700">En desarrollo — próxima versión</span>
        </div>
      </div>
      <Link
        href="/mi-trabajo"
        className="rounded-[8px] border border-sse-border px-4 py-2 text-[13px] font-medium text-sse-ink hover:bg-sse-hover transition-colors"
      >
        Ir a Mi Trabajo
      </Link>
    </div>
  );
}
