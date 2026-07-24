import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export from format.ts — single source of truth for date/time formatting.
export { fmtDate, fmtShortDate, fmtDateTime, fmtDateTimeMedium, fmtRelative } from "./format";
