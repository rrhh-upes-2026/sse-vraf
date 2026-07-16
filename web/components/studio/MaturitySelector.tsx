"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MATURITY_CONFIG, MATURITY_LEVELS_ORDERED } from "@/lib/studio/maturityConfig";
import type { MaturityLevel } from "@/types/studio";

interface MaturitySelectorProps {
  current:    MaturityLevel;
  onChange:   (level: MaturityLevel) => Promise<void>;
  isLoading?: boolean;
}

const VARIANT_DOT: Record<string, string> = {
  gray:    "bg-sse-pill-gray-bg border border-sse-border",
  warning: "bg-sse-sem-amber-bg border border-sse-sem-amber-border",
  info:    "bg-sse-pill-blue-bg border border-sse-primary",
  success: "bg-sse-sem-green-bg border border-sse-sem-green-border",
  danger:  "bg-sse-sem-red-bg border border-sse-sem-red-border",
};

export function MaturitySelector({ current, onChange, isLoading }: MaturitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSelect = async (level: MaturityLevel) => {
    if (level === current) { setOpen(false); return; }
    setPending(true);
    try {
      await onChange(level);
    } finally {
      setPending(false);
      setOpen(false);
    }
  };

  const currentCfg = MATURITY_CONFIG[current];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading || pending}
      >
        <span className={cn(
          "inline-block w-2 h-2 rounded-full mr-1.5",
          VARIANT_DOT[currentCfg.variant] ?? VARIANT_DOT.gray,
        )} />
        {currentCfg.label}
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 ml-1 text-sse-muted">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 w-52 rounded-md border border-sse-border bg-white shadow-md py-1">
          {MATURITY_LEVELS_ORDERED.map((level) => {
            const cfg = MATURITY_CONFIG[level];
            const isCurrent = level === current;
            return (
              <button
                key={level}
                onClick={() => handleSelect(level)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors",
                  isCurrent
                    ? "bg-sse-pill-blue-bg text-sse-primary font-medium"
                    : "text-sse-ink hover:bg-sse-surface",
                )}
              >
                <span className={cn("w-2 h-2 rounded-full shrink-0", VARIANT_DOT[cfg.variant] ?? VARIANT_DOT.gray)} />
                <span>{cfg.label}</span>
                {isCurrent && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 ml-auto text-sse-primary">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
