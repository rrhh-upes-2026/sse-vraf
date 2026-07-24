/** Shared date/time formatters — single source of truth (es-SV locale). */

/** Full date: "12 jul 2026" */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-SV", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Short date without year: "12 jul" */
export function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-SV", {
    day: "numeric",
    month: "short",
  });
}

/** Date + time: "12 jul 2026, 14:30" */
export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-SV", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Date + time (medium style): "12 jul 2026, 14:30" */
export function fmtDateTimeMedium(iso: string): string {
  return new Date(iso).toLocaleString("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Relative time: "hace 3min", "hace 2h", "hace 4d" */
export function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d >= 1) return `hace ${d}d`;
  if (h >= 1) return `hace ${h}h`;
  if (m >= 1) return `hace ${m}min`;
  return "ahora";
}
