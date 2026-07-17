"use client";

import { useState } from "react";
import {
  BuilderShell,
  StatusBadge,
} from "@/components/builders/BuilderShell";
import {
  useBuilderList,
  useBuilderSave,
  useBuilderPublish,
} from "@/hooks/useBuilder";
import { BUILDER_REGISTRY } from "@/types/builders";
import type {
  PermissionConfig,
  RolConfig,
  PermisoEtapa,
  PermisoCampo,
} from "@/types/builders";

// ── Constants ─────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  "#2E6BE6",
  "#12A150",
  "#ef4444",
  "#E5A100",
  "#5B4FD0",
  "#0F8A8A",
];

const WS_PERMISSIONS = [
  "ws.admin.access",
  "ws.processes.manage",
  "ws.indicators.manage",
  "ws.requests.manage",
  "ws.automations.manage",
  "ws.users.manage",
  "ws.forms.manage",
  "ws.documents.manage",
  "ws.settings.manage",
  "studio.access",
  "process.create",
  "process.edit",
  "evidence.upload",
  "report.export",
];

const META = BUILDER_REGISTRY.find((b) => b.tipo === "permission")!;

// ── Shared input style ────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `r-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyPermission(wsId: string): PermissionConfig {
  return {
    id: uid(),
    wsId,
    nombre: "Nueva configuración de permisos",
    version: 1,
    status: "draft",
    tipo: "permission",
    roles: [],
    permisosEtapa: [],
    permisosCampo: [],
    permisosWorkspace: {},
    creadoPor: "usuario",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── Tab: Roles ────────────────────────────────────────────────────────────────

function TabRoles({
  config,
  onChange,
}: {
  config: PermissionConfig;
  onChange: (c: PermissionConfig) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newPermiso, setNewPermiso] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", color: PRESET_COLORS[0] });

  function addRol() {
    if (!form.nombre.trim()) return;
    const rol: RolConfig = {
      id: uid(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      color: form.color,
      permisos: [],
    };
    onChange({ ...config, roles: [...config.roles, rol] });
    setForm({ nombre: "", descripcion: "", color: PRESET_COLORS[0] });
    setShowForm(false);
  }

  function deleteRol(id: string) {
    onChange({ ...config, roles: config.roles.filter((r) => r.id !== id) });
    if (expandedId === id) setExpandedId(null);
  }

  function addPermiso(rolId: string) {
    const val = (newPermiso[rolId] ?? "").trim();
    if (!val) return;
    onChange({
      ...config,
      roles: config.roles.map((r) =>
        r.id === rolId ? { ...r, permisos: [...r.permisos, val] } : r
      ),
    });
    setNewPermiso((p) => ({ ...p, [rolId]: "" }));
  }

  function removePermiso(rolId: string, p: string) {
    onChange({
      ...config,
      roles: config.roles.map((r) =>
        r.id === rolId ? { ...r, permisos: r.permisos.filter((x) => x !== p) } : r
      ),
    });
  }

  function updateRolField(rolId: string, field: keyof RolConfig, value: string) {
    onChange({
      ...config,
      roles: config.roles.map((r) =>
        r.id === rolId ? { ...r, [field]: value } : r
      ),
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
          Roles ({config.roles.length})
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "5px 12px",
            borderRadius: 6,
            background: "#7C3AED",
            border: "none",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Nuevo rol
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 8,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                Nombre
              </label>
              <input
                style={inputStyle}
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="ej. Jefe de área"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                Descripción
              </label>
              <input
                style={inputStyle}
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción del rol"
              />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>
              Color
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: c,
                    border: form.color === c ? "2px solid white" : "2px solid transparent",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addRol}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "#7C3AED",
                border: "none",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Crear rol
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.07)",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {config.roles.map((rol) => (
          <div
            key={rol.id}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {/* Card header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                cursor: "pointer",
              }}
              onClick={() => setExpandedId(expandedId === rol.id ? null : rol.id)}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: rol.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{rol.nombre}</div>
                {rol.descripcion && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                    {rol.descripcion}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "2px 7px",
                  borderRadius: 10,
                }}
              >
                {rol.permisos.length} permisos
              </span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                {expandedId === rol.id ? "▲" : "▼"}
              </span>
            </div>

            {/* Expanded */}
            {expandedId === rol.id && (
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  padding: "12px 12px",
                }}
              >
                {/* Color picker row */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateRolField(rol.id, "color", c)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: c,
                        border: rol.color === c ? "2px solid white" : "2px solid transparent",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>

                {/* Permisos chips */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
                    Permisos específicos
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {rol.permisos.map((p) => (
                      <span
                        key={p}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 8px",
                          borderRadius: 12,
                          background: rol.color + "20",
                          border: `1px solid ${rol.color}40`,
                          fontSize: 11,
                          color: "rgba(255,255,255,0.8)",
                        }}
                      >
                        {p}
                        <button
                          onClick={() => removePermiso(rol.id, p)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "rgba(255,255,255,0.5)",
                            cursor: "pointer",
                            fontSize: 11,
                            lineHeight: 1,
                            padding: 0,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {rol.permisos.length === 0 && (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                        Sin permisos específicos
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="Agregar permiso…"
                      value={newPermiso[rol.id] ?? ""}
                      onChange={(e) =>
                        setNewPermiso((p) => ({ ...p, [rol.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addPermiso(rol.id);
                      }}
                    />
                    <button
                      onClick={() => addPermiso(rol.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: rol.color,
                        border: "none",
                        color: "white",
                        fontSize: 11,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => deleteRol(rol.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#ef4444",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Eliminar rol
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {config.roles.length === 0 && !showForm && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "rgba(255,255,255,0.3)",
            fontSize: 12,
          }}
        >
          No hay roles configurados. Crea el primero.
        </div>
      )}
    </div>
  );
}

// ── Tab: Matriz de permisos ───────────────────────────────────────────────────

function TabMatriz({
  config,
  onChange,
}: {
  config: PermissionConfig;
  onChange: (c: PermissionConfig) => void;
}) {
  function hasPermiso(permiso: string, rolId: string) {
    return (config.permisosWorkspace[permiso] ?? []).includes(rolId);
  }

  function toggle(permiso: string, rolId: string) {
    const current = config.permisosWorkspace[permiso] ?? [];
    const updated = current.includes(rolId)
      ? current.filter((r) => r !== rolId)
      : [...current, rolId];
    onChange({
      ...config,
      permisosWorkspace: { ...config.permisosWorkspace, [permiso]: updated },
    });
  }

  if (config.roles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
        Crea roles en la pestaña "Roles" primero.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "8px 10px",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 600,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                whiteSpace: "nowrap",
                minWidth: 200,
              }}
            >
              Permiso
            </th>
            {config.roles.map((rol) => (
              <th
                key={rol.id}
                style={{
                  textAlign: "center",
                  padding: "8px 10px",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: rol.color,
                    }}
                  />
                  {rol.nombre}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WS_PERMISSIONS.map((perm, i) => (
            <tr
              key={perm}
              style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
            >
              <td
                style={{
                  padding: "8px 10px",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "monospace",
                  fontSize: 11,
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                {perm}
              </td>
              {config.roles.map((rol) => (
                <td
                  key={rol.id}
                  style={{
                    textAlign: "center",
                    padding: "8px 10px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasPermiso(perm, rol.id)}
                    onChange={() => toggle(perm, rol.id)}
                    style={{ width: 15, height: 15, cursor: "pointer", accentColor: rol.color }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab: Etapas ───────────────────────────────────────────────────────────────

function TabEtapas({
  config,
  onChange,
}: {
  config: PermissionConfig;
  onChange: (c: PermissionConfig) => void;
}) {
  const [selectedEtapaId, setSelectedEtapaId] = useState<string | null>(
    config.permisosEtapa[0]?.etapaId ?? null
  );
  const [newEtapaId, setNewEtapaId] = useState("");

  const selectedEtapa = config.permisosEtapa.find((e) => e.etapaId === selectedEtapaId);

  function addEtapa() {
    const id = newEtapaId.trim();
    if (!id || config.permisosEtapa.some((e) => e.etapaId === id)) return;
    const nueva: PermisoEtapa = {
      etapaId: id,
      roles: [],
      puedeCompletar: false,
      puedeRechazar: false,
      puedeEditar: false,
      puedeVerTodo: false,
    };
    onChange({ ...config, permisosEtapa: [...config.permisosEtapa, nueva] });
    setSelectedEtapaId(id);
    setNewEtapaId("");
  }

  function toggleBool(field: keyof Omit<PermisoEtapa, "etapaId" | "roles">) {
    if (!selectedEtapaId) return;
    onChange({
      ...config,
      permisosEtapa: config.permisosEtapa.map((e) =>
        e.etapaId === selectedEtapaId ? { ...e, [field]: !e[field] } : e
      ),
    });
  }

  function toggleRol(rolId: string) {
    if (!selectedEtapaId) return;
    onChange({
      ...config,
      permisosEtapa: config.permisosEtapa.map((e) => {
        if (e.etapaId !== selectedEtapaId) return e;
        const has = e.roles.includes(rolId);
        return { ...e, roles: has ? e.roles.filter((r) => r !== rolId) : [...e.roles, rolId] };
      }),
    });
  }

  function deleteEtapa(etapaId: string) {
    onChange({ ...config, permisosEtapa: config.permisosEtapa.filter((e) => e.etapaId !== etapaId) });
    if (selectedEtapaId === etapaId) setSelectedEtapaId(null);
  }

  const BOOL_FIELDS: { field: keyof Omit<PermisoEtapa, "etapaId" | "roles">; label: string }[] = [
    { field: "puedeCompletar", label: "Puede completar" },
    { field: "puedeRechazar", label: "Puede rechazar" },
    { field: "puedeEditar", label: "Puede editar" },
    { field: "puedeVerTodo", label: "Puede ver todo" },
  ];

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {/* Left: etapa list */}
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="ID de etapa…"
              value={newEtapaId}
              onChange={(e) => setNewEtapaId(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addEtapa(); }}
            />
            <button
              onClick={addEtapa}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                background: "#7C3AED",
                border: "none",
                color: "white",
                fontSize: 12,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              +
            </button>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
            Ingresa el ID de la etapa del proceso
          </div>
        </div>

        {config.permisosEtapa.map((e) => (
          <div
            key={e.etapaId}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              borderRadius: 6,
              background:
                selectedEtapaId === e.etapaId
                  ? "rgba(124,58,237,0.15)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${selectedEtapaId === e.etapaId ? "rgba(124,58,237,0.35)" : "transparent"}`,
              cursor: "pointer",
              marginBottom: 4,
            }}
            onClick={() => setSelectedEtapaId(e.etapaId)}
          >
            <span style={{ fontSize: 12, color: "white", fontFamily: "monospace" }}>
              {e.etapaId}
            </span>
            <button
              onClick={(ev) => { ev.stopPropagation(); deleteEtapa(e.etapaId); }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 13,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}

        {config.permisosEtapa.length === 0 && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "16px 0" }}>
            Sin etapas configuradas
          </div>
        )}
      </div>

      {/* Right: permission table */}
      {selectedEtapa ? (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 12,
              fontFamily: "monospace",
            }}
          >
            Etapa: {selectedEtapa.etapaId}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "rgba(255,255,255,0.5)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    Rol
                  </th>
                  {BOOL_FIELDS.map((f) => (
                    <th
                      key={f.field}
                      style={{
                        textAlign: "center",
                        padding: "8px 8px",
                        color: "rgba(255,255,255,0.5)",
                        fontWeight: 600,
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        whiteSpace: "nowrap",
                        fontSize: 11,
                      }}
                    >
                      {f.label}
                    </th>
                  ))}
                  <th style={{ textAlign: "center", padding: "8px 10px", color: "rgba(255,255,255,0.5)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    Asignado
                  </th>
                </tr>
              </thead>
              <tbody>
                {config.roles.map((rol, i) => (
                  <tr key={rol.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: rol.color }} />
                        <span style={{ color: "white", fontSize: 12 }}>{rol.nombre}</span>
                      </div>
                    </td>
                    {BOOL_FIELDS.map((f) => (
                      <td key={f.field} style={{ textAlign: "center", padding: "8px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <input
                          type="checkbox"
                          checked={!!selectedEtapa[f.field]}
                          onChange={() => toggleBool(f.field)}
                          style={{ width: 14, height: 14, cursor: "pointer", accentColor: rol.color }}
                        />
                      </td>
                    ))}
                    <td style={{ textAlign: "center", padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <input
                        type="checkbox"
                        checked={selectedEtapa.roles.includes(rol.id)}
                        onChange={() => toggleRol(rol.id)}
                        style={{ width: 14, height: 14, cursor: "pointer", accentColor: rol.color }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
          Selecciona o agrega una etapa
        </div>
      )}
    </div>
  );
}

// ── Tab: Campos ───────────────────────────────────────────────────────────────

function TabCampos({
  config,
  onChange,
}: {
  config: PermissionConfig;
  onChange: (c: PermissionConfig) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ formId: "", campoId: "", rolId: "", nivel: "ver" as "ver" | "editar" | "oculto" });

  function addRegla() {
    if (!form.formId.trim() || !form.campoId.trim() || !form.rolId) return;
    const key = `${form.formId}:${form.campoId}`;
    const existing = config.permisosCampo.find((p) => p.formId === form.formId && p.campoId === form.campoId);
    if (existing) {
      onChange({
        ...config,
        permisosCampo: config.permisosCampo.map((p) =>
          p.formId === form.formId && p.campoId === form.campoId
            ? { ...p, roles: { ...p.roles, [form.rolId]: form.nivel } }
            : p
        ),
      });
    } else {
      const nueva: PermisoCampo = {
        formId: form.formId.trim(),
        campoId: form.campoId.trim(),
        roles: { [form.rolId]: form.nivel },
      };
      onChange({ ...config, permisosCampo: [...config.permisosCampo, nueva] });
    }
    setForm({ formId: "", campoId: "", rolId: "", nivel: "ver" });
    setShowForm(false);
  }

  function deleteRegla(idx: number) {
    onChange({
      ...config,
      permisosCampo: config.permisosCampo.filter((_, i) => i !== idx),
    });
  }

  // Flatten for display: one row per (campo, rol)
  const rows: { formId: string; campoId: string; rolId: string; nivel: string; idx: number }[] = [];
  config.permisosCampo.forEach((p, idx) => {
    Object.entries(p.roles).forEach(([rolId, nivel]) => {
      rows.push({ formId: p.formId, campoId: p.campoId, rolId, nivel, idx });
    });
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
          Reglas de campo ({rows.length})
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "5px 12px",
            borderRadius: 6,
            background: "#7C3AED",
            border: "none",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Agregar regla
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: 8,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Form ID</label>
              <input
                style={inputStyle}
                placeholder="form-id"
                value={form.formId}
                onChange={(e) => setForm((f) => ({ ...f, formId: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Campo ID</label>
              <input
                style={inputStyle}
                placeholder="campo-id"
                value={form.campoId}
                onChange={(e) => setForm((f) => ({ ...f, campoId: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Rol</label>
              <select
                style={inputStyle}
                value={form.rolId}
                onChange={(e) => setForm((f) => ({ ...f, rolId: e.target.value }))}
              >
                <option value="">Seleccionar…</option>
                {config.roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Nivel</label>
              <select
                style={inputStyle}
                value={form.nivel}
                onChange={(e) => setForm((f) => ({ ...f, nivel: e.target.value as "ver" | "editar" | "oculto" }))}
              >
                <option value="ver">Ver</option>
                <option value="editar">Editar</option>
                <option value="oculto">Oculto</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addRegla}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "#7C3AED",
                border: "none",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Agregar
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.07)",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
          No hay reglas de campo configuradas.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {["Form ID", "Campo ID", "Rol", "Nivel", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "7px 10px",
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 600,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 11,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const rol = config.roles.find((r) => r.id === row.rolId);
              const nivelColor =
                row.nivel === "editar" ? "#12A150" : row.nivel === "ver" ? "#2E6BE6" : "#ef4444";
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.6)", fontFamily: "monospace", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {row.formId}
                  </td>
                  <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.6)", fontFamily: "monospace", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {row.campoId}
                  </td>
                  <td style={{ padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {rol ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: rol.color }} />
                        <span style={{ color: "white" }}>{rol.nombre}</span>
                      </div>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>{row.rolId}</span>
                    )}
                  </td>
                  <td style={{ padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: nivelColor,
                        background: nivelColor + "20",
                        padding: "2px 7px",
                        borderRadius: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      {row.nivel}
                    </span>
                  </td>
                  <td style={{ padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "right" }}>
                    <button
                      onClick={() => deleteRegla(row.idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.3)",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = "roles" | "matriz" | "etapas" | "campos";

export function PermissionBuilder({ wsId }: { wsId: string }) {
  const { data: items = [], isLoading } = useBuilderList<PermissionConfig>(wsId, "permission");
  const save = useBuilderSave<PermissionConfig>(wsId, "permission");
  const publish = useBuilderPublish(wsId, "permission");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PermissionConfig | null>(null);
  const [tab, setTab] = useState<Tab>("roles");

  function handleSelect(id: string | null) {
    setSelectedId(id);
    const found = items.find((i) => i.id === id) ?? null;
    setDraft(found ? { ...found } : null);
    setTab("roles");
  }

  function handleNew() {
    const p = emptyPermission(wsId);
    setDraft(p);
    setSelectedId(null);
    setTab("roles");
  }

  async function handleSave() {
    if (!draft) return;
    const saved = await save.mutateAsync(draft as Parameters<typeof save.mutateAsync>[0]);
    setSelectedId(saved.id);
    setDraft({ ...saved });
  }

  async function handlePublish() {
    if (!selectedId && draft) {
      const saved = await save.mutateAsync(draft as Parameters<typeof save.mutateAsync>[0]);
      await publish.mutateAsync(saved.id);
      setSelectedId(saved.id);
    } else if (selectedId) {
      await publish.mutateAsync(selectedId);
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "roles", label: "Roles" },
    { id: "matriz", label: "Matriz de permisos" },
    { id: "etapas", label: "Etapas" },
    { id: "campos", label: "Campos" },
  ];

  return (
    <BuilderShell
      wsId={wsId}
      meta={META}
      items={items}
      selectedId={selectedId}
      onSelect={handleSelect}
      onNew={handleNew}
      isLoading={isLoading}
    >
      {!draft ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "rgba(255,255,255,0.3)",
            fontSize: 13,
          }}
        >
          Selecciona una configuración o crea una nueva
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div
            style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <input
                style={{
                  ...inputStyle,
                  fontSize: 16,
                  fontWeight: 700,
                  background: "transparent",
                  border: "none",
                  padding: "0",
                  flex: 1,
                }}
                value={draft.nombre}
                onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
                placeholder="Nombre de la configuración"
              />
              <StatusBadge status={draft.status} />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2 }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    background: tab === t.id ? "rgba(124,58,237,0.2)" : "transparent",
                    border: `1px solid ${tab === t.id ? "rgba(124,58,237,0.4)" : "transparent"}`,
                    color: tab === t.id ? "#a78bfa" : "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    fontWeight: tab === t.id ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {tab === "roles" && (
              <TabRoles config={draft} onChange={setDraft} />
            )}
            {tab === "matriz" && (
              <TabMatriz config={draft} onChange={setDraft} />
            )}
            {tab === "etapas" && (
              <TabEtapas config={draft} onChange={setDraft} />
            )}
            {tab === "campos" && (
              <TabCampos config={draft} onChange={setDraft} />
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleSave}
              disabled={save.isPending}
              style={{
                padding: "8px 20px",
                borderRadius: 7,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {save.isPending ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={handlePublish}
              disabled={publish.isPending}
              style={{
                padding: "8px 20px",
                borderRadius: 7,
                background: "#7C3AED",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {publish.isPending ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      )}
    </BuilderShell>
  );
}
