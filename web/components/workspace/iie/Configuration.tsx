"use client";

import { useState } from "react";
import { useIIEConfiguration, useIIEKnowledgeRules, useUpdateIIEConfiguration, useUpdateIIEKnowledgeRule } from "@/hooks/useIIE";
import type { IIEConfiguration, IIEKnowledgeRule } from "@/types/iie";

type ConfigTab = "parametros" | "reglas";

const CATEGORY_LABEL: Record<string, string> = {
  riesgo:       "Riesgo",
  confianza:    "Confianza",
  anomalia:     "Anomalía",
  prediccion:   "Predicción",
  pesos:        "Pesos",
  umbrales:     "Umbrales",
};

function ConfigParam({ cfg, onSave }: { cfg: IIEConfiguration; onSave: (key: string, val: string | number | boolean) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(String(cfg.value));

  function handleSave() {
    let parsed: string | number | boolean = draft;
    if (cfg.type === "number" || cfg.type === "percentage") parsed = Number(draft);
    if (cfg.type === "boolean") parsed = draft === "true";
    onSave(cfg.key, parsed);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 rounded border border-sse-border bg-white px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-sse-ink">{cfg.label}</p>
        {cfg.description && <p className="text-[10px] text-sse-muted mt-0.5 line-clamp-1">{cfg.description}</p>}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {editing ? (
          <>
            {cfg.type === "boolean" ? (
              <select value={draft} onChange={(e) => setDraft(e.target.value)}
                className="rounded border border-sse-border px-2 py-1 text-[12px] focus:outline-none">
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            ) : (
              <input
                type={cfg.type === "number" || cfg.type === "percentage" ? "number" : "text"}
                value={draft}
                min={cfg.min} max={cfg.max}
                onChange={(e) => setDraft(e.target.value)}
                className="w-20 rounded border border-sse-border px-2 py-1 text-[12px] tabular-nums focus:outline-none"
              />
            )}
            {cfg.type === "percentage" && <span className="text-[11px] text-sse-muted">%</span>}
            <button onClick={handleSave}
              className="rounded bg-[#6D28D9] px-2.5 py-1 text-[11px] text-white hover:bg-[#5B21B6] transition-colors">
              Guardar
            </button>
            <button onClick={() => { setDraft(String(cfg.value)); setEditing(false); }}
              className="rounded border border-sse-border px-2.5 py-1 text-[11px] text-sse-muted hover:text-sse-ink transition-colors">
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span className="min-w-[40px] text-right text-[13px] font-medium tabular-nums text-[#6D28D9]">
              {String(cfg.value)}{cfg.type === "percentage" ? "%" : ""}
            </span>
            <button onClick={() => setEditing(true)}
              className="rounded border border-sse-border p-1 text-sse-muted hover:text-sse-ink transition-colors">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function RuleRow({ rule, onToggle }: { rule: IIEKnowledgeRule; onToggle: (id: string, enabled: boolean) => void }) {
  const [open, setOpen] = useState(false);

  const conditions = Array.isArray(rule.conditions)
    ? rule.conditions
    : (() => { try { return JSON.parse(String(rule.conditions)); } catch { return []; } })();

  const consequences = Array.isArray(rule.consequences)
    ? rule.consequences
    : (() => { try { return JSON.parse(String(rule.consequences)); } catch { return []; } })();

  return (
    <div className={`rounded border bg-white ${rule.enabled ? "border-sse-border" : "border-sse-border opacity-50"}`}>
      <div className="flex items-start gap-3 px-3 py-2.5">
        <button
          onClick={() => onToggle(rule.id, !rule.enabled)}
          className={`mt-0.5 h-5 w-9 flex-none rounded-full transition-colors ${rule.enabled ? "bg-[#6D28D9]" : "bg-gray-200"} flex items-center`}
          title={rule.enabled ? "Deshabilitar" : "Habilitar"}
        >
          <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className="text-[12px] font-medium text-sse-ink">{rule.name}</p>
            <span className="rounded bg-sse-surface px-1.5 py-0.5 text-[10px] text-sse-muted capitalize">{rule.category}</span>
            <span className="text-[10px] text-sse-muted">peso: <span className="font-medium text-sse-ink tabular-nums">{rule.weight}</span></span>
            <span className="text-[10px] text-sse-muted">confianza: <span className="font-medium text-sse-ink tabular-nums">{rule.confidence}%</span></span>
            <span className="text-[10px] font-medium text-[#6D28D9]">{rule.logic}</span>
          </div>
          {rule.description && <p className="text-[11px] text-sse-muted line-clamp-1">{rule.description}</p>}
        </div>
        <button onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded border border-sse-border p-1 text-sse-muted hover:text-sse-ink transition-colors">
          <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-sse-border px-3 py-2.5 space-y-2">
          {conditions.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-1">Condiciones</p>
              <div className="space-y-0.5">
                {conditions.map((c: { field: string; operator: string; value: string | number }, i: number) => (
                  <p key={i} className="text-[11px] font-mono text-sse-ink bg-sse-surface rounded px-2 py-0.5">
                    {c.field} {c.operator} {String(c.value)}
                  </p>
                ))}
              </div>
            </div>
          )}
          {consequences.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-1">Consecuencias</p>
              <div className="space-y-0.5">
                {consequences.map((c: { field: string; value: string | number }, i: number) => (
                  <p key={i} className="text-[11px] font-mono text-sse-ink bg-[#F5F3FF] rounded px-2 py-0.5">
                    {c.field} = {String(c.value)}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface Props { wsId: string }

export function IIEConfiguration({ wsId: _wsId }: Props) {
  const [tab,      setTab]      = useState<ConfigTab>("parametros");
  const [category, setCategory] = useState("");

  const { data: configList = [], isLoading: cfgLoading } = useIIEConfiguration();
  const { data: ruleList   = [], isLoading: rulesLoading } = useIIEKnowledgeRules();

  const updateConfig = useUpdateIIEConfiguration();
  const updateRule   = useUpdateIIEKnowledgeRule();

  const categories = Array.from(new Set(configList.map((c) => c.category))).sort();

  const filteredConfig = category
    ? configList.filter((c) => c.category === category)
    : configList;

  function groupedConfig() {
    const groups: Record<string, IIEConfiguration[]> = {};
    for (const c of filteredConfig) {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    }
    return groups;
  }

  const ruleCategories = Array.from(new Set(ruleList.map((r) => r.category))).sort();
  const [ruleCategory, setRuleCategory] = useState("");
  const filteredRules = ruleCategory
    ? ruleList.filter((r) => r.category === ruleCategory)
    : ruleList;

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex rounded-lg border border-sse-border bg-white p-1 gap-1 w-fit">
        {(["parametros", "reglas"] as ConfigTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded px-4 py-1.5 text-[12px] font-medium transition-colors capitalize ${
              tab === t ? "bg-[#6D28D9] text-white" : "text-sse-muted hover:text-sse-ink"
            }`}>
            {t === "parametros" ? "Parámetros" : "Reglas de conocimiento"}
          </button>
        ))}
      </div>

      {/* Params tab */}
      {tab === "parametros" && (
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCategory("")}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${!category ? "bg-[#6D28D9] text-white" : "border border-sse-border text-sse-muted hover:text-sse-ink"}`}>
              Todos
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors capitalize ${category === cat ? "bg-[#6D28D9] text-white" : "border border-sse-border text-sse-muted hover:text-sse-ink"}`}>
                {CATEGORY_LABEL[cat] ?? cat}
              </button>
            ))}
          </div>

          {cfgLoading && <p className="py-8 text-center text-[13px] text-sse-muted">Cargando parámetros…</p>}

          {Object.entries(groupedConfig()).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-2 capitalize">{CATEGORY_LABEL[cat] ?? cat}</p>
              <div className="space-y-1.5">
                {items.map((cfg) => (
                  <ConfigParam key={cfg.id} cfg={cfg}
                    onSave={(key, val) => updateConfig.mutate({ key, value: val })} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rules tab */}
      {tab === "reglas" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
            <select value={ruleCategory} onChange={(e) => setRuleCategory(e.target.value)}
              className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
              <option value="">Todas las categorías</option>
              {ruleCategories.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c] ?? c}</option>)}
            </select>
            <span className="ml-auto text-[11px] text-sse-muted">
              {filteredRules.filter((r) => r.enabled).length} activa{filteredRules.filter((r) => r.enabled).length !== 1 ? "s" : ""} / {filteredRules.length} total
            </span>
          </div>

          {rulesLoading && <p className="py-8 text-center text-[13px] text-sse-muted">Cargando reglas…</p>}

          <div className="space-y-1.5">
            {filteredRules.map((rule) => (
              <RuleRow key={rule.id} rule={rule}
                onToggle={(id, enabled) => updateRule.mutate({ id, enabled })} />
            ))}
          </div>

          {!rulesLoading && filteredRules.length === 0 && (
            <p className="py-8 text-center text-[13px] text-sse-muted">Sin reglas disponibles.</p>
          )}
        </div>
      )}
    </div>
  );
}
