"use client";

/**
 * NotificationBuilder — No-code notification template editor.
 * Two-panel layout: template editor (55%) + live preview (45%).
 */

import { useState, useEffect, useRef } from "react";
import {
  NotificationConfig,
  CanalNotificacion,
  VariableNotificacion,
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

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "rgba(255,255,255,0.55)",
  marginBottom: 4,
  fontWeight: 500,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.07em",
  color: "#0ea5e9",
  textTransform: "uppercase" as const,
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const divider: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.07)",
  margin: "16px 0",
};

function panelCard(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    overflow: "hidden",
    ...extra,
  };
}

function actionBtn(
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const ROLES: { key: string; label: string }[] = [
  { key: "jefe_area", label: "Jefe de área" },
  { key: "rector", label: "Rector" },
  { key: "jefe_rrhh", label: "Jefe RRHH" },
  { key: "candidato", label: "Candidato" },
  { key: "sistema", label: "Sistema" },
];

const ROLE_KEYS = new Set(ROLES.map((r) => r.key));

/** Replace {{nombre}} placeholders with the variable's ejemplo value for preview. */
function interpolatePreview(
  html: string,
  variables: VariableNotificacion[]
): string {
  let result = html;
  for (const v of variables) {
    if (!v.nombre) continue;
    const tag = `{{${v.nombre}}}`;
    const replacement = `<span style="background:rgba(14,165,233,0.22);color:#38bdf8;border-radius:3px;padding:0 3px;font-style:italic">${v.ejemplo || tag}</span>`;
    result = result.split(tag).join(replacement);
  }
  // Highlight any remaining {{...}} that have no variable definition
  result = result.replace(
    /\{\{([^}]+)\}\}/g,
    '<span style="background:rgba(239,68,68,0.18);color:#fca5a5;border-radius:3px;padding:0 3px;font-style:italic">{{$1}}</span>'
  );
  return result;
}

function textInterpolate(
  text: string,
  variables: VariableNotificacion[]
): string {
  let result = text;
  for (const v of variables) {
    if (!v.nombre) continue;
    result = result.split(`{{${v.nombre}}}`).join(v.ejemplo || `{{${v.nombre}}}`);
  }
  return result;
}

type NotificationDraft = Omit<NotificationConfig, "createdAt" | "updatedAt">;

function blankDraft(wsId: string): NotificationDraft {
  return {
    id: uid(),
    wsId,
    nombre: "Nueva notificación",
    descripcion: "",
    version: 1,
    status: "draft",
    creadoPor: "",
    tipo: "notification",
    canal: "email",
    asunto: "",
    cuerpoHtml: "",
    cuerpoTexto: "",
    variables: [],
    destinatarios: [],
    destinatariosAdicionales: [],
  };
}

// ─── Variable row ─────────────────────────────────────────────────────────────

function VariableRow({
  variable,
  onChange,
  onDelete,
  onInsert,
}: {
  variable: VariableNotificacion;
  onChange: (v: VariableNotificacion) => void;
  onDelete: () => void;
  onInsert: (nombre: string) => void;
}) {
  function upd<K extends keyof VariableNotificacion>(
    key: K,
    val: VariableNotificacion[K]
  ) {
    onChange({ ...variable, [key]: val });
  }

  return (
    <div
      style={{
        background: "rgba(14,165,233,0.05)",
        border: "1px solid rgba(14,165,233,0.15)",
        borderRadius: 7,
        padding: "9px 10px",
        marginBottom: 7,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr auto",
          gap: 6,
          alignItems: "center",
        }}
      >
        <input
          style={inputStyle}
          value={variable.nombre}
          onChange={(e) => upd("nombre", e.target.value)}
          placeholder="nombre_var"
        />
        <input
          style={inputStyle}
          value={variable.descripcion}
          onChange={(e) => upd("descripcion", e.target.value)}
          placeholder="Descripción"
        />
        <input
          style={inputStyle}
          value={variable.ejemplo}
          onChange={(e) => upd("ejemplo", e.target.value)}
          placeholder="Ejemplo"
        />
        <div style={{ display: "flex", gap: 5 }}>
          <button
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid rgba(14,165,233,0.35)",
              background: "rgba(14,165,233,0.1)",
              color: "#38bdf8",
              fontSize: 10,
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
              fontWeight: 600,
            }}
            onClick={() => variable.nombre && onInsert(variable.nombre)}
            title={`Insertar {{${variable.nombre}}}`}
            disabled={!variable.nombre}
          >
            Insertar
          </button>
          <button
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid rgba(239,68,68,0.25)",
              background: "transparent",
              color: "#f87171",
              fontSize: 13,
              lineHeight: 1,
              cursor: "pointer",
            }}
            onClick={onDelete}
          >
            ×
          </button>
        </div>
      </div>

      {variable.nombre && (
        <div style={{ marginTop: 6 }}>
          <span
            onClick={() => variable.nombre && onInsert(variable.nombre)}
            title={`Insertar {{${variable.nombre}}} en el cuerpo`}
            style={{
              display: "inline-block",
              background: "rgba(14,165,233,0.15)",
              border: "1px solid rgba(14,165,233,0.3)",
              borderRadius: 4,
              padding: "2px 7px",
              fontSize: 11,
              color: "#38bdf8",
              cursor: "pointer",
              fontFamily: "monospace",
              userSelect: "none" as const,
            }}
          >
            {`{{${variable.nombre}}}`}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Email preview ────────────────────────────────────────────────────────────

function EmailPreview({
  draft,
  variables,
}: {
  draft: NotificationDraft;
  variables: VariableNotificacion[];
}) {
  const roles = draft.destinatarios.filter((d) => ROLE_KEYS.has(d));
  const extras = draft.destinatariosAdicionales ?? [];
  const toLine = [...roles, ...extras].join(", ") || "—";
  const subject = textInterpolate(draft.asunto, variables) || "(Sin asunto)";
  const bodyHtml = interpolatePreview(draft.cuerpoHtml || "(Sin contenido)", variables);

  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: 8,
        overflow: "hidden",
        fontSize: 13,
        color: "#1e293b",
        fontFamily: "Georgia, 'Times New Roman', serif",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Email chrome header */}
      <div
        style={{
          background: "#e2e8f0",
          padding: "10px 16px",
          borderBottom: "1px solid #cbd5e1",
          fontFamily: "system-ui, sans-serif",
          fontSize: 12,
          color: "#475569",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr",
            gap: "4px 8px",
          }}
        >
          <span style={{ color: "#94a3b8" }}>De:</span>
          <span>sistema@universidad.edu.sv</span>
          <span style={{ color: "#94a3b8" }}>Para:</span>
          <span style={{ wordBreak: "break-all" as const }}>{toLine}</span>
          <span style={{ color: "#94a3b8" }}>Asunto:</span>
          <span style={{ fontWeight: 600, color: "#1e293b" }}>{subject}</span>
        </div>
      </div>

      {/* Email body */}
      <div
        style={{
          padding: "20px 24px",
          minHeight: 100,
          lineHeight: 1.7,
          color: "#334155",
          fontSize: 14,
        }}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {/* Footer */}
      <div
        style={{
          padding: "10px 24px",
          borderTop: "1px solid #e2e8f0",
          background: "#f1f5f9",
          fontSize: 11,
          color: "#94a3b8",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Universidad · Sistema de gestión institucional · No responda a este
        correo automático.
      </div>
    </div>
  );
}

// ─── In-App preview ───────────────────────────────────────────────────────────

function InAppPreview({
  draft,
  variables,
}: {
  draft: NotificationDraft;
  variables: VariableNotificacion[];
}) {
  const bodyText = textInterpolate(
    draft.cuerpoTexto || draft.cuerpoHtml.replace(/<[^>]*>/g, "").trim() || "(Sin mensaje)",
    variables
  );
  const asunto = textInterpolate(draft.asunto || draft.nombre, variables);

  return (
    <div
      style={{
        background: "rgba(14,165,233,0.08)",
        border: "1px solid rgba(14,165,233,0.3)",
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      {/* Bell icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(14,165,233,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <path
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            marginBottom: 3,
          }}
        >
          {asunto}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.5,
          }}
        >
          {bodyText}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            marginTop: 6,
          }}
        >
          Ahora mismo · Sistema
        </div>
      </div>

      {/* Dismiss dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#0ea5e9",
          flexShrink: 0,
          marginTop: 4,
        }}
      />
    </div>
  );
}

// ─── NotificationBuilder ──────────────────────────────────────────────────────

export function NotificationBuilder({ wsId }: { wsId: string }) {
  const meta = BUILDER_REGISTRY.find((m) => m.tipo === "notification")!;

  // Hooks
  const { data: items, isLoading, refetch } =
    useBuilderList<NotificationConfig>(wsId, "notification");
  const saveMutation = useBuilderSave<NotificationConfig>(wsId, "notification");
  const publishMutation = useBuilderPublish(wsId, "notification");
  const dupMutation = useBuilderDuplicate(wsId, "notification");
  const deleteMutation = useBuilderDelete(wsId, "notification");

  // Local state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NotificationDraft | null>(null);
  const [extraEmailInput, setExtraEmailInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const selectedItem = (items ?? []).find((i) => i.id === selectedId);

  // Sync selected item → draft
  useEffect(() => {
    if (selectedItem) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...rest } = selectedItem;
      setDraft(rest);
      setExtraEmailInput("");
      setDeleteConfirm(false);
    }
  }, [selectedId, selectedItem?.updatedAt]);

  // ── Draft helpers ─────────────────────────────────────────────────────────

  function upd<K extends keyof NotificationDraft>(
    key: K,
    val: NotificationDraft[K]
  ) {
    setDraft((d) => (d ? { ...d, [key]: val } : d));
  }

  // Variables
  function addVariable() {
    const v: VariableNotificacion = { nombre: "", descripcion: "", ejemplo: "" };
    setDraft((d) => (d ? { ...d, variables: [...d.variables, v] } : d));
  }

  function updVariable(idx: number, v: VariableNotificacion) {
    setDraft((d) => {
      if (!d) return d;
      const variables = [...d.variables];
      variables[idx] = v;
      return { ...d, variables };
    });
  }

  function delVariable(idx: number) {
    setDraft((d) =>
      d ? { ...d, variables: d.variables.filter((_, i) => i !== idx) } : d
    );
  }

  /** Insert {{nombre}} at the textarea cursor position */
  function insertVariable(nombre: string) {
    if (!draft) return;
    const el = bodyRef.current;
    const insertion = `{{${nombre}}}`;

    if (el) {
      const start = el.selectionStart ?? draft.cuerpoHtml.length;
      const end = el.selectionEnd ?? draft.cuerpoHtml.length;
      const newBody =
        draft.cuerpoHtml.slice(0, start) +
        insertion +
        draft.cuerpoHtml.slice(end);
      setDraft((d) => (d ? { ...d, cuerpoHtml: newBody } : d));
      requestAnimationFrame(() => {
        el.focus();
        el.selectionStart = el.selectionEnd = start + insertion.length;
      });
    } else {
      setDraft((d) =>
        d ? { ...d, cuerpoHtml: d.cuerpoHtml + insertion } : d
      );
    }
  }

  // Role toggles
  function toggleRole(roleKey: string) {
    setDraft((d) => {
      if (!d) return d;
      const dests = d.destinatarios.includes(roleKey)
        ? d.destinatarios.filter((r) => r !== roleKey)
        : [...d.destinatarios, roleKey];
      return { ...d, destinatarios: dests };
    });
  }

  // Extra emails
  function addExtraEmail() {
    const emails = extraEmailInput
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e && e.includes("@"));
    if (emails.length === 0) return;
    setDraft((d) => {
      if (!d) return d;
      const existing = d.destinatariosAdicionales ?? [];
      return {
        ...d,
        destinatariosAdicionales: [...new Set([...existing, ...emails])],
      };
    });
    setExtraEmailInput("");
  }

  function removeExtraEmail(email: string) {
    setDraft((d) => {
      if (!d) return d;
      return {
        ...d,
        destinatariosAdicionales: (d.destinatariosAdicionales ?? []).filter(
          (e) => e !== email
        ),
      };
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  function handleNew() {
    setSelectedId(null);
    setDraft(blankDraft(wsId));
    setExtraEmailInput("");
    setDeleteConfirm(false);
  }

  async function handleSave() {
    if (!draft) return;
    const saved = await saveMutation.mutateAsync(
      draft as Parameters<typeof saveMutation.mutateAsync>[0]
    );
    if (!selectedId) setSelectedId(saved.id);
    await refetch();
  }

  async function handlePublish() {
    if (!draft) return;
    const saved = await saveMutation.mutateAsync(
      draft as Parameters<typeof saveMutation.mutateAsync>[0]
    );
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

  // ── Derived values ────────────────────────────────────────────────────────

  const saving = saveMutation.isPending;
  const publishing = publishMutation.isPending;
  const showSubject = draft
    ? draft.canal === "email" || draft.canal === "ambos"
    : false;
  const showEmail = draft
    ? draft.canal === "email" || draft.canal === "ambos"
    : false;
  const showInApp = draft
    ? draft.canal === "inapp" || draft.canal === "ambos"
    : false;

  // ── Render ────────────────────────────────────────────────────────────────

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
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" opacity={0.35}>
            <path
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ fontSize: 14, textAlign: "center", maxWidth: 280 }}>
            Selecciona una notificación de la lista o crea una nueva.
          </div>
        </div>
      ) : (
        // Two-panel editor
        <div
          style={{
            display: "flex",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* ── LEFT PANEL: Template editor (55%) ── */}
          <div
            style={{
              width: "55%",
              flexShrink: 0,
              overflowY: "auto",
              borderRight: "1px solid rgba(255,255,255,0.07)",
              padding: "20px 22px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div style={{ flex: 1 }}>
                <input
                  style={{
                    ...inputStyle,
                    fontSize: 16,
                    fontWeight: 700,
                    background: "transparent",
                    border: "none",
                    borderBottom: "2px solid rgba(255,255,255,0.09)",
                    borderRadius: 0,
                    padding: "3px 0",
                  }}
                  value={draft.nombre}
                  onChange={(e) => upd("nombre", e.target.value)}
                  placeholder="Nombre de la notificación"
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
                    color: "rgba(255,255,255,0.4)",
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
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <StatusBadge status={draft.status} />
                  {selectedId && (
                    <>
                      <button
                        style={{
                          ...actionBtn(
                            "rgba(255,255,255,0.45)",
                            "rgba(255,255,255,0.04)"
                          ),
                          padding: "4px 9px",
                          fontSize: 11,
                        }}
                        onClick={handleDuplicate}
                      >
                        Duplicar
                      </button>
                      {!deleteConfirm ? (
                        <button
                          style={{
                            ...actionBtn(
                              "rgba(239,68,68,0.65)",
                              "rgba(239,68,68,0.07)"
                            ),
                            padding: "4px 9px",
                            fontSize: 11,
                          }}
                          onClick={() => setDeleteConfirm(true)}
                        >
                          Eliminar
                        </button>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "rgba(239,68,68,0.9)",
                            }}
                          >
                            ¿Confirmar?
                          </span>
                          <button
                            style={{
                              ...actionBtn("#ef4444", "rgba(239,68,68,0.18)"),
                              padding: "3px 8px",
                              fontSize: 11,
                            }}
                            onClick={handleDelete}
                          >
                            Sí
                          </button>
                          <button
                            style={{
                              ...actionBtn(
                                "rgba(255,255,255,0.4)",
                                "rgba(255,255,255,0.04)"
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
              </div>
            </div>

            {/* ─ Channel & subject ─ */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: showSubject ? "140px 1fr" : "140px",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <label style={lbl}>Canal</label>
                <select
                  style={inputStyle}
                  value={draft.canal}
                  onChange={(e) =>
                    upd("canal", e.target.value as CanalNotificacion)
                  }
                >
                  <option value="email">Email</option>
                  <option value="inapp">In-app</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
              {showSubject && (
                <div>
                  <label style={lbl}>Asunto del email</label>
                  <input
                    style={inputStyle}
                    value={draft.asunto}
                    onChange={(e) => upd("asunto", e.target.value)}
                    placeholder="Ej: Notificación sobre {{proceso}}"
                  />
                </div>
              )}
            </div>

            {/* ─ Body HTML ─ */}
            <div style={{ marginBottom: 6 }}>
              <label style={lbl}>
                Cuerpo del mensaje
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.3)",
                    fontWeight: 400,
                  }}
                >
                  (HTML permitido · usa los chips de variables para insertar)
                </span>
              </label>
              <textarea
                ref={bodyRef}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 130,
                  fontFamily: "monospace",
                  lineHeight: 1.55,
                }}
                value={draft.cuerpoHtml}
                onChange={(e) => upd("cuerpoHtml", e.target.value)}
                placeholder="Escribe el contenido aquí. Puedes usar HTML y variables como {{nombre_variable}}."
              />
            </div>

            {/* ─ Variables section ─ */}
            <div style={divider} />
            <div style={{ marginBottom: 14 }}>
              <div style={sectionTitle}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    stroke="#0ea5e9"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Variables dinámicas
              </div>

              {/* Column headers */}
              {draft.variables.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: 6,
                    marginBottom: 6,
                    paddingLeft: 2,
                  }}
                >
                  {["Nombre", "Descripción", "Ejemplo"].map((h) => (
                    <span
                      key={h}
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </span>
                  ))}
                  <span />
                </div>
              )}

              {draft.variables.map((v, i) => (
                <VariableRow
                  key={i}
                  variable={v}
                  onChange={(nv) => updVariable(i, nv)}
                  onDelete={() => delVariable(i)}
                  onInsert={insertVariable}
                />
              ))}

              <button
                style={actionBtn(
                  "rgba(14,165,233,0.8)",
                  "rgba(14,165,233,0.08)"
                )}
                onClick={addVariable}
              >
                + Agregar variable
              </button>

              {/* Variable chips row (quick insert) */}
              {draft.variables.filter((v) => v.nombre).length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: 6,
                    }}
                  >
                    Clic para insertar en el cuerpo:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
                    {draft.variables
                      .filter((v) => v.nombre)
                      .map((v, i) => (
                        <span
                          key={i}
                          onClick={() => insertVariable(v.nombre)}
                          style={{
                            background: "rgba(14,165,233,0.12)",
                            border: "1px solid rgba(14,165,233,0.28)",
                            borderRadius: 4,
                            padding: "3px 8px",
                            fontSize: 11,
                            color: "#38bdf8",
                            cursor: "pointer",
                            fontFamily: "monospace",
                            userSelect: "none" as const,
                          }}
                          title={v.descripcion}
                        >
                          {`{{${v.nombre}}}`}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─ Destinatarios ─ */}
            <div style={divider} />
            <div style={{ marginBottom: 14 }}>
              <div style={sectionTitle}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8z"
                    stroke="#0ea5e9"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Destinatarios
              </div>

              {/* Role checkboxes */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap" as const,
                  gap: "6px 14px",
                  marginBottom: 12,
                }}
              >
                {ROLES.map((role) => {
                  const checked = draft.destinatarios.includes(role.key);
                  return (
                    <label
                      key={role.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        userSelect: "none" as const,
                        fontSize: 12,
                        color: checked ? "#38bdf8" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      <div
                        onClick={() => toggleRole(role.key)}
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          border: `2px solid ${checked ? "#0ea5e9" : "rgba(255,255,255,0.2)"}`,
                          background: checked
                            ? "rgba(14,165,233,0.2)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                      >
                        {checked && (
                          <svg
                            width={10}
                            height={10}
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="#0ea5e9"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      {role.label}
                    </label>
                  );
                })}
              </div>

              {/* Extra emails */}
              <label style={lbl}>Correos adicionales (separados por coma)</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={extraEmailInput}
                  onChange={(e) => setExtraEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExtraEmail()}
                  placeholder="usuario@dominio.com, otro@dominio.com"
                />
                <button
                  style={{
                    ...actionBtn(
                      "rgba(14,165,233,0.8)",
                      "rgba(14,165,233,0.08)"
                    ),
                    whiteSpace: "nowrap" as const,
                    flexShrink: 0,
                  }}
                  onClick={addExtraEmail}
                >
                  Agregar
                </button>
              </div>

              {(draft.destinatariosAdicionales ?? []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
                  {(draft.destinatariosAdicionales ?? []).map((email) => (
                    <span
                      key={email}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "rgba(14,165,233,0.1)",
                        border: "1px solid rgba(14,165,233,0.2)",
                        borderRadius: 4,
                        padding: "3px 8px",
                        fontSize: 11,
                        color: "#7dd3fc",
                      }}
                    >
                      {email}
                      <span
                        onClick={() => removeExtraEmail(email)}
                        style={{
                          cursor: "pointer",
                          color: "rgba(255,255,255,0.4)",
                          lineHeight: 1,
                          fontSize: 13,
                        }}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ─ Body text (plain) ─ */}
            {(draft.canal === "inapp" || draft.canal === "ambos") && (
              <>
                <div style={divider} />
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>
                    Texto plano del mensaje in-app
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 10,
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 400,
                      }}
                    >
                      (sin HTML)
                    </span>
                  </label>
                  <textarea
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: 72,
                      lineHeight: 1.55,
                    }}
                    value={draft.cuerpoTexto}
                    onChange={(e) => upd("cuerpoTexto", e.target.value)}
                    placeholder="Texto plano que verá el usuario en la notificación in-app..."
                  />
                </div>
              </>
            )}

            {/* ─ Bottom action bar ─ */}
            <div style={divider} />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{
                  ...actionBtn(
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
                  ...actionBtn("#0ea5e9", "rgba(14,165,233,0.12)"),
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

          {/* ── RIGHT PANEL: Preview (45%) ── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 20px 32px",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.07em",
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase" as const,
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Vista previa en tiempo real
            </div>

            {/* No variables hint */}
            {draft.variables.length > 0 && (
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 14,
                  fontStyle: "italic",
                }}
              >
                Los{" "}
                <span
                  style={{
                    background: "rgba(14,165,233,0.15)",
                    color: "#38bdf8",
                    borderRadius: 3,
                    padding: "0 4px",
                    fontFamily: "monospace",
                    fontStyle: "normal",
                  }}
                >
                  {"{{campos}}"}
                </span>{" "}
                se reemplazan con los ejemplos definidos.
              </div>
            )}

            {/* Email preview */}
            {showEmail && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 8,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Email
                </div>
                <EmailPreview draft={draft} variables={draft.variables} />
              </div>
            )}

            {/* In-app preview */}
            {showInApp && (
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 8,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Notificación in-app
                </div>
                <InAppPreview draft={draft} variables={draft.variables} />

                {/* Simulated notification context */}
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: 8,
                    }}
                  >
                    Así aparecerá en el panel de notificaciones:
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column" as const,
                      gap: 4,
                    }}
                  >
                    {["Antes", "→ Esta"].map((pos, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 10px",
                          borderRadius: 6,
                          background:
                            i === 1
                              ? "rgba(14,165,233,0.08)"
                              : "rgba(255,255,255,0.02)",
                          border: `1px solid ${
                            i === 1
                              ? "rgba(14,165,233,0.2)"
                              : "rgba(255,255,255,0.05)"
                          }`,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background:
                              i === 1
                                ? "rgba(14,165,233,0.15)"
                                : "rgba(255,255,255,0.06)",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 11,
                              color:
                                i === 1
                                  ? "white"
                                  : "rgba(255,255,255,0.4)",
                              fontWeight: i === 1 ? 600 : 400,
                              marginBottom: 2,
                            }}
                          >
                            {i === 1
                              ? textInterpolate(
                                  draft.asunto || draft.nombre,
                                  draft.variables
                                )
                              : "Notificación anterior"}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "rgba(255,255,255,0.3)",
                            }}
                          >
                            {i === 1 ? "Ahora mismo" : "Hace 2 horas"}
                          </div>
                        </div>
                        {i === 1 && (
                          <div
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "#0ea5e9",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty body hint */}
            {!draft.cuerpoHtml && !draft.cuerpoTexto && (
              <div
                style={{
                  marginTop: 20,
                  padding: "24px 20px",
                  textAlign: "center",
                  border: "1px dashed rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 12,
                }}
              >
                Escribe el contenido del mensaje para ver la vista previa.
              </div>
            )}
          </div>
        </div>
      )}
    </BuilderShell>
  );
}
