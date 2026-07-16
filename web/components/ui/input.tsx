import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string; // SVG path d
}

export function Input({ className, icon, ...props }: InputProps) {
  if (icon) {
    return (
      <div className="relative flex items-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3 h-4 w-4 text-sse-muted"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
        <input
          className={cn(
            "w-full rounded-md border border-sse-border bg-sse-surface py-2 pl-9 pr-3 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30",
            className,
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={cn(
        "w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30",
        className,
      )}
      {...props}
    />
  );
}
