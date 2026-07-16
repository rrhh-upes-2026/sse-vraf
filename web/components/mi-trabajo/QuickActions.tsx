"use client";

import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";
import { QUICK_ACTIONS } from "@/lib/permissions";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function QuickActions() {
  const { hasPermission, isLoaded } = usePermissions();

  const visible = QUICK_ACTIONS.filter((action) => hasPermission(action.permission));

  if (isLoaded && visible.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones rápidas</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {!isLoaded && (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        )}

        {isLoaded && (
          <div className="grid grid-cols-2 gap-2">
            {visible.map((action) => (
              <Link key={action.id} href={action.href}>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-sm border border-sse-border bg-sse-surface hover:bg-sse-pill-gray-bg hover:border-sse-primary/40 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-sm bg-sse-pill-gray-bg flex items-center justify-center group-hover:bg-sse-primary/10 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                      className="w-4 h-4 text-sse-muted group-hover:text-sse-primary transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-sse-ink text-center leading-tight">
                    {action.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
