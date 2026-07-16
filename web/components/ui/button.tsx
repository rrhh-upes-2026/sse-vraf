import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   "bg-sse-primary text-white hover:bg-sse-primary-dark",
  secondary: "bg-sse-pill-blue-bg text-sse-primary hover:bg-blue-100",
  ghost:     "text-sse-ink hover:bg-sse-pill-gray-bg",
  danger:    "bg-sse-sem-red-bg text-sse-sem-red-fg hover:bg-red-100 border border-sse-sem-red-border",
  outline:   "border border-sse-border text-sse-ink hover:bg-sse-shell-canvas",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-[12px] gap-1.5",
  md: "h-9 px-4 text-[13px] gap-2",
  lg: "h-10 px-5 text-[14px] gap-2",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
