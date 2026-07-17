"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  getPlatformStatus,
  runStep,
  WIZARD_STEPS,
  type StepLog,
  type StepResult,
  type PlatformStatus,
} from "@/services/platform-bootstrap";

// ── Icon helpers ─────────────────────────────────────────────────────────────

function Icon({
  d,
  size = 16,
  strokeWidth = 1.8,
  className = "",
  color,
}: {
  d: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  check:   "M20 6L9 17l-5-5",
  x:       "M18 6 6 18M6 6l12 12",
  warn:    "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  spinner: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  play:    "M5 3l14 9-14 9V3z",
  rocket:  "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
  refresh: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15",
  info:    "M12 16v-4M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
} as const;

// ── Step status types ─────────────────────────────────────────────────────────

type StepStatus = "pending" | "running" | "ok" | "warning" | "error";

interface WizardStep {
  status: StepStatus;
  result: StepResult | null;
}

// ── Log level styles ──────────────────────────────────────────────────────────

function logLevelStyle(level: StepLog["level"]) {
  switch (level) {
    case "success": return { color: "#22c55e" };
    case "error":   return { color: "#f87171" };
    case "warn":    return { color: "#fbbf24" };
    default:        return { color: "rgba(255,255,255,0.55)" };
  }
}

function logPrefix(level: StepLog["level"]) {
  switch (level) {
    case "success": return "✓";
    case "error":   return "✗";
    case "warn":    return "⚠";
    default:        return "·";
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ index, status }: { index: number; status: StepStatus }) {
  const bg =
    status === "ok"      ? "#22c55e" :
    status === "warning" ? "#f59e0b" :
    status === "error"   ? "#ef4444" :
    status === "running" ? "#3b82f6" :
    "rgba(255,255,255,0.12)";

  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 700,
        color: status === "pending" ? "rgba(255,255,255,0.4)" : "white",
        transition: "background 0.3s",
        boxShadow: status === "running" ? "0 0 12px rgba(59,130,246,0.5)" : "none",
      }}
    >
      {status === "ok" && <Icon d={ICONS.check} size={13} strokeWidth={2.5} />}
      {status === "warning" && <Icon d={ICONS.warn} size={13} strokeWidth={2.5} />}
      {status === "error" && <Icon d={ICONS.x} size={13} strokeWidth={2.5} />}
      {status === "running" && (
        <span style={{ animation: "spin 1s linear infinite", display: "flex" }}>
          <Icon d={ICONS.spinner} size={13} strokeWidth={2} />
        </span>
      )}
      {status === "pending" && index + 1}
    </div>
  );
}

function LogPanel({ logs, loading }: { logs: StepLog[]; loading: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 12,
        lineHeight: 1.7,
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {logs.map((entry, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0, fontSize: 10, paddingTop: 2 }}>
            {new Date(entry.timestamp).toLocaleTimeString("es-SV")}
          </span>
          <span style={{ ...logLevelStyle(entry.level), flexShrink: 0 }}>
            {logPrefix(entry.level)}
          </span>
          <span style={{ ...logLevelStyle(entry.level), ...(entry.level === "info" ? { color: "rgba(255,255,255,0.7)" } : {}) }}>
            {entry.message}
          </span>
        </div>
      ))}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.3)" }}>
          <span style={{ animation: "blink 1s step-end infinite" }}>▌</span>
          <span>Procesando...</span>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export function InstallationWizard() {
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [steps, setSteps] = useState<WizardStep[]>(
    WIZARD_STEPS.map(() => ({ status: "pending" as StepStatus, result: null })),
  );
  const [allLogs, setAllLogs] = useState<StepLog[]>([]);
  const [done, setDone] = useState(false);
  const [aborted, setAborted] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    getPlatformStatus()
      .then(setPlatformStatus)
      .catch(() => setPlatformStatus({ installed: false, version: null, installDate: null }))
      .finally(() => setLoadingStatus(false));
  }, []);

  const appendLogs = useCallback((newLogs: StepLog[]) => {
    setAllLogs((prev) => [...prev, ...newLogs]);
  }, []);

  const setStepStatus = useCallback((index: number, status: StepStatus, result: StepResult | null = null) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { status, result };
      return next;
    });
  }, []);

  const runInstallation = useCallback(async () => {
    abortRef.current = false;
    setAborted(false);
    setRunning(true);
    setDone(false);
    setAllLogs([]);
    setSteps(WIZARD_STEPS.map(() => ({ status: "pending", result: null })));

    for (let i = 0; i < WIZARD_STEPS.length; i++) {
      if (abortRef.current) {
        setAborted(true);
        break;
      }

      setCurrentStep(i);
      setStepStatus(i, "running");

      try {
        const result = await runStep(WIZARD_STEPS[i].verb);
        appendLogs(result.logs);

        if (result.status === "error") {
          setStepStatus(i, "error", result);
          setRunning(false);
          setCurrentStep(i);
          return;
        }

        setStepStatus(i, result.status === "warning" ? "warning" : "ok", result);
      } catch (err) {
        const errLog: StepLog = {
          level: "error",
          message: `Error en paso ${i + 1}: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: new Date().toISOString(),
        };
        appendLogs([errLog]);
        setStepStatus(i, "error", null);
        setRunning(false);
        setCurrentStep(i);
        return;
      }
    }

    if (!abortRef.current) {
      setDone(true);
      getPlatformStatus().then(setPlatformStatus).catch(() => {});
    }
    setRunning(false);
    setCurrentStep(-1);
  }, [appendLogs, setStepStatus]);

  const retryFromStep = useCallback(async (fromIndex: number) => {
    abortRef.current = false;
    setAborted(false);
    setRunning(true);
    setDone(false);

    // Reset steps from the retry point
    setSteps((prev) => {
      const next = [...prev];
      for (let i = fromIndex; i < WIZARD_STEPS.length; i++) {
        next[i] = { status: "pending", result: null };
      }
      return next;
    });

    for (let i = fromIndex; i < WIZARD_STEPS.length; i++) {
      if (abortRef.current) {
        setAborted(true);
        break;
      }

      setCurrentStep(i);
      setStepStatus(i, "running");

      try {
        const result = await runStep(WIZARD_STEPS[i].verb);
        appendLogs(result.logs);

        if (result.status === "error") {
          setStepStatus(i, "error", result);
          setRunning(false);
          setCurrentStep(i);
          return;
        }

        setStepStatus(i, result.status === "warning" ? "warning" : "ok", result);
      } catch (err) {
        const errLog: StepLog = {
          level: "error",
          message: `Error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: new Date().toISOString(),
        };
        appendLogs([errLog]);
        setStepStatus(i, "error", null);
        setRunning(false);
        setCurrentStep(i);
        return;
      }
    }

    if (!abortRef.current) setDone(true);
    setRunning(false);
    setCurrentStep(-1);
  }, [appendLogs, setStepStatus]);

  const completedCount = steps.filter((s) => s.status === "ok" || s.status === "warning").length;
  const errorStep = steps.findIndex((s) => s.status === "error");
  const progressPct = (completedCount / WIZARD_STEPS.length) * 100;

  if (loadingStatus) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320, color: "rgba(255,255,255,0.4)", gap: 10 }}>
        <span style={{ animation: "spin 1s linear infinite", display: "flex" }}>
          <Icon d={ICONS.spinner} size={18} />
        </span>
        Verificando estado de la plataforma...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes slideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #080f1e 0%, #0d1a2e 60%, #111827 100%)",
        padding: "32px 24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg, #2E6BE6, #5B8DEF)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon d={ICONS.rocket} size={20} color="white" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                  Asistente de Instalación
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                  SSE-VRAF Platform · Configuración inicial automatizada
                </p>
              </div>
            </div>

            {/* Platform status badge */}
            {platformStatus?.installed ? (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 20,
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                color: "#22c55e", fontSize: 12, fontWeight: 600,
              }}>
                <Icon d={ICONS.shield} size={13} strokeWidth={2} />
                Plataforma instalada · v{platformStatus.version}
                {platformStatus.installDate && (
                  <span style={{ color: "rgba(34,197,94,0.7)", fontWeight: 400 }}>
                    · {new Date(platformStatus.installDate).toLocaleDateString("es-SV")}
                  </span>
                )}
              </div>
            ) : (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 20,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                color: "rgba(248,113,113,0.9)", fontSize: 12, fontWeight: 600,
              }}>
                <Icon d={ICONS.warn} size={13} strokeWidth={2} />
                Plataforma no inicializada
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Progreso de instalación</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                {completedCount} / {WIZARD_STEPS.length} pasos
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${progressPct}%`,
                background: done
                  ? "linear-gradient(90deg, #22c55e, #4ade80)"
                  : "linear-gradient(90deg, #2E6BE6, #5B8DEF)",
                borderRadius: 3,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>

            {/* LEFT: Step list */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                  Pasos de instalación
                </p>
              </div>
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
                {WIZARD_STEPS.map((step, i) => {
                  const s = steps[i];
                  const isActive = currentStep === i;
                  return (
                    <div
                      key={step.verb}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: isActive ? "rgba(59,130,246,0.1)" : "transparent",
                        border: isActive ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
                        transition: "all 0.2s",
                        animation: isActive ? "slideIn 0.2s ease" : "none",
                      }}
                    >
                      <StepIndicator index={i} status={s.status} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: isActive ? "white" : s.status !== "pending" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
                          lineHeight: 1.3,
                        }}>
                          {step.label}
                        </div>
                        {isActive && (
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, lineHeight: 1.3 }}>
                            {step.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Log panel + controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Log terminal */}
              <div style={{
                flex: 1,
                background: "#0b0f1a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minHeight: 380,
              }}>
                {/* Terminal header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                    platform-bootstrap.log
                  </span>
                  {running && (
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 700,
                      color: "#3b82f6", letterSpacing: "0.04em",
                      animation: "pulse 1.5s ease infinite",
                    }}>
                      ● EN EJECUCIÓN
                    </span>
                  )}
                  {done && !running && (
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#22c55e" }}>
                      ● COMPLETADO
                    </span>
                  )}
                </div>

                {/* Logs */}
                {allLogs.length === 0 && !running ? (
                  <div style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.15)", gap: 8,
                  }}>
                    <Icon d={ICONS.info} size={28} />
                    <span style={{ fontSize: 13 }}>
                      {platformStatus?.installed
                        ? "La plataforma ya está instalada. Puedes re-ejecutar para actualizar."
                        : "Presiona «Inicializar Plataforma» para comenzar la instalación."}
                    </span>
                  </div>
                ) : (
                  <LogPanel logs={allLogs} loading={running} />
                )}
              </div>

              {/* Error card */}
              {errorStep >= 0 && !running && (
                <div style={{
                  padding: "14px 16px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 12,
                  animation: "slideIn 0.25s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                        <Icon d={ICONS.x} size={14} strokeWidth={2.5} color="#f87171" />
                        <span style={{ color: "#f87171", fontSize: 13, fontWeight: 700 }}>
                          Error en paso {errorStep + 1}: {WIZARD_STEPS[errorStep].label}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(248,113,113,0.7)" }}>
                        {steps[errorStep].result?.errors?.join(", ") || "Consulta los logs para más detalles."}
                      </p>
                    </div>
                    <button
                      onClick={() => retryFromStep(errorStep)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 14px", borderRadius: 8,
                        background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                        color: "#fca5a5", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Icon d={ICONS.refresh} size={13} strokeWidth={2} />
                      Reintentar
                    </button>
                  </div>
                </div>
              )}

              {/* Success banner */}
              {done && !aborted && (
                <div style={{
                  padding: "14px 16px",
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: 12,
                  display: "flex", alignItems: "center", gap: 10,
                  animation: "slideIn 0.3s ease",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "rgba(34,197,94,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon d={ICONS.check} size={17} strokeWidth={2.5} color="#22c55e" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>
                      ¡Plataforma instalada correctamente!
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(34,197,94,0.7)", marginTop: 2 }}>
                      SSE-VRAF v1.0.0 lista para operar. Navega a cualquier workspace para comenzar.
                    </div>
                  </div>
                </div>
              )}

              {/* Action button */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={running ? undefined : runInstallation}
                  disabled={running}
                  style={{
                    flex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px 20px",
                    borderRadius: 12,
                    background: running
                      ? "rgba(59,130,246,0.2)"
                      : done
                        ? "rgba(34,197,94,0.15)"
                        : "linear-gradient(135deg, #2E6BE6, #4480f0)",
                    border: running
                      ? "1px solid rgba(59,130,246,0.3)"
                      : done
                        ? "1px solid rgba(34,197,94,0.25)"
                        : "none",
                    color: running ? "rgba(255,255,255,0.6)" : "white",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: running ? "default" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: running || done ? "none" : "0 4px 16px rgba(46,107,230,0.35)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {running ? (
                    <>
                      <span style={{ animation: "spin 1s linear infinite", display: "flex" }}>
                        <Icon d={ICONS.spinner} size={17} strokeWidth={2} />
                      </span>
                      Instalando — paso {currentStep + 1} de {WIZARD_STEPS.length}...
                    </>
                  ) : done ? (
                    <>
                      <Icon d={ICONS.refresh} size={17} strokeWidth={2} />
                      Reinstalar plataforma
                    </>
                  ) : (
                    <>
                      <Icon d={ICONS.rocket} size={17} strokeWidth={2} />
                      {platformStatus?.installed ? "Reinstalar plataforma" : "Inicializar Plataforma"}
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
