"use client";

/**
 * AutomationBuilder — No-code automation editor.
 * Visual flow: Trigger → Conditions → Actions → Retry Policy → Test
 */

import { useState, useEffect } from "react";
import {
  AutomationConfig,
  TipoTrigger,
  TipoAccionAuto,
  CondicionAutomation,
  AccionAutomation,
  PoliticaReintento,
  BuilderBase,
  BUILDER_REGISTRY,
} from "@/types/builders";
import {
  useBuilderList,
  useBuilderSave,
  useBuilderPublish,
  useBuilderDuplicate,
  useBuilderDelete,
} from "@/hooks/useBuilder";
import { BuilderShell, StatusBadge } from "@/components/builders/BuilderShell";

// ─── Style constants ──────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  fontSize: 12,
  outline: "none",
  boxSizing: "border-box",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "rgba(255,255,255,0.55)",
  marginBottom: 4,
  fontWeight: 500,
};

function card(borderColor: string): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.025)",
    border: `1px solid ${borderColor}`,
    borderRadius: 10,
    overflow: "hidden",
  };
}

function cardHead(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    padding: "9px 14px",
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.07em",
    color,
  };
}

const cardBody: React.CSSProperties = { padding: "14px 16px" };

function btn(
  color: string,
  bg: string,
  extra?: React.CSSProperties
): React.CSSProperties {
  return {
    padding: "7px 14px",
    borderRadius: 6,
    border: `1px solid ${color}`,
    background: bg,
    color,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    ...extra,
  };
}

const iconBtn: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "rgba(255,255,255,0.45)",
  fontSize: 13,
  lineHeight: 1,
  cursor: "pointer",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const TRIGGER_LABELS: Record<TipoTrigger, string> = {
  proceso_etapa_cambia: "Etapa de proceso cambia",
  campo_actualizado: "Campo actualizado",
  formulario_enviado: "Formulario enviado",
  fecha_limite_proxima: "Fecha límite próxima",
  kpi_umbral: "Umbral de KPI",
  manual: "Manual",
  calendario: "Calendario",
};

const ACCION_LABELS: Record<TipoAccionAuto, string> = {
  enviar_email: "Enviar email",
  crear_tarea: "Crear tarea",
  notificar_inapp: "Notificar en app",
  actualizar_campo: "Actualizar campo",
  crear_proceso: "Crear proceso",
  llamar_webhook: "Llamar webhook",
  generar_documento: "Generar documento",
};

function defaultRetry(): PoliticaReintento {
  return { maxIntentos: 3, intervalosMinutos: [5, 15, 60], notificarFallo: true };
}

type AutomationDraft = Omit<AutomationConfig, "createdAt" | "updatedAt">;

function blankDraft(wsId: string): AutomationDraft {
  return {
    id: uid(),
    wsId,
    nombre: "Nueva automatización",
    descripcion: "",
    version: 1,
    status: "draft",
    creadoPor: "",
    tipo: "automation",
    trigger: "manual",
    triggerConfig: {},
    condiciones: [],
    acciones: [],
    activa: false,
    politicaReintento: defaultRetry(),
  };
}

// ─── Arrow connector ──────────────────────────────────────────────────────────

function Arrow() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "4px 0",
        gap: 0,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        style={{ width: 2, height: 20, background: "rgba(255,255,255,0.13)" }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "8px solid rgba(255,255,255,0.13)",
        }}
      />
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  labelText,
  accentColor = "#ef4444",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelText: string;
  accentColor?: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: checked ? accentColor : "rgba(255,255,255,0.12)",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 17 : 3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.18s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
        {labelText}
      </span>
    </label>
  );
}

// ─── Trigger config fields ────────────────────────────────────────────────────

function TriggerConfig({
  trigger,
  config,
  onChange,
}: {
  trigger: TipoTrigger;
  config: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
}) {
  const v = (key: string) => (config[key] as string) ?? "";

  if (trigger === "manual") {
    return (
      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          color: "rgba(255,255,255,0.35)",
          fontStyle: "italic",
        }}
      >
        Sin configuración — se activa manualmente o desde otra automatización.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
      {trigger === "proceso_etapa_cambia" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <div>
            <label style={label}>Proceso</label>
            <input
              style={inputStyle}
              value={v("proceso")}
              onChange={(e) => onChange("proceso", e.target.value)}
              placeholder="ID del proceso"
            />
          </div>
          <div>
            <label style={label}>Etapa destino</label>
            <input
              style={inputStyle}
              value={v("etapa")}
              onChange={(e) => onChange("etapa", e.target.value)}
              placeholder="Nombre de etapa"
            />
          </div>
        </div>
      )}

      {trigger === "campo_actualizado" && (
        <div>
          <label style={label}>Campo</label>
          <input
            style={inputStyle}
            value={v("campo")}
            onChange={(e) => onChange("campo", e.target.value)}
            placeholder="Nombre del campo"
          />
        </div>
      )}

      {trigger === "formulario_enviado" && (
        <div>
          <label style={label}>Formulario ID</label>
          <input
            style={inputStyle}
            value={v("formularioId")}
            onChange={(e) => onChange("formularioId", e.target.value)}
            placeholder="ID del formulario"
          />
        </div>
      )}

      {trigger === "fecha_limite_proxima" && (
        <div>
          <label style={label}>Días de anticipación</label>
          <input
            type="number"
            style={inputStyle}
            value={v("dias")}
            onChange={(e) => onChange("dias", e.target.value)}
            placeholder="7"
            min={1}
          />
        </div>
      )}

      {trigger === "kpi_umbral" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <div>
            <label style={label}>KPI ID</label>
            <input
              style={inputStyle}
              value={v("kpiId")}
              onChange={(e) => onChange("kpiId", e.target.value)}
              placeholder="ID del KPI"
            />
          </div>
          <div>
            <label style={label}>Umbral</label>
            <select
              style={inputStyle}
              value={v("umbral")}
              onChange={(e) => onChange("umbral", e.target.value)}
            >
              <option value="">Seleccionar...</option>
              <option value="por_debajo">Por debajo del umbral</option>
              <option value="por_encima">Por encima del umbral</option>
            </select>
          </div>
        </div>
      )}

      {trigger === "calendario" && (
        <div>
          <label style={label}>Fecha/hora</label>
          <input
            type="datetime-local"
            style={inputStyle}
            value={v("fechaHora")}
            onChange={(e) => onChange("fechaHora", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Condition row ────────────────────────────────────────────────────────────

function CondicionRow({
  condicion,
  onChange,
  onDelete,
}: {
  condicion: CondicionAutomation;
  onChange: (c: CondicionAutomation) => void;
  onDelete: () => void;
}) {
  function upd<K extends keyof CondicionAutomation>(
    key: K,
    val: CondicionAutomation[K]
  ) {
    onChange({ ...condicion, [key]: val });
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 110px 1fr 52px 30px",
        gap: 6,
        alignItems: "center",
        marginBottom: 7,
      }}
    >
      <input
        style={inputStyle}
        value={condicion.campo}
        onChange={(e) => upd("campo", e.target.value)}
        placeholder="Campo"
      />
      <select
        style={inputStyle}
        value={condicion.operador}
        onChange={(e) =>
          upd(
            "operador",
            e.target.value as CondicionAutomation["operador"]
          )
        }
      >
        <option value="igual">= igual</option>
        <option value="no_igual">≠ distinto</option>
        <option value="mayor">&gt; mayor</option>
        <option value="menor">&lt; menor</option>
        <option value="contiene">contiene</option>
        <option value="vacio">vacío</option>
      </select>
      <input
        style={inputStyle}
        value={condicion.valor}
        onChange={(e) => upd("valor", e.target.value)}
        placeholder="Valor"
      />
      <select
        style={inputStyle}
        value={condicion.conector}
        onChange={(e) =>
          upd("conector", e.target.value as CondicionAutomation["conector"])
        }
      >
        <option value="y">Y</option>
        <option value="o">O</option>
      </select>
      <button
        style={{
          ...iconBtn,
          color: "#ef4444",
          borderColor: "rgba(239,68,68,0.25)",
          fontSize: 16,
        }}
        onClick={onDelete}
        title="Eliminar condición"
      >
        ×
      </button>
    </div>
  );
}

// ─── Action config (expanded) ─────────────────────────────────────────────────

function AccionConfig({
  tipo,
  config,
  onChange,
}: {
  tipo: TipoAccionAuto;
  config: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
}) {
  const v = (key: string) => (config[key] as string) ?? "";

  const row = (children: React.ReactNode) => (
    <div style={{ display: "grid", gap: 8 }}>{children}</div>
  );

  const field = (
    lbl: string,
    input: React.ReactNode,
    half?: boolean
  ) => (
    <div style={{ gridColumn: half ? "auto" : "1 / -1" }}>
      <label style={label}>{lbl}</label>
      {input}
    </div>
  );

  const twoCol = (a: React.ReactNode, b: React.ReactNode) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {a}
      {b}
    </div>
  );

  return (
    <div
      style={{
        marginTop: 8,
        paddingTop: 10,
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {tipo === "enviar_email" &&
        row(
          <>
            {field(
              "Asunto",
              <input
                style={inputStyle}
                value={v("asunto")}
                onChange={(e) => onChange("asunto", e.target.value)}
                placeholder="Asunto del email"
              />
            )}
            {field(
              "Destinatario",
              <input
                style={inputStyle}
                value={v("destinatario")}
                onChange={(e) => onChange("destinatario", e.target.value)}
                placeholder="email@dominio.com o {{variable}}"
              />
            )}
          </>
        )}

      {tipo === "crear_tarea" &&
        row(
          <>
            {field(
              "Título",
              <input
                style={inputStyle}
                value={v("titulo")}
                onChange={(e) => onChange("titulo", e.target.value)}
                placeholder="Título de la tarea"
              />
            )}
            {field(
              "Responsable",
              <input
                style={inputStyle}
                value={v("responsable")}
                onChange={(e) => onChange("responsable", e.target.value)}
                placeholder="ID o email del responsable"
              />
            )}
          </>
        )}

      {tipo === "notificar_inapp" && (
        <div>
          <label style={label}>Mensaje</label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
            value={v("mensaje")}
            onChange={(e) => onChange("mensaje", e.target.value)}
            placeholder="Texto del mensaje en la aplicación..."
          />
        </div>
      )}

      {tipo === "actualizar_campo" &&
        twoCol(
          <div>
            <label style={label}>Campo</label>
            <input
              style={inputStyle}
              value={v("campo")}
              onChange={(e) => onChange("campo", e.target.value)}
              placeholder="Nombre del campo"
            />
          </div>,
          <div>
            <label style={label}>Valor</label>
            <input
              style={inputStyle}
              value={v("valor")}
              onChange={(e) => onChange("valor", e.target.value)}
              placeholder="Nuevo valor"
            />
          </div>
        )}

      {tipo === "llamar_webhook" &&
        row(
          <>
            {field(
              "URL",
              <input
                style={inputStyle}
                value={v("url")}
                onChange={(e) => onChange("url", e.target.value)}
                placeholder="https://api.dominio.com/endpoint"
              />
            )}
            {field(
              "Método HTTP",
              <select
                style={inputStyle}
                value={v("metodo") || "POST"}
                onChange={(e) => onChange("metodo", e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            )}
          </>
        )}

      {tipo === "generar_documento" && (
        <div>
          <label style={label}>Plantilla</label>
          <input
            style={inputStyle}
            value={v("plantilla")}
            onChange={(e) => onChange("plantilla", e.target.value)}
            placeholder="ID o nombre de la plantilla"
          />
        </div>
      )}

      {tipo === "crear_proceso" && (
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            fontStyle: "italic",
          }}
        >
          El proceso se iniciará con la configuración por defecto del workspace.
        </div>
      )}
    </div>
  );
}

// ─── Action row ───────────────────────────────────────────────────────────────

function AccionRow({
  accion,
  onChange,
  onDelete,
}: {
  accion: AccionAutomation;
  onChange: (a: AccionAutomation) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function upd<K extends keyof AccionAutomation>(
    key: K,
    val: AccionAutomation[K]
  ) {
    onChange({ ...accion, [key]: val });
  }

  function updConfig(key: string, val: unknown) {
    onChange({ ...accion, config: { ...accion.config, [key]: val } });
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 34px 30px",
          gap: 7,
          alignItems: "center",
        }}
      >
        <select
          style={inputStyle}
          value={accion.tipo}
          onChange={(e) => upd("tipo", e.target.value as TipoAccionAuto)}
        >
          {(Object.entries(ACCION_LABELS) as [TipoAccionAuto, string][]).map(
            ([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            )
          )}
        </select>

        <div style={{ position: "relative" }}>
          <input
            type="number"
            style={{ ...inputStyle, paddingRight: 30 }}
            value={accion.delayMinutos ?? 0}
            onChange={(e) => upd("delayMinutos", Math.max(0, Number(e.target.value)))}
            min={0}
            title="Retraso en minutos antes de ejecutar esta acción"
          />
          <span
            style={{
              position: "absolute",
              right: 7,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              pointerEvents: "none",
            }}
          >
            min
          </span>
        </div>

        <button
          style={{
            ...iconBtn,
            fontSize: 11,
            color: expanded ? "#22c55e" : "rgba(255,255,255,0.4)",
            borderColor: expanded
              ? "rgba(34,197,94,0.3)"
              : "rgba(255,255,255,0.1)",
          }}
          onClick={() => setExpanded(!expanded)}
          title={expanded ? "Cerrar configuración" : "Abrir configuración"}
        >
          {expanded ? "▲" : "▼"}
        </button>

        <button
          style={{
            ...iconBtn,
            color: "#ef4444",
            borderColor: "rgba(239,68,68,0.25)",
            fontSize: 16,
          }}
          onClick={onDelete}
          title="Eliminar acción"
        >
          ×
        </button>
      </div>

      {/* Delay label */}
      <div
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
          marginTop: 4,
          textAlign: "right",
        }}
      >
        Retraso (min)
      </div>

      {expanded && (
        <AccionConfig
          tipo={accion.tipo}
          config={accion.config}
          onChange={updConfig}
        />
      )}
    </div>
  );
}

// ─── AutomationBuilder ────────────────────────────────────────────────────────

export function AutomationBuilder({ wsId }: { wsId: string }) {
  const meta = BUILDER_REGISTRY.find((m) => m.tipo === "automation")!;

  // Hooks
  const { data: items, isLoading, refetch } = useBuilderList<AutomationConfig>(wsId, "automation");
  const saveMutation = useBuilderSave<AutomationConfig>(wsId, "automation");
  const publishMutation = useBuilderPublish(wsId, "automation");
  const dupMutation = useBuilderDuplicate(wsId, "automation");
  const deleteMutation = useBuilderDelete(wsId, "automation");

  // Local state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AutomationDraft | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const selectedItem = (items ?? []).find((i) => i.id === selectedId);

  // Sync selected item → draft
  useEffect(() => {
    if (selectedItem) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...rest } = selectedItem;
      setDraft(rest);
      setTestResult(null);
      setDeleteConfirm(false);
    }
  }, [selectedId, selectedItem?.updatedAt]);

  // ── Draft mutation helpers ────────────────────────────────────────────────

  function upd<K extends keyof AutomationDraft>(
    key: K,
    val: AutomationDraft[K]
  ) {
    setDraft((d) => (d ? { ...d, [key]: val } : d));
  }

  function updTriggerConfig(key: string, val: unknown) {
    setDraft((d) =>
      d ? { ...d, triggerConfig: { ...d.triggerConfig, [key]: val } } : d
    );
  }

  function updRetry<K extends keyof PoliticaReintento>(
    key: K,
    val: PoliticaReintento[K]
  ) {
    setDraft((d) =>
      d ? { ...d, politicaReintento: { ...d.politicaReintento, [key]: val } } : d
    );
  }

  // Conditions
  function addCondicion() {
    const c: CondicionAutomation = {
      id: uid(),
      campo: "",
      operador: "igual",
      valor: "",
      conector: "y",
    };
    setDraft((d) => (d ? { ...d, condiciones: [...d.condiciones, c] } : d));
  }

  function updCondicion(idx: number, c: CondicionAutomation) {
    setDraft((d) => {
      if (!d) return d;
      const condiciones = [...d.condiciones];
      condiciones[idx] = c;
      return { ...d, condiciones };
    });
  }

  function delCondicion(idx: number) {
    setDraft((d) =>
      d ? { ...d, condiciones: d.condiciones.filter((_, i) => i !== idx) } : d
    );
  }

  // Actions
  function addAccion() {
    const a: AccionAutomation = {
      id: uid(),
      tipo: "notificar_inapp",
      config: {},
      delayMinutos: 0,
    };
    setDraft((d) => (d ? { ...d, acciones: [...d.acciones, a] } : d));
  }

  function updAccion(idx: number, a: AccionAutomation) {
    setDraft((d) => {
      if (!d) return d;
      const acciones = [...d.acciones];
      acciones[idx] = a;
      return { ...d, acciones };
    });
  }

  function delAccion(idx: number) {
    setDraft((d) =>
      d ? { ...d, acciones: d.acciones.filter((_, i) => i !== idx) } : d
    );
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  function handleNew() {
    setSelectedId(null);
    setDraft(blankDraft(wsId));
    setTestResult(null);
    setDeleteConfirm(false);
  }

  async function handleSave() {
    if (!draft) return;
    const saved = await saveMutation.mutateAsync(draft as Parameters<typeof saveMutation.mutateAsync>[0]);
    if (!selectedId) setSelectedId(saved.id);
    await refetch();
  }

  async function handlePublish() {
    if (!draft) return;
    const saved = await saveMutation.mutateAsync(draft as Parameters<typeof saveMutation.mutateAsync>[0]);
    await publishMutation.mutateAsync(saved.id);
    setDraft((d) => (d ? { ...d, status: "published" } : d));
    await refetch();
  }

  async function handleDuplicate() {
    if (!selectedId) return;
    await dupMutation.mutateAsync(selectedId);
    await refetch();
  }

  async function handleDelete() {
    if (!selectedId) return;
    await deleteMutation.mutateAsync(selectedId);
    setSelectedId(null);
    setDraft(null);
    setDeleteConfirm(false);
    await refetch();
  }

  function handleTest() {
    if (!draft || testing) return;
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult("✓ Automatización ejecutada correctamente");
    }, 1000);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const saving = saveMutation.isPending;
  const publishing = publishMutation.isPending;

  return (
    <BuilderShell
      wsId={wsId}
      meta={meta}
      items={(items ?? []) as BuilderBase[]}
      selectedId={selectedId}
      onSelect={(id) => setSelectedId(id)}
      onNew={handleNew}
      isLoading={isLoading}
    >
      {!draft ? (
        // Empty state
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          <svg
            width={48}
            height={48}
            viewBox="0 0 24 24"
            fill="none"
            opacity={0.35}
          >
            <path
              d="M13 10V3L4 14h7v7l9-11h-7z"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ fontSize: 14, textAlign: "center", maxWidth: 280 }}>
            Selecciona una automatización de la lista o crea una nueva.
          </div>
        </div>
      ) : (
        // Editor
        <div
          style={{
            padding: "20px 24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            minHeight: "100%",
          }}
        >
          {/* ── Editor header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: 22,
            }}
          >
            <div style={{ flex: 1 }}>
              <input
                style={{
                  ...inputStyle,
                  fontSize: 17,
                  fontWeight: 700,
                  background: "transparent",
                  border: "none",
                  borderBottom: "2px solid rgba(255,255,255,0.09)",
                  borderRadius: 0,
                  padding: "3px 0",
                  color: "white",
                }}
                value={draft.nombre}
                onChange={(e) => upd("nombre", e.target.value)}
                placeholder="Nombre de la automatización"
              />
              <input
                style={{
                  ...inputStyle,
                  marginTop: 6,
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 0,
                  padding: "3px 0",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                }}
                value={draft.descripcion ?? ""}
                onChange={(e) => upd("descripcion", e.target.value)}
                placeholder="Descripción opcional..."
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusBadge status={draft.status} />
                {selectedId && (
                  <>
                    <button
                      style={{
                        ...btn(
                          "rgba(255,255,255,0.5)",
                          "rgba(255,255,255,0.05)"
                        ),
                        padding: "4px 10px",
                        fontSize: 11,
                      }}
                      onClick={handleDuplicate}
                      title="Duplicar automatización"
                    >
                      Duplicar
                    </button>
                    {!deleteConfirm ? (
                      <button
                        style={{
                          ...btn(
                            "rgba(239,68,68,0.7)",
                            "rgba(239,68,68,0.08)"
                          ),
                          padding: "4px 10px",
                          fontSize: 11,
                        }}
                        onClick={() => setDeleteConfirm(true)}
                      >
                        Eliminar
                      </button>
                    ) : (
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 5 }}
                      >
                        <span
                          style={{ fontSize: 11, color: "rgba(239,68,68,0.9)" }}
                        >
                          ¿Confirmar?
                        </span>
                        <button
                          style={{
                            ...btn("#ef4444", "rgba(239,68,68,0.2)"),
                            padding: "3px 8px",
                            fontSize: 11,
                          }}
                          onClick={handleDelete}
                        >
                          Sí
                        </button>
                        <button
                          style={{
                            ...btn(
                              "rgba(255,255,255,0.4)",
                              "rgba(255,255,255,0.05)"
                            ),
                            padding: "3px 8px",
                            fontSize: 11,
                          }}
                          onClick={() => setDeleteConfirm(false)}
                        >
                          No
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <Toggle
                checked={draft.activa}
                onChange={(v) => upd("activa", v)}
                labelText="Activa"
              />
            </div>
          </div>

          {/* ── SECTION 1: TRIGGER ── */}
          <div style={card("rgba(239,68,68,0.35)")}>
            <div style={cardHead("rgba(239,68,68,0.15)", "#ef4444")}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              DISPARADOR
            </div>
            <div style={cardBody}>
              <label style={label}>Tipo de disparador</label>
              <select
                style={inputStyle}
                value={draft.trigger}
                onChange={(e) => {
                  upd("trigger", e.target.value as TipoTrigger);
                  setDraft((d) => (d ? { ...d, triggerConfig: {} } : d));
                }}
              >
                {(
                  Object.entries(TRIGGER_LABELS) as [TipoTrigger, string][]
                ).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <TriggerConfig
                trigger={draft.trigger}
                config={draft.triggerConfig}
                onChange={updTriggerConfig}
              />
            </div>
          </div>

          <Arrow />

          {/* ── SECTION 2: CONDITIONS ── */}
          <div style={card("rgba(234,179,8,0.3)")}>
            <div style={cardHead("rgba(234,179,8,0.1)", "#eab308")}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <circle cx={11} cy={11} r={7} stroke="#eab308" strokeWidth="1.8" />
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="#eab308"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              CONDICIONES (opcionales)
            </div>
            <div style={cardBody}>
              {draft.condiciones.length === 0 && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    fontStyle: "italic",
                    marginBottom: 12,
                  }}
                >
                  Sin condiciones — la automatización se ejecutará siempre que
                  el disparador se active.
                </div>
              )}
              {draft.condiciones.map((c, i) => (
                <CondicionRow
                  key={c.id}
                  condicion={c}
                  onChange={(nc) => updCondicion(i, nc)}
                  onDelete={() => delCondicion(i)}
                />
              ))}
              <button
                style={btn(
                  "rgba(234,179,8,0.85)",
                  "rgba(234,179,8,0.07)",
                  { marginTop: draft.condiciones.length > 0 ? 4 : 0 }
                )}
                onClick={addCondicion}
              >
                + Agregar condición
              </button>
            </div>
          </div>

          <Arrow />

          {/* ── SECTION 3: ACTIONS ── */}
          <div style={card("rgba(34,197,94,0.3)")}>
            <div style={cardHead("rgba(34,197,94,0.1)", "#22c55e")}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 3l14 9L5 21V3z"
                  stroke="#22c55e"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              ACCIONES
            </div>
            <div style={cardBody}>
              {draft.acciones.length === 0 && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    fontStyle: "italic",
                    marginBottom: 12,
                  }}
                >
                  Agrega al menos una acción para que la automatización tenga
                  efecto.
                </div>
              )}
              {draft.acciones.map((a, i) => (
                <AccionRow
                  key={a.id}
                  accion={a}
                  onChange={(na) => updAccion(i, na)}
                  onDelete={() => delAccion(i)}
                />
              ))}
              <button
                style={btn(
                  "rgba(34,197,94,0.85)",
                  "rgba(34,197,94,0.07)",
                  { marginTop: draft.acciones.length > 0 ? 4 : 0 }
                )}
                onClick={addAccion}
              >
                + Agregar acción
              </button>
            </div>
          </div>

          <Arrow />

          {/* ── SECTION 4: RETRY POLICY ── */}
          <div style={card("rgba(99,102,241,0.3)")}>
            <div style={cardHead("rgba(99,102,241,0.1)", "#a5b4fc")}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  stroke="#a5b4fc"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              POLÍTICA DE REINTENTO
            </div>
            <div style={cardBody}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label style={label}>Máx. intentos</label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={draft.politicaReintento.maxIntentos}
                    onChange={(e) =>
                      updRetry(
                        "maxIntentos",
                        Math.max(1, Math.min(10, Number(e.target.value)))
                      )
                    }
                    min={1}
                    max={10}
                  />
                </div>
                <div>
                  <label style={label}>Intervalos entre reintentos (min)</label>
                  <input
                    style={inputStyle}
                    value={(
                      draft.politicaReintento.intervalosMinutos ?? []
                    ).join(", ")}
                    onChange={(e) =>
                      updRetry(
                        "intervalosMinutos",
                        e.target.value
                          .split(",")
                          .map((s) => Number(s.trim()))
                          .filter((n) => !isNaN(n) && n >= 0)
                      )
                    }
                    placeholder="5, 15, 60"
                  />
                </div>
              </div>
              <Toggle
                checked={draft.politicaReintento.notificarFallo}
                onChange={(v) => updRetry("notificarFallo", v)}
                labelText="Notificar en caso de fallo"
                accentColor="#a5b4fc"
              />
            </div>
          </div>

          <Arrow />

          {/* ── SECTION 5: TEST ── */}
          <div style={card("rgba(14,165,233,0.3)")}>
            <div style={cardHead("rgba(14,165,233,0.1)", "#38bdf8")}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <path
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              PRUEBA
            </div>
            <div style={cardBody}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <button
                  style={{
                    ...btn(
                      testing ? "rgba(255,255,255,0.35)" : "#0ea5e9",
                      testing
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(14,165,233,0.13)"
                    ),
                    cursor: testing ? "default" : "pointer",
                  }}
                  onClick={handleTest}
                  disabled={testing}
                >
                  {testing ? "Ejecutando..." : "Ejecutar prueba"}
                </button>

                {testResult && !testing && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.3)",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 12,
                      color: "#4ade80",
                      fontWeight: 500,
                    }}
                  >
                    {testResult}
                  </div>
                )}

                {testing && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.35)",
                      fontStyle: "italic",
                    }}
                  >
                    Simulando ejecución...
                  </div>
                )}
              </div>

              {/* Last execution info */}
              {(selectedItem?.ultimaEjecucion ||
                selectedItem?.ultimoResultado) && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 6,
                    padding: "9px 12px",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.55)",
                    display: "grid",
                    gap: 4,
                  }}
                >
                  {selectedItem?.ultimaEjecucion && (
                    <div>
                      <span style={{ color: "rgba(255,255,255,0.35)" }}>
                        Última ejecución:{" "}
                      </span>
                      {selectedItem.ultimaEjecucion}
                    </div>
                  )}
                  {selectedItem?.ultimoResultado && (
                    <div>
                      <span style={{ color: "rgba(255,255,255,0.35)" }}>
                        Último resultado:{" "}
                      </span>
                      <span
                        style={{
                          color:
                            selectedItem.ultimoResultado === "exitoso"
                              ? "#4ade80"
                              : selectedItem.ultimoResultado === "fallido"
                              ? "#f87171"
                              : "rgba(255,255,255,0.55)",
                          fontWeight: 600,
                        }}
                      >
                        {selectedItem.ultimoResultado === "exitoso"
                          ? "✓ Exitoso"
                          : selectedItem.ultimoResultado === "fallido"
                          ? "✗ Fallido"
                          : "— Saltado"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom action bar ── */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <button
              style={{
                ...btn(
                  "rgba(255,255,255,0.8)",
                  "rgba(255,255,255,0.07)"
                ),
                opacity: saving ? 0.55 : 1,
                cursor: saving ? "default" : "pointer",
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              style={{
                ...btn("#ef4444", "rgba(239,68,68,0.13)"),
                opacity: publishing || saving ? 0.55 : 1,
                cursor: publishing || saving ? "default" : "pointer",
              }}
              onClick={handlePublish}
              disabled={publishing || saving}
            >
              {publishing ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      )}
    </BuilderShell>
  );
}
