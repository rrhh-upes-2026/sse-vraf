"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { WorkspaceId } from "@/config/nav";

interface SearchResult {
  id: string;
  type: "proceso" | "kpi" | "solicitud" | "automatizacion" | "usuario" | "formulario" | "documento";
  label: string;
  sublabel: string;
  wsId: WorkspaceId;
  href: string;
}

const TYPE_CONFIG = {
  proceso:       { label: "Proceso",       color: "#2E6BE6", icon: "M9 11l3 3 8-8M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9" },
  kpi:           { label: "Indicador",     color: "#0F8A8A", icon: "M4 20a8 8 0 1 1 16 0M12 14l4-4" },
  solicitud:     { label: "Solicitud",     color: "#5B4FD0", icon: "M4 13h4l2 3h4l2-3h4M5 5h14v13H5z" },
  automatizacion:{ label: "Automatización",color: "#E5A100", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
  usuario:       { label: "Usuario",       color: "#E54D4D", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" },
  formulario:    { label: "Formulario",    color: "#12A150", icon: "M8 3h6l4 4v14H6V5a2 2 0 012-2zM14 3v4h4M9 13h6" },
  documento:     { label: "Documento",     color: "#637083", icon: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
};

const WORKSPACES: WorkspaceId[] = ["rrhh", "vraf", "conta", "compras", "mant", "salud"];
const RECENT_KEY = "sse_recent_searches";

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); }
  catch { return []; }
}
function addRecent(q: string) {
  const prev = getRecent().filter((s) => s !== q).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev]));
}

async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const wsId of WORKSPACES) {
    const [blueprints, kpis, requests, automations, users, forms, docs] = await Promise.all([
      WorkspaceAdminService.listBlueprints(wsId),
      WorkspaceAdminService.listKPIs(wsId),
      WorkspaceAdminService.listRequestTypes(wsId),
      WorkspaceAdminService.listAutomations(wsId),
      WorkspaceAdminService.listUsers(wsId),
      WorkspaceAdminService.listForms(wsId),
      WorkspaceAdminService.listDocuments(wsId),
    ]);

    blueprints.filter((b) => b.nombre.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)).forEach((b) =>
      results.push({ id: b.id, type: "proceso", label: b.nombre, sublabel: `${wsId.toUpperCase()} · ${b.id}`, wsId, href: `/ws/${wsId}/admin/procesos` })
    );
    kpis.filter((k) => k.nombre.toLowerCase().includes(q)).forEach((k) =>
      results.push({ id: k.id, type: "kpi", label: k.nombre, sublabel: `${wsId.toUpperCase()} · ${k.formula.slice(0, 40)}…`, wsId, href: `/ws/${wsId}/admin/indicadores` })
    );
    requests.filter((r) => r.nombre.toLowerCase().includes(q)).forEach((r) =>
      results.push({ id: r.id, type: "solicitud", label: r.nombre, sublabel: `${wsId.toUpperCase()} · SLA ${r.slaDias}d`, wsId, href: `/ws/${wsId}/admin/solicitudes` })
    );
    automations.filter((a) => a.nombre.toLowerCase().includes(q)).forEach((a) =>
      results.push({ id: a.id, type: "automatizacion", label: a.nombre, sublabel: `${wsId.toUpperCase()} · ${a.trigger}`, wsId, href: `/ws/${wsId}/admin/automatizaciones` })
    );
    users.filter((u) => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).forEach((u) =>
      results.push({ id: u.id, type: "usuario", label: u.nombre, sublabel: `${wsId.toUpperCase()} · ${u.email}`, wsId, href: `/ws/${wsId}/admin/usuarios` })
    );
    forms.filter((f) => f.nombre.toLowerCase().includes(q)).forEach((f) =>
      results.push({ id: f.id, type: "formulario", label: f.nombre, sublabel: `${wsId.toUpperCase()} · v${f.version}`, wsId, href: `/ws/${wsId}/admin/formularios` })
    );
    docs.filter((d) => d.nombre.toLowerCase().includes(q)).forEach((d) =>
      results.push({ id: d.id, type: "documento", label: d.nombre, sublabel: `${wsId.toUpperCase()} · ${d.categoria}`, wsId, href: `/ws/${wsId}/admin/documentos` })
    );
  }

  return results.slice(0, 20);
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIdx(0);
      setRecent(getRecent());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    searchAll(q).then((r) => { setResults(r); setLoading(false); setActiveIdx(0); });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v), 200);
  }

  function handleSelect(href: string, label: string) {
    addRecent(query || label);
    onClose();
    window.location.href = href;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) { handleSelect(results[activeIdx].href, results[activeIdx].label); }
    if (e.key === "Escape") onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-[12%] z-50 w-full max-w-[600px] -translate-x-1/2 overflow-hidden rounded-xl border border-sse-border bg-sse-surface shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="sr-only">Búsqueda global</Dialog.Title>

          {/* Input */}
          <div className="flex items-center gap-3 border-b border-sse-border px-4 py-3">
            {loading ? (
              <div className="size-5 animate-spin rounded-full border-2 border-sse-primary border-t-transparent" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5 shrink-0 text-sse-muted">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Buscar procesos, KPIs, usuarios, formularios…"
              className="flex-1 bg-transparent text-[14px] text-sse-ink placeholder:text-sse-muted focus:outline-none"
            />
            <kbd className="rounded border border-sse-border px-1.5 py-0.5 text-[10px] text-sse-muted">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[420px] overflow-y-auto">
            {!query && recent.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-sse-muted">Búsquedas recientes</p>
                {recent.map((r, i) => (
                  <button key={i} onClick={() => { setQuery(r); doSearch(r); }} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-sse-muted hover:bg-sse-shell-canvas">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5 shrink-0">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    {r}
                  </button>
                ))}
              </div>
            )}

            {query && results.length === 0 && !loading && (
              <div className="flex flex-col items-center gap-1 p-8 text-center">
                <p className="text-[14px] font-medium text-sse-muted">Sin resultados para "{query}"</p>
                <p className="text-[12px] text-sse-muted">Intenta con otro término</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-sse-muted">
                  {results.length} resultado{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((r, i) => {
                  const cfg = TYPE_CONFIG[r.type];
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r.href, r.label)}
                      className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors ${i === activeIdx ? "bg-sse-shell-canvas" : "hover:bg-sse-shell-canvas/60"}`}
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${cfg.color}18` }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth={1.8} className="size-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-sse-ink">{r.label}</p>
                        <p className="truncate text-[11px] text-sse-muted">{r.sublabel}</p>
                      </div>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {!query && recent.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-[13px] text-sse-muted">Escribe para buscar en todos los workspaces</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                    <span key={type} className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
