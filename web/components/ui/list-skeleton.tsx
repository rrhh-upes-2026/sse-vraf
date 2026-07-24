import { SkeletonCard } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  /** Number of skeleton items to render (default: 4) */
  count?: number;
  /** Card height class (default: "h-[180px]") */
  height?: string;
  /** Grid layout class (default: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3") */
  cols?: string;
  className?: string;
}

/** Parametrizable loading skeleton for workspace grid lists */
export function ListSkeleton({
  count = 4,
  height = "h-[180px]",
  cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("grid gap-4", cols, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className={height} />
      ))}
    </div>
  );
}

/** Row-style skeleton for table/list views */
export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
