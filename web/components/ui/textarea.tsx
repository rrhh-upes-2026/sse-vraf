import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink",
        "placeholder:text-sse-muted hover:border-sse-primary/50",
        "focus:outline-none focus:ring-2 focus:ring-sse-primary/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y min-h-[80px]",
        className,
      )}
      {...props}
    />
  );
}
