import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  color?: "primary" | "success" | "warning" | "danger";
}

const COLOR_CLASSES = {
  primary: "bg-sse-primary",
  success: "bg-sse-success",
  warning: "bg-sse-warning",
  danger:  "bg-sse-danger",
};

export function Progress({ value, color = "primary", className }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("w-full bg-sse-border rounded-full overflow-hidden", className)}
      style={{ height: 6 }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all", COLOR_CLASSES[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
