"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useICEPeriods, useICECaptura, useICECaptureVars,
  useICECaptureContext, useCreateICECaptura,
  useSaveICECaptureVars, useCalculateICECaptura, useSubmitICECaptura,
} from "@/hooks/useICE";
import type { ICECaptureContext, ICECalculationResult, ICECaptura } from "@/types/ice";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { n: 1 as Step, label: "Período" },
  { n: 2 as Step, label: "Indicador" },
  { n: 3 as Step, label: "Variables" },
  { n: 4 as Step, label: "Evidencias" },
  { n: 5 as Step, label: "Cálculo" },
  { n: 6 as Step, label: "Enviar" },
];

function StepBar({ current }: { current: Step }) {
  return (
    <nav className="flex items-center gap-1 mb-6">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center gap-1 flex-1">
          <div className={`flex items-center gap-1.5 ${s.n <= current ? "text-sky-700" : "text-sse-muted"}`}>
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
              ${s.n < current ? "bg-sky-600 text-white" : s.n === current ? "bg-sky-100 border border-sky-500 text-sky-700" : "bg-sse-border/40 text-sse-muted"}`}>
              {s.n < current ? "✓" : s.n}
            </span>
            <span className="text-[11px] font-medium hidden sm:inline">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-1 ${s.n < current ? "bg-sky-400" : "bg-sse-border"}`} />
          )}
        </div>
      ))}
    </nav>
  );
}

// Step 1 — Select period
function StepPeriod({ onSelect }: { onSelect: (id: string) => void }) {
  const { data: periods, isLoading } = useICEPeriods({ estado: "abierto" });
  if (isLoading) return <p className="text-[12px] text-sse-muted">Cargando períodos…</p>;
  if (!periods?.length) return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-700">
      No hay períodos abiertos. Contacta al administrador para abrir un período.
    </div>
  );
  return (
    <div className="space-y-2">
      {periods.map(p => (
        <button key={p.id} onClick={() => onSelect(p.id)}
          className="w-full text-left rounded-lg border border-sse-border bg-white hover:border-sky-400 hover:bg-sky-50 p-4 transition-colors">
          <p className="text-[13px] font-semibold text-sse-ink">{p.nombre}</p>
          <p className="text-[11px] text-sse-muted mt-0.5">
            {p.inicio} – {p.fin} · <span className="text-sky-700 font-medium">Abierto</span>
          </p>
        </button>
      ))}
    </div>
  );
}

// Step 2 — Select indicator
function StepIndicador({ periodId, onSelect }: { periodId: string; onSelect: (id: string) => void }) {
  const { data: context } = useICECaptureContext("", periodId);
  const [query, setQuery] = useState("");

  // context may have available indicators; fall back to a list message
  const indicators = useMemo(() => {
    if (!context) return [];
    // context is per indicator — but here we need the list; use a different approach
    return [];
  }, [context]);

  return (
    <div className="space-y-3">
      <input
        value={query} onChange={e => setQuery(e.target.value)}
        placeholder="Buscar indicador por nombre o código…"
        className="w-full text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
      />
      <p className="text-[11px] text-sse-muted">
        Ingresa el ID del indicador o selecciona desde Mis Indicadores en el panel lateral.
      </p>
      <div className="mt-2">
        <label className="text-[11px] font-medium text-sse-muted block mb-1">ID del indicador</label>
        <div className="flex gap-2">
          <input id="ind-id" placeholder="IDE-XXX-001"
            className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            onClick={() => {
              const val = (document.getElementById("ind-id") as HTMLInputElement)?.value?.trim();
              if (val) onSelect(val);
            }}
            className="text-[12px] px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium">
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 3 — Variables input
function StepVariables({
  captureId, context, onSaved,
}: { captureId: string; context: ICECaptureContext; onSaved: () => void }) {
  const { data: vars, isLoading } = useICECaptureVars(captureId);
  const saveVars = useSaveICECaptureVars();
  const [values, setValues] = useState<Record<string, string>>({});

  const variables = context.formula?.variables ?? [];

  const handleSave = async () => {
    const entries = variables.map(v => ({
      variableId:  v.id,
      variableName: v.nombre,
      value: parseFloat(values[v.id] ?? "0") || 0,
      rawInput: values[v.id] ?? "",
    }));
    await saveVars.mutateAsync({ captureId, variables: entries });
    onSaved();
  };

  if (isLoading) return <p className="text-[12px] text-sse-muted">Cargando variables…</p>;

  if (!variables.length) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-700">
        El indicador no tiene variables definidas en FormulaEngine.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3">
        <p className="text-[11px] font-semibold text-sky-800">Fórmula: <span className="font-mono">{context.formula?.formulaVisible ?? "—"}</span></p>
        <p className="text-[11px] text-sky-700 mt-0.5">Meta: {context.indicator?.meta ?? "—"}</p>
      </div>

      <div className="space-y-3">
        {variables.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).map(v => {
          const saved = vars?.find(sv => sv.variableId === v.id);
          return (
            <div key={v.id}>
              <label className="text-[12px] font-medium text-sse-ink block mb-1">
                {v.nombre}
                <span className="ml-1 text-[10px] text-sse-muted font-mono">({v.codigo})</span>
              </label>
              <input
                type="number" step="any"
                defaultValue={saved?.value ?? ""}
                onChange={e => setValues(prev => ({ ...prev, [v.id]: e.target.value }))}
                placeholder="0"
                className="w-full text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 tabular-nums"
              />
            </div>
          );
        })}
      </div>

      <button onClick={handleSave} disabled={saveVars.isPending}
        className="text-[12px] px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium disabled:opacity-60">
        {saveVars.isPending ? "Guardando…" : "Guardar variables"}
      </button>
      {saveVars.isError && <p className="text-[11px] text-red-600">Error al guardar. Intente nuevamente.</p>}
    </div>
  );
}

// Step 4 — Evidence links (EME refs)
function StepEvidencias({ captureId, onNext }: { captureId: string; onNext: () => void }) {
  const [ref, setRef] = useState("");
  const [refs, setRefs] = useState<string[]>([]);

  const addRef = () => {
    const trimmed = ref.trim();
    if (trimmed && !refs.includes(trimmed)) {
      setRefs(prev => [...prev, trimmed]);
      setRef("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4 text-[12px] text-sse-muted">
        Las evidencias se almacenan en EME. Ingresa el ID de cada evidencia vinculada al indicador.
      </div>
      <div className="flex gap-2">
        <input value={ref} onChange={e => setRef(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addRef()}
          placeholder="EME-DOC-001"
          className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button onClick={addRef}
          className="text-[12px] px-3 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          + Agregar
        </button>
      </div>
      {refs.length > 0 && (
        <div className="space-y-1">
          {refs.map(r => (
            <div key={r} className="flex items-center justify-between rounded-md border border-sse-border bg-white px-3 py-2">
              <span className="text-[12px] font-mono text-sse-ink">{r}</span>
              <button onClick={() => setRefs(prev => prev.filter(x => x !== r))}
                className="text-[11px] text-red-500 hover:text-red-700">Quitar</button>
            </div>
          ))}
        </div>
      )}
      <button onClick={onNext}
        className="text-[12px] px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium">
        {refs.length > 0 ? "Guardar y continuar" : "Continuar sin evidencias"}
      </button>
    </div>
  );
}

// Step 5 — Preview calculation
function StepCalculo({
  captureId, onCalculated,
}: { captureId: string; onCalculated: (c: ICECaptura & { calculation: ICECalculationResult }) => void }) {
  const calc = useCalculateICECaptura();

  const run = async () => {
    const result = await calc.mutateAsync(captureId);
    onCalculated(result);
  };

  return (
    <div className="space-y-4">
      {!calc.data && (
        <div className="rounded-lg border border-sky-100 bg-sky-50 p-4 text-[12px] text-sky-800">
          FormulaEngine calculará el resultado automáticamente usando las variables ingresadas. No puedes ingresar el resultado manualmente.
        </div>
      )}

      {calc.data && (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-[11px] font-semibold text-green-800 mb-2">Resultado calculado</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-green-700">Resultado</p>
                <p className="text-[20px] font-bold text-green-800 tabular-nums">{calc.data.resultado ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-green-700">Cumplimiento</p>
                <p className="text-[20px] font-bold text-green-800 tabular-nums">
                  {calc.data.cumplimiento !== null && calc.data.cumplimiento !== undefined ? `${calc.data.cumplimiento}%` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-green-700">Nivel de rango</p>
                <p className="text-[13px] font-semibold text-green-800">{calc.data.rangeLevel ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-green-700">Meta</p>
                <p className="text-[13px] font-semibold text-green-800 tabular-nums">{calc.data.meta ?? "—"}</p>
              </div>
            </div>
          </div>
          {calc.data.calculation?.formula && (
            <div className="rounded-lg border border-sse-border bg-sse-surface p-3">
              <p className="text-[10px] text-sse-muted mb-1">Fórmula aplicada</p>
              <p className="text-[12px] font-mono text-sse-ink">{calc.data.calculation.formula}</p>
            </div>
          )}
        </div>
      )}

      {calc.isError && <p className="text-[11px] text-red-600">Error en el cálculo. Verifique las variables e intente nuevamente.</p>}

      <button onClick={run} disabled={calc.isPending}
        className="text-[12px] px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium disabled:opacity-60">
        {calc.isPending ? "Calculando…" : calc.data ? "Recalcular" : "Calcular resultado"}
      </button>
    </div>
  );
}

// Step 6 — Submit
function StepEnviar({ captureId, onSubmitted }: { captureId: string; onSubmitted: () => void }) {
  const { data: capture } = useICECaptura(captureId);
  const submit = useSubmitICECaptura();
  const [comments, setComments] = useState("");

  const handleSubmit = async () => {
    await submit.mutateAsync(captureId);
    onSubmitted();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-2">
        <p className="text-[12px] font-semibold text-sse-ink">Resumen de la captura</p>
        <div className="text-[11px] text-sse-muted space-y-1">
          <p>Indicador: <span className="text-sse-ink font-medium">{capture?.indicatorId ?? "—"}</span></p>
          <p>Período: <span className="text-sse-ink font-medium">{capture?.periodId ?? "—"}</span></p>
          <p>Resultado: <span className="text-sse-ink font-bold tabular-nums">{capture?.resultado ?? "—"}</span></p>
          <p>Cumplimiento: <span className="text-sse-ink font-bold tabular-nums">
            {capture?.cumplimiento !== null && capture?.cumplimiento !== undefined ? `${capture.cumplimiento}%` : "—"}
          </span></p>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-medium text-sse-muted block mb-1">Comentarios (opcional)</label>
        <textarea value={comments} onChange={e => setComments(e.target.value)} rows={3}
          placeholder="Observaciones sobre esta captura…"
          className="w-full text-[12px] px-3 py-2 rounded-lg border border-sse-border bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
        />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-700">
        Al enviar, la captura pasará al flujo de aprobación. No podrás editarla hasta que sea revisada.
      </div>

      <button onClick={handleSubmit} disabled={submit.isPending}
        className="text-[12px] px-5 py-2.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-semibold disabled:opacity-60">
        {submit.isPending ? "Enviando…" : "Enviar al flujo de aprobación"}
      </button>
      {submit.isError && <p className="text-[11px] text-red-600">Error al enviar. Intente nuevamente.</p>}
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

interface WizardState {
  periodId:    string;
  indicatorId: string;
  captureId:   string;
}

export function CaptureWizard({ wsId, initialCaptureId }: { wsId: string; initialCaptureId?: string }) {
  const router = useRouter();
  const [step, setStep]   = useState<Step>(initialCaptureId ? 3 : 1);
  const [state, setState] = useState<WizardState>({
    periodId:    "",
    indicatorId: "",
    captureId:   initialCaptureId ?? "",
  });
  const [context, setContext] = useState<ICECaptureContext | null>(null);
  const [done, setDone]       = useState(false);

  const createCaptura = useCreateICECaptura();
  const { data: ctx } = useICECaptureContext(state.indicatorId, state.periodId);

  const handlePeriodSelect = (id: string) => {
    setState(s => ({ ...s, periodId: id }));
    setStep(2);
  };

  const handleIndicatorSelect = async (id: string) => {
    setState(s => ({ ...s, indicatorId: id }));
    // Create a draft capture now
    const cap = await createCaptura.mutateAsync({ indicatorId: id, periodId: state.periodId });
    setState(s => ({ ...s, captureId: cap.id }));
    if (ctx) setContext(ctx);
    setStep(3);
  };

  if (done) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-green-600">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-[14px] font-semibold text-sse-ink">Captura enviada exitosamente</p>
        <p className="text-[12px] text-sse-muted">La captura está ahora en el flujo de aprobación.</p>
        <div className="flex gap-2 justify-center mt-4">
          <button onClick={() => { setStep(1); setState({ periodId: "", indicatorId: "", captureId: "" }); setDone(false); }}
            className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
            Nueva captura
          </button>
          <button onClick={() => router.push(`/ws/${wsId}/ice-mis-indicadores`)}
            className="text-[12px] px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700">
            Mis indicadores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepBar current={step} />

      <div className="min-h-[240px]">
        {step === 1 && <StepPeriod onSelect={handlePeriodSelect} />}
        {step === 2 && <StepIndicador periodId={state.periodId} onSelect={handleIndicatorSelect} />}
        {step === 3 && state.captureId && (ctx || context) && (
          <StepVariables
            captureId={state.captureId}
            context={(ctx ?? context)!}
            onSaved={() => setStep(4)}
          />
        )}
        {step === 4 && state.captureId && (
          <StepEvidencias captureId={state.captureId} onNext={() => setStep(5)} />
        )}
        {step === 5 && state.captureId && (
          <StepCalculo captureId={state.captureId} onCalculated={() => setStep(6)} />
        )}
        {step === 6 && state.captureId && (
          <StepEnviar captureId={state.captureId} onSubmitted={() => setDone(true)} />
        )}
      </div>

      {step > 1 && !done && step !== 3 && step !== 5 && step !== 6 && (
        <button onClick={() => setStep(prev => (prev - 1) as Step)}
          className="mt-4 text-[11px] text-sse-muted hover:text-sse-ink">
          ← Atrás
        </button>
      )}
    </div>
  );
}
