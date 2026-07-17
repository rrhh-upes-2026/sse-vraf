"use client";

import { useState, useCallback } from "react";
import { BUILDER_REGISTRY, type ProcessConfig, type EtapaProceso, type ValidacionEtapaConfig, type EvidenciaEtapaConfig, type DocumentoEtapaConfig, type AccionEtapaConfig, type TipoAccionEtapa } from "@/types/builders";
import { BuilderShell, StatusBadge } from "@/components/builders/BuilderShell";
import { useBuilderList, useBuilderSave, useBuilderPublish, useBuilderDuplicate, useBuilderDelete } from "@/hooks/useBuilder";

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLES = [
  "jefe_area",
  "rector",
  "gestor_om",
  "jefe_rrhh",
  "comite_o_jefe_area",
  "jefe_inmediato_o_comite",
  "candidato",
  "sistema",
];

const ROL_LABEL: Record<string, string> = {
  jefe_area: "Jefe de Área",
  rector: "Rector",
  gestor_om: "Gestor de O&M",
  jefe_rrhh: "Jefe de RR.HH.",
  comite_o_jefe_area: "Comité / Jefe de Área",
  jefe_inmediato_o_comite: "Jefe Inmediato / Comité",
  candidato: "Candidato",
  sistema: "Sistema",
};

const TIPO_ACCION_OPTIONS: { value: TipoAccionEtapa; label: string }[] = [
  { value: "crear_tarea", label: "Crear tarea" },
  { value: "enviar_notificacion", label: "Enviar notificación" },
  { value: "generar_documento", label: "Generar documento" },
  { value: "actualizar_campo", label: "Actualizar campo" },
  { value: "crear_evento_calendario", label: "Crear evento de calendario" },
  { value: "registrar_kpi", label: "Registrar KPI" },
];

const TIPO_VALIDACION_OPTIONS: { value: ValidacionEtapaConfig["tipo"]; label: string }[] = [
  { value: "requerido", label: "Requerido" },
  { value: "minimo", label: "Mínimo" },
  { value: "maximo", label: "Máximo" },
  { value: "regex", label: "Expresión regular" },
  { value: "lista", label: "Lista de valores" },
  { value: "custom", label: "Personalizado" },
];

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  fontSize: 12,
  outline: "none",
  boxSizing: "border-box" as const,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "rgba(255,255,255,0.4)",
  textTransform: "uppercase" as const,
  marginBottom: 6,
};

function btnStyle(accent: string, outline?: boolean): React.CSSProperties {
  return {
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    border: outline ? `1px solid ${accent}` : "none",
    background: outline ? "transparent" : accent,
    color: outline ? accent : "white",
  };
}

const iconBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 5,
  padding: "3px 6px",
  cursor: "pointer",
  color: "rgba(255,255,255,0.5)",
  fontSize: 12,
  lineHeight: 1,
};

const dangerBtnStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.25)",
  borderRadius: 5,
  padding: "3px 7px",
  cursor: "pointer",
  color: "#ef4444",
  fontSize: 11,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `x${Math.random().toString(36).slice(2, 9)}`;
}

function emptyEtapa(orden: number): EtapaProceso {
  return {
    id: uid(),
    nombre: `Etapa ${orden}`,
    descripcion: "",
    orden,
    responsable: "jefe_area",
    diasLimite: 3,
    validaciones: [],
    evidencias: [],
    documentos: [],
    acciones: [],
    esDecision: false,
  };
}

function emptyProcess(wsId: string): ProcessConfig {
  const now = new Date().toISOString();
  return {
    id: uid(),
    wsId,
    nombre: "Nuevo proceso",
    descripcion: "",
    version: 1,
    status: "draft",
    tipo: "process",
    etapas: [],
    roles: [],
    kpiIds: [],
    notificacionIds: [],
    creadoPor: "usuario",
    createdAt: now,
    updatedAt: now,
  };
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function SectionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={sectionLabelStyle}>{label}</div>
      {children}
    </div>
  );
}

// ── Validaciones editor ───────────────────────────────────────────────────────

function ValidacionesEditor({
  items,
  onChange,
}: {
  items: ValidacionEtapaConfig[];
  onChange: (items: ValidacionEtapaConfig[]) => void;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      {items.map((v, i) => (
        <div
          key={v.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 1fr auto",
            gap: 6,
            marginBottom: 6,
            alignItems: "center",
          }}
        >
          <input
            style={inputStyle}
            value={v.campo}
            placeholder="Campo"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...v, campo: e.target.value };
              onChange(next);
            }}
          />
          <select
            style={inputStyle}
            value={v.tipo}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...v, tipo: e.target.value as ValidacionEtapaConfig["tipo"] };
              onChange(next);
            }}
          >
            {TIPO_VALIDACION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            style={inputStyle}
            value={v.mensaje}
            placeholder="Mensaje de error"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...v, mensaje: e.target.value };
              onChange(next);
            }}
          />
          <button style={dangerBtnStyle} onClick={() => onChange(items.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button
        style={{ ...iconBtnStyle, fontSize: 11, padding: "4px 10px" }}
        onClick={() =>
          onChange([...items, { id: uid(), campo: "", tipo: "requerido", mensaje: "" }])
        }
      >
        + Agregar validación
      </button>
    </div>
  );
}

// ── Evidencias editor ─────────────────────────────────────────────────────────

function EvidenciasEditor({
  items,
  onChange,
}: {
  items: EvidenciaEtapaConfig[];
  onChange: (items: EvidenciaEtapaConfig[]) => void;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      {items.map((v, i) => (
        <div
          key={v.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 1fr auto",
            gap: 6,
            marginBottom: 6,
            alignItems: "center",
          }}
        >
          <input
            style={inputStyle}
            value={v.nombre}
            placeholder="Nombre evidencia"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...v, nombre: e.target.value };
              onChange(next);
            }}
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={v.obligatoria}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...v, obligatoria: e.target.checked };
                onChange(next);
              }}
            />
            Obligatoria
          </label>
          <input
            style={inputStyle}
            value={v.tiposAceptados.join(", ")}
            placeholder="pdf, docx, jpg"
            onChange={(e) => {
              const next = [...items];
              next[i] = {
                ...v,
                tiposAceptados: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              };
              onChange(next);
            }}
          />
          <button style={dangerBtnStyle} onClick={() => onChange(items.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button
        style={{ ...iconBtnStyle, fontSize: 11, padding: "4px 10px" }}
        onClick={() =>
          onChange([
            ...items,
            { id: uid(), nombre: "", descripcion: "", obligatoria: false, tiposAceptados: [] },
          ])
        }
      >
        + Agregar evidencia
      </button>
    </div>
  );
}

// ── Documentos editor ─────────────────────────────────────────────────────────

function DocumentosEditor({
  items,
  onChange,
}: {
  items: DocumentoEtapaConfig[];
  onChange: (items: DocumentoEtapaConfig[]) => void;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      {items.map((v, i) => (
        <div
          key={v.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px auto",
            gap: 6,
            marginBottom: 6,
            alignItems: "center",
          }}
        >
          <input
            style={inputStyle}
            value={v.nombre}
            placeholder="Nombre documento"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...v, nombre: e.target.value };
              onChange(next);
            }}
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={v.automatico}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...v, automatico: e.target.checked };
                onChange(next);
              }}
            />
            Automático
          </label>
          <button style={dangerBtnStyle} onClick={() => onChange(items.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button
        style={{ ...iconBtnStyle, fontSize: 11, padding: "4px 10px" }}
        onClick={() => onChange([...items, { id: uid(), nombre: "", automatico: false }])}
      >
        + Agregar documento
      </button>
    </div>
  );
}

// ── Acciones editor ───────────────────────────────────────────────────────────

function AccionesEditor({
  items,
  onChange,
}: {
  items: AccionEtapaConfig[];
  onChange: (items: AccionEtapaConfig[]) => void;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      {items.map((v, i) => (
        <div
          key={v.id}
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr auto",
            gap: 6,
            marginBottom: 6,
            alignItems: "center",
          }}
        >
          <select
            style={inputStyle}
            value={v.tipo}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...v, tipo: e.target.value as TipoAccionEtapa };
              onChange(next);
            }}
          >
            {TIPO_ACCION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            style={inputStyle}
            value={v.descripcion}
            placeholder="Descripción de la acción"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...v, descripcion: e.target.value };
              onChange(next);
            }}
          />
          <button style={dangerBtnStyle} onClick={() => onChange(items.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button
        style={{ ...iconBtnStyle, fontSize: 11, padding: "4px 10px" }}
        onClick={() =>
          onChange([
            ...items,
            { id: uid(), tipo: "crear_tarea", descripcion: "", payload: {} },
          ])
        }
      >
        + Agregar acción
      </button>
    </div>
  );
}

// ── Stage card ────────────────────────────────────────────────────────────────

function EtapaCard({
  etapa,
  index,
  total,
  expanded,
  onToggle,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  etapa: EtapaProceso;
  index: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (updated: EtapaProceso) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const ACCENT = "#2E6BE6";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${expanded ? ACCENT + "50" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 10,
        marginBottom: 8,
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          cursor: "pointer",
        }}
        onClick={onToggle}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: ACCENT + "25",
            color: ACCENT,
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {etapa.orden}
        </div>

        <input
          style={{ ...inputStyle, flex: 1, fontWeight: 600, fontSize: 13 }}
          value={etapa.nombre}
          placeholder="Nombre de la etapa"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange({ ...etapa, nombre: e.target.value })}
        />

        {etapa.esDecision && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              background: "#E5A10020",
              color: "#E5A100",
              padding: "2px 6px",
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            DECISIÓN
          </span>
        )}

        <div
          style={{ display: "flex", gap: 4, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            style={{ ...iconBtnStyle, opacity: index === 0 ? 0.3 : 1 }}
            disabled={index === 0}
            onClick={onMoveUp}
            title="Subir"
          >
            ▲
          </button>
          <button
            style={{ ...iconBtnStyle, opacity: index === total - 1 ? 0.3 : 1 }}
            disabled={index === total - 1}
            onClick={onMoveDown}
            title="Bajar"
          >
            ▼
          </button>
          <button style={dangerBtnStyle} onClick={onDelete} title="Eliminar etapa">
            🗑
          </button>
        </div>

        <span
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 10,
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
            userSelect: "none",
          }}
        >
          ▼
        </span>
      </div>

      {/* Quick fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: 8,
          padding: "0 12px 10px",
          alignItems: "end",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div style={{ ...sectionLabelStyle, marginBottom: 4 }}>Responsable</div>
          <select
            style={inputStyle}
            value={etapa.responsable}
            onChange={(e) => onChange({ ...etapa, responsable: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROL_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ ...sectionLabelStyle, marginBottom: 4 }}>Días límite</div>
          <input
            type="number"
            min={1}
            style={inputStyle}
            value={etapa.diasLimite}
            onChange={(e) =>
              onChange({ ...etapa, diasLimite: parseInt(e.target.value) || 1 })
            }
          />
        </div>
        <div style={{ paddingBottom: 2 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              checked={etapa.esDecision}
              onChange={(e) => onChange({ ...etapa, esDecision: e.target.checked })}
            />
            Es decisión
          </label>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px" }}>
          {etapa.esDecision && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ ...sectionLabelStyle, marginBottom: 4 }}>Opción Sí</div>
                <input
                  style={inputStyle}
                  value={etapa.opcionSi ?? ""}
                  placeholder="Texto de la rama Sí"
                  onChange={(e) => onChange({ ...etapa, opcionSi: e.target.value })}
                />
              </div>
              <div>
                <div style={{ ...sectionLabelStyle, marginBottom: 4 }}>Opción No</div>
                <input
                  style={inputStyle}
                  value={etapa.opcionNo ?? ""}
                  placeholder="Texto de la rama No"
                  onChange={(e) => onChange({ ...etapa, opcionNo: e.target.value })}
                />
              </div>
            </div>
          )}

          <SectionRow label="Validaciones">
            <ValidacionesEditor
              items={etapa.validaciones}
              onChange={(v) => onChange({ ...etapa, validaciones: v })}
            />
          </SectionRow>

          <SectionRow label="Evidencias">
            <EvidenciasEditor
              items={etapa.evidencias}
              onChange={(v) => onChange({ ...etapa, evidencias: v })}
            />
          </SectionRow>

          <SectionRow label="Documentos">
            <DocumentosEditor
              items={etapa.documentos}
              onChange={(v) => onChange({ ...etapa, documentos: v })}
            />
          </SectionRow>

          <SectionRow label="Acciones">
            <AccionesEditor
              items={etapa.acciones}
              onChange={(v) => onChange({ ...etapa, acciones: v })}
            />
          </SectionRow>
        </div>
      )}
    </div>
  );
}

// ── Roles multi-select ────────────────────────────────────────────────────────

function RolesMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (roles: string[]) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {ROLES.map((r) => {
        const active = selected.includes(r);
        return (
          <button
            key={r}
            onClick={() =>
              onChange(active ? selected.filter((x) => x !== r) : [...selected, r])
            }
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              border: `1px solid ${active ? "#2E6BE6" : "rgba(255,255,255,0.15)"}`,
              background: active ? "#2E6BE620" : "transparent",
              color: active ? "#2E6BE6" : "rgba(255,255,255,0.5)",
              transition: "all 0.12s",
            }}
          >
            {ROL_LABEL[r]}
          </button>
        );
      })}
    </div>
  );
}

// ── Process editor ────────────────────────────────────────────────────────────

function ProcessEditor({
  initial,
  wsId,
  onSaved,
}: {
  initial: ProcessConfig;
  wsId: string;
  onSaved: (p: ProcessConfig) => void;
}) {
  const ACCENT = "#2E6BE6";
  const [config, setConfig] = useState<ProcessConfig>(initial);
  const [activeTab, setActiveTab] = useState<"etapas" | "configuracion">("etapas");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const saveMut = useBuilderSave<ProcessConfig>(wsId, "process");
  const publishMut = useBuilderPublish(wsId, "process");
  const duplicateMut = useBuilderDuplicate(wsId, "process");

  const updateEtapa = useCallback((idx: number, updated: EtapaProceso) => {
    setConfig((c) => {
      const etapas = [...c.etapas];
      etapas[idx] = updated;
      return { ...c, etapas };
    });
  }, []);

  const moveEtapa = (idx: number, dir: -1 | 1) => {
    setConfig((c) => {
      const etapas = [...c.etapas];
      const target = idx + dir;
      if (target < 0 || target >= etapas.length) return c;
      [etapas[idx], etapas[target]] = [etapas[target], etapas[idx]];
      return { ...c, etapas: etapas.map((e, i) => ({ ...e, orden: i + 1 })) };
    });
  };

  const deleteEtapa = (idx: number) => {
    setConfig((c) => ({
      ...c,
      etapas: c.etapas
        .filter((_, i) => i !== idx)
        .map((e, i) => ({ ...e, orden: i + 1 })),
    }));
  };

  const addEtapa = () => {
    setConfig((c) => {
      const next = emptyEtapa(c.etapas.length + 1);
      return { ...c, etapas: [...c.etapas, next] };
    });
  };

  const handleSave = async () => {
    const saved = await saveMut.mutateAsync(config);
    setConfig(saved);
    onSaved(saved);
  };

  const handlePublish = async () => {
    const published = await publishMut.mutateAsync(config.id);
    setConfig(published as ProcessConfig);
    onSaved(published as ProcessConfig);
  };

  const handleDuplicate = async () => {
    await duplicateMut.mutateAsync(config.id);
  };

  const handleArchive = async () => {
    const archived = await saveMut.mutateAsync({ ...config, status: "archived" });
    setConfig(archived);
    onSaved(archived);
  };

  function tabStyle(tab: "etapas" | "configuracion"): React.CSSProperties {
    const isActive = activeTab === tab;
    return {
      padding: "7px 16px",
      fontSize: 12,
      fontWeight: isActive ? 600 : 400,
      color: isActive ? ACCENT : "rgba(255,255,255,0.45)",
      background: "transparent",
      border: "none",
      borderBottom: `2px solid ${isActive ? ACCENT : "transparent"}`,
      cursor: "pointer",
      transition: "all 0.12s",
    };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 0",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <input
            style={{
              ...inputStyle,
              flex: 1,
              fontSize: 18,
              fontWeight: 700,
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 0,
              padding: "4px 0",
            }}
            value={config.nombre}
            onChange={(e) => setConfig((c) => ({ ...c, nombre: e.target.value }))}
            placeholder="Nombre del proceso"
          />
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.06)",
              padding: "2px 8px",
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            v{config.version}
          </span>
          <StatusBadge status={config.status} />
          <button
            style={btnStyle(ACCENT, true)}
            onClick={handleSave}
            disabled={saveMut.isPending}
          >
            {saveMut.isPending ? "Guardando…" : "Guardar"}
          </button>
          <button
            style={btnStyle(ACCENT)}
            onClick={handlePublish}
            disabled={publishMut.isPending || config.status === "published"}
          >
            Publicar
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex" }}>
          <button style={tabStyle("etapas")} onClick={() => setActiveTab("etapas")}>
            Etapas
          </button>
          <button style={tabStyle("configuracion")} onClick={() => setActiveTab("configuracion")}>
            Configuración
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {activeTab === "etapas" && (
          <div>
            {config.etapas.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 20px",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 13,
                }}
              >
                No hay etapas. Agrega la primera para comenzar.
              </div>
            )}

            {config.etapas.map((etapa, idx) => (
              <EtapaCard
                key={etapa.id}
                etapa={etapa}
                index={idx}
                total={config.etapas.length}
                expanded={expandedId === etapa.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === etapa.id ? null : etapa.id))
                }
                onChange={(updated) => updateEtapa(idx, updated)}
                onMoveUp={() => moveEtapa(idx, -1)}
                onMoveDown={() => moveEtapa(idx, 1)}
                onDelete={() => deleteEtapa(idx)}
              />
            ))}

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 8,
                border: "2px dashed rgba(255,255,255,0.12)",
                background: "transparent",
                color: "rgba(255,255,255,0.4)",
                fontSize: 13,
                cursor: "pointer",
                width: "100%",
                justifyContent: "center",
                marginTop: 4,
                boxSizing: "border-box",
              }}
              onClick={addEtapa}
            >
              + Agregar etapa
            </button>
          </div>
        )}

        {activeTab === "configuracion" && (
          <div style={{ maxWidth: 600 }}>
            <SectionRow label="Nombre del proceso">
              <input
                style={inputStyle}
                value={config.nombre}
                onChange={(e) => setConfig((c) => ({ ...c, nombre: e.target.value }))}
              />
            </SectionRow>

            <SectionRow label="Descripción">
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 80,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                value={config.descripcion ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, descripcion: e.target.value }))}
                placeholder="Describe el propósito y alcance del proceso"
              />
            </SectionRow>

            <SectionRow label="Roles participantes">
              <RolesMultiSelect
                selected={config.roles}
                onChange={(roles) => setConfig((c) => ({ ...c, roles }))}
              />
            </SectionRow>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "10px 20px",
          display: "flex",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <button
          style={btnStyle(ACCENT)}
          onClick={handlePublish}
          disabled={publishMut.isPending || config.status === "published"}
        >
          {publishMut.isPending ? "Publicando…" : "Publicar"}
        </button>
        <button
          style={btnStyle("#5B4FD0", true)}
          onClick={handleDuplicate}
          disabled={duplicateMut.isPending}
        >
          {duplicateMut.isPending ? "Duplicando…" : "Duplicar"}
        </button>
        <button
          style={btnStyle("#ef4444", true)}
          onClick={handleArchive}
          disabled={saveMut.isPending || config.status === "archived"}
        >
          Archivar
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ProcessBuilder({ wsId }: { wsId: string }) {
  const meta = BUILDER_REGISTRY.find((b) => b.tipo === "process")!;
  const { data: items = [], isLoading } = useBuilderList<ProcessConfig>(wsId, "process");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localNew, setLocalNew] = useState<ProcessConfig | null>(null);

  const selectedItem =
    localNew ??
    (selectedId ? (items.find((i) => i.id === selectedId) ?? null) : null);

  const handleNew = () => {
    setLocalNew(emptyProcess(wsId));
    setSelectedId(null);
  };

  const handleSaved = (saved: ProcessConfig) => {
    setLocalNew(null);
    setSelectedId(saved.id);
  };

  return (
    <BuilderShell
      wsId={wsId}
      meta={meta}
      items={items}
      selectedId={localNew ? null : selectedId}
      onSelect={(id) => {
        setLocalNew(null);
        setSelectedId(id);
      }}
      onNew={handleNew}
      isLoading={isLoading}
    >
      {selectedItem ? (
        <ProcessEditor
          key={selectedItem.id}
          initial={selectedItem}
          wsId={wsId}
          onSaved={handleSaved}
        />
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <path
              d={meta.icono}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p style={{ fontSize: 14, margin: 0 }}>
            Selecciona un proceso o crea uno nuevo
          </p>
        </div>
      )}
    </BuilderShell>
  );
}
