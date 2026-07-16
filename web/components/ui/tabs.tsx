"use client";

import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-sse-border mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium border-b-2 -mb-px transition-colors",
              active === tab.id
                ? "border-sse-primary text-sse-primary"
                : "border-transparent text-sse-muted hover:text-sse-ink",
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-sse-sem-amber-bg text-sse-sem-amber-fg px-1 text-[10px] font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
