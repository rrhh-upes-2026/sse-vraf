interface PlaceholderScreenProps {
  title: string;
  description: string;
  eyebrow?: string;
}

/**
 * Stand-in content for routes that exist (navigation is real) but whose
 * business module hasn't been built yet. Sprint 1 is foundation-only —
 * this component is what every workspace/Studio/Admin page renders until
 * its owning sprint replaces it with the real feature.
 */
export function PlaceholderScreen({ title, description, eyebrow }: PlaceholderScreenProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-[16px] border border-dashed border-sse-border bg-white px-8 py-10 text-center">
        {eyebrow && (
          <div className="mb-2 font-mono-sse text-[9.5px] font-bold uppercase tracking-[.8px] text-sse-muted">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[16px] font-extrabold text-sse-ink">{title}</h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-sse-muted">{description}</p>
      </div>
    </div>
  );
}
