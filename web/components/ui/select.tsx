"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Seleccionar…",
  className,
  disabled,
}: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-sm border border-sse-border bg-sse-surface px-3 text-[13px] text-sse-ink",
          "hover:border-sse-primary/50 focus:outline-none focus:ring-2 focus:ring-sse-primary/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[placeholder]:text-sse-muted",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5 text-sse-muted">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="z-[60] min-w-[160px] overflow-hidden rounded-md border border-sse-border bg-sse-surface shadow-lg"
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  "flex cursor-pointer items-center rounded-sm px-2.5 py-1.5 text-[13px] text-sse-ink",
                  "outline-none hover:bg-sse-shell-canvas focus:bg-sse-shell-canvas",
                  "data-[state=checked]:font-semibold data-[state=checked]:text-sse-primary",
                )}
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ml-auto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-3 text-sse-primary">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
