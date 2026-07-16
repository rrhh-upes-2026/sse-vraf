import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Full date: "12 jul 2026" */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-SV", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

/** Short date without year: "12 jul" */
export function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-SV", {
    day:   "numeric",
    month: "short",
  });
}
