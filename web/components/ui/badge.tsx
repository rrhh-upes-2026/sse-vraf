import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "gray";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-sse-pill-gray-bg text-sse-pill-gray-fg",
  success: "bg-sse-sem-green-bg text-sse-sem-green-fg border border-sse-sem-green-border",
  warning: "bg-sse-sem-amber-bg text-sse-sem-amber-fg border border-sse-sem-amber-border",
  danger:  "bg-sse-sem-red-bg text-sse-sem-red-fg border border-sse-sem-red-border",
  info:    "bg-sse-pill-blue-bg text-sse-pill-blue-fg",
  purple:  "bg-sse-pill-purple-bg text-sse-pill-purple-fg",
  gray:    "bg-sse-pill-gray-bg text-sse-pill-gray-fg",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium leading-[18px]",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
