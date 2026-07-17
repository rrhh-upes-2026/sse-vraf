"use client";

import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onCheckedChange, label, disabled, className }: SwitchProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RadixSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-sse-primary" : "bg-sse-border",
        )}
      >
        <RadixSwitch.Thumb
          className={cn(
            "pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </RadixSwitch.Root>
      {label && <span className="text-[13px] text-sse-ink">{label}</span>}
    </div>
  );
}
