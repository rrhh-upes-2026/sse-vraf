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
import { BuilderSDK } from "@/services/builder-sdk";
import { BUILDER_REGISTRY } from "@/types/builders";
import type { CatalogConfig, EntradaCatalogo, TipoCatalogo } from "@/types/builders";

// ── Constants ─────────────────────────────────────────────────────────────────

const META = BUILDER_REGISTRY.find((b) => b.tipo === "catalog")!;

const TIPO_CATALOGO_LABELS: Record<TipoCatalogo, string> = {
  departamentos: "Departamentos",
  puestos: "Puestos",
  competencias: "Competencias",
  contratos: "Contratos",
  tipos_documento: "Tipos de documento",
  tipos_solicitud: "Tipos de solicitud",
  estados: "Estados",
  custom: "Personalizado",
};

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
  return `cat-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyCatalog(wsId: string): CatalogConfig {
  return {
    id: uid(),
    wsId,
    nombre: "Nuevo catálogo",
    version: 1,
    status: "draft",
    tipo: "catalog",
    tipoCatalogo: "departamentos",
    tieneJerarquia: false,
    atributosPersonalizados: [],
    entradas: [],
    creadoPor: "usuario",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function emptyEntry(order: number): EntradaCatalogo {
  return {
    id: uid(),
    codigo: "",
    nombre: "",
    descripcion: "",
    activo: true,
    atributos: {},
    orden: order,
  };
}

// ── Inline-editable cell ──────────────────────────────────────────────────────

function EditableCell({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        autoFocus
        style={{
          ...inputStyle,
          padding: "4px 7px",
          fontFamily: mono ? "monospace" : "inherit",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="Clic para editar"
      style={{
        padding: "4px 7px",
        borderRadius: 5,
        cursor: "text",
        color: value ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
        fontFamily: mono ? "monospace" : "inherit",
        fontSize: 12,
        minWidth: 40,
        border: "1px solid transparent",
        transition: "border-color 0.1s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
      }}
    >
      {value || placeholder || "—"}
    </div>
  );
}

// ── Custom attribute value cell ───────────────────────────────────────────────

function AtributoCell({
  atributo,
  value,
  onChange,
}: {
  atributo: { nombre: string; tipo: "texto" | "numero" | "booleano" };
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  if (atributo.tipo === "booleano") {
    return (
      <div style={{ textAlign: "center" }}>
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 14, height: 14, cursor: "pointer", accentColor: "#64748b" }}
        />
      </div>
    );
  }

  return (
    <EditableCell
      value={String(value ?? "")}
      onChange={(v) =>
        onChange(atributo.tipo === "numero" ? (parseFloat(v) || 0) : v)
      }
      placeholder={atributo.tipo === "numero" ? "0" : "—"}
    />
  );
}

// ── Entries table ─────────────────────────────────────────────────────────────

function EntriesTable({
  config,
  onEntryChange,
  onEntryDelete,
  onEntryAdd,
  savingEntryId,
}: {
  config: CatalogConfig;
  onEntryChange: (entry: EntradaCatalogo) => void;
  onEntryDelete: (id: string) => void;
  onEntryAdd: () => void;
  savingEntryId: string | null;
}) {
  const { entradas, tieneJerarquia, atributosPersonalizados } = config;

  const cols = [
    { key: "codigo", label: "Código", width: 90 },
    { key: "nombre", label: "Nombre", width: 180 },
    { key: "descripcion", label: "Descripción", width: 200 },
    ...(tieneJerarquia ? [{ key: "padreId", label: "Padre ID", width: 100 }] : []),
    ...atributosPersonalizados.map((a) => ({ key: `attr:${a.nombre}`, label: a.nombre, width: 120 })),
    { key: "activo", label: "Activo", width: 60 },
    { key: "actions", label: "", width: 50 },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  padding: "7px 8px",
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 600,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  width: c.width,
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entradas.map((entry, i) => (
            <tr
              key={entry.id}
              style={{
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                opacity: savingEntryId === entry.id ? 0.5 : 1,
              }}
            >
              <td style={{ padding: "3px 4px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <EditableCell
                  value={entry.codigo}
                  onChange={(v) => onEntryChange({ ...entry, codigo: v })}
                  placeholder="CÓD"
                  mono
                />
              </td>
              <td style={{ padding: "3px 4px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <EditableCell
                  value={entry.nombre}
                  onChange={(v) => onEntryChange({ ...entry, nombre: v })}
                  placeholder="Nombre…"
                />
              </td>
              <td style={{ padding: "3px 4px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <EditableCell
                  value={entry.descripcion ?? ""}
                  onChange={(v) => onEntryChange({ ...entry, descripcion: v })}
                  placeholder="Descripción…"
                />
              </td>
              {tieneJerarquia && (
                <td style={{ padding: "3px 4px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <EditableCell
                    value={entry.padreId ?? ""}
                    onChange={(v) => onEntryChange({ ...entry, padreId: v || undefined })}
                    placeholder="ID padre"
                    mono
                  />
                </td>
              )}
              {atributosPersonalizados.map((a) => (
                <td key={a.nombre} style={{ padding: "3px 4px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <AtributoCell
                    atributo={a}
                    value={entry.atributos[a.nombre] ?? (a.tipo === "booleano" ? false : a.tipo === "numero" ? 0 : "")}
                    onChange={(v) =>
                      onEntryChange({ ...entry, atributos: { ...entry.atributos, [a.nombre]: v } })
                    }
                  />
                </td>
              ))}
              <td style={{ padding: "3px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={entry.activo}
                  onChange={(e) => onEntryChange({ ...entry, activo: e.target.checked })}
                  style={{ width: 14, height: 14, cursor: "pointer", accentColor: "#12A150" }}
                />
              </td>
              <td style={{ padding: "3px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                <button
                  onClick={() => onEntryDelete(entry.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: 0,
                    lineHeight: 1,
                  }}
                  title="Eliminar entrada"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ padding: "10px 4px" }}>
        <button
          onClick={onEntryAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.05)",
            border: "1px dashed rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          + Nueva entrada
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CatalogBuilder({ wsId }: { wsId: string }) {
  const { data: items = [], isLoading } = useBuilderList<CatalogConfig>(wsId, "catalog");
  const save = useBuilderSave<CatalogConfig>(wsId, "catalog");
  const publish = useBuilderPublish(wsId, "catalog");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CatalogConfig | null>(null);
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);
  const [newAttrForm, setNewAttrForm] = useState({ nombre: "", tipo: "texto" as "texto" | "numero" | "booleano" });
  const [showAttrForm, setShowAttrForm] = useState(false);

  function handleSelect(id: string | null) {
    setSelectedId(id);
    const found = items.find((i) => i.id === id) ?? null;
    setDraft(found ? { ...found, entradas: [...found.entradas] } : null);
  }

  function handleNew() {
    const c = emptyCatalog(wsId);
    setDraft(c);
    setSelectedId(null);
  }

  async function handleSave() {
    if (!draft) return;
    const saved = await save.mutateAsync(draft as Parameters<typeof save.mutateAsync>[0]);
    setSelectedId(saved.id);
    setDraft({ ...saved });
  }

  async function handlePublish() {
    if (!draft) return;
    let id = selectedId;
    if (!id) {
      const saved = await save.mutateAsync(draft as Parameters<typeof save.mutateAsync>[0]);
      id = saved.id;
      setSelectedId(id);
    }
    await publish.mutateAsync(id!);
  }

  async function handleEntryChange(entry: EntradaCatalogo) {
    if (!draft) return;
    const updated: CatalogConfig = {
      ...draft,
      entradas: draft.entradas.map((e) => (e.id === entry.id ? entry : e)),
    };
    setDraft(updated);

    if (selectedId) {
      setSavingEntryId(entry.id);
      try {
        await BuilderSDK.saveCatalogEntry(wsId, selectedId, entry);
      } finally {
        setSavingEntryId(null);
      }
    }
  }

  async function handleEntryDelete(entryId: string) {
    if (!draft) return;
    setDraft({ ...draft, entradas: draft.entradas.filter((e) => e.id !== entryId) });
    if (selectedId) {
      await BuilderSDK.deleteCatalogEntry(wsId, selectedId, entryId);
    }
  }

  function handleEntryAdd() {
    if (!draft) return;
    const newEntry = emptyEntry(draft.entradas.length + 1);
    setDraft({ ...draft, entradas: [...draft.entradas, newEntry] });
  }

  function addAtributo() {
    if (!draft || !newAttrForm.nombre.trim()) return;
    setDraft({
      ...draft,
      atributosPersonalizados: [
        ...draft.atributosPersonalizados,
        { nombre: newAttrForm.nombre.trim(), tipo: newAttrForm.tipo },
      ],
    });
    setNewAttrForm({ nombre: "", tipo: "texto" });
    setShowAttrForm(false);
  }

  function removeAtributo(nombre: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      atributosPersonalizados: draft.atributosPersonalizados.filter((a) => a.nombre !== nombre),
    });
  }

  const enrichedItems = items.map((item) => ({
    ...item,
    nombre: `${item.nombre} (${item.entradas.length})`,
  }));

  return (
    <BuilderShell
      wsId={wsId}
      meta={META}
      items={enrichedItems}
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
          Selecciona un catálogo o crea uno nuevo
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
          {/* Header */}
          <div
            style={{
              padding: "16px 20px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <input
                style={{
                  ...inputStyle,
                  fontSize: 16,
                  fontWeight: 700,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  flex: 1,
                }}
                value={draft.nombre}
                onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
                placeholder="Nombre del catálogo"
              />
              <StatusBadge status={draft.status} />
            </div>

            {/* Config row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {/* Tipo */}
              <div style={{ minWidth: 180 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 5 }}>
                  Tipo de catálogo
                </label>
                <select
                  style={inputStyle}
                  value={draft.tipoCatalogo}
                  onChange={(e) =>
                    setDraft({ ...draft, tipoCatalogo: e.target.value as TipoCatalogo })
                  }
                >
                  {(Object.keys(TIPO_CATALOGO_LABELS) as TipoCatalogo[]).map((t) => (
                    <option key={t} value={t}>
                      {TIPO_CATALOGO_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre personalizado */}
              {draft.tipoCatalogo === "custom" && (
                <div style={{ minWidth: 180 }}>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 5 }}>
                    Nombre personalizado
                  </label>
                  <input
                    style={inputStyle}
                    value={draft.nombrePersonalizado ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, nombrePersonalizado: e.target.value })
                    }
                    placeholder="ej. Categorías especiales"
                  />
                </div>
              )}

              {/* Jerarquía toggle */}
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div
                    onClick={() => setDraft({ ...draft, tieneJerarquia: !draft.tieneJerarquia })}
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 10,
                      background: draft.tieneJerarquia ? "#64748b" : "rgba(255,255,255,0.1)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 2,
                        left: draft.tieneJerarquia ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "white",
                        transition: "left 0.2s",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                    Tiene jerarquía
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Scroll area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {/* Atributos personalizados */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
                  Atributos personalizados
                </span>
                <button
                  onClick={() => setShowAttrForm(!showAttrForm)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    background: "rgba(100,116,139,0.2)",
                    border: "1px solid rgba(100,116,139,0.35)",
                    color: "#94a3b8",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Agregar atributo
                </button>
              </div>

              {showAttrForm && (
                <div
                  style={{
                    background: "rgba(100,116,139,0.08)",
                    border: "1px solid rgba(100,116,139,0.2)",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-end",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                      Nombre
                    </label>
                    <input
                      style={inputStyle}
                      placeholder="ej. Código institucional"
                      value={newAttrForm.nombre}
                      onChange={(e) => setNewAttrForm((f) => ({ ...f, nombre: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") addAtributo(); }}
                    />
                  </div>
                  <div style={{ width: 130 }}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                      Tipo
                    </label>
                    <select
                      style={inputStyle}
                      value={newAttrForm.tipo}
                      onChange={(e) =>
                        setNewAttrForm((f) => ({ ...f, tipo: e.target.value as "texto" | "numero" | "booleano" }))
                      }
                    >
                      <option value="texto">Texto</option>
                      <option value="numero">Número</option>
                      <option value="booleano">Booleano</option>
                    </select>
                  </div>
                  <button
                    onClick={addAtributo}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 6,
                      background: "#64748b",
                      border: "none",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => setShowAttrForm(false)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.07)",
                      border: "none",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 12,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {draft.atributosPersonalizados.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {draft.atributosPersonalizados.map((a) => (
                    <div
                      key={a.nombre}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: "rgba(100,116,139,0.15)",
                        border: "1px solid rgba(100,116,139,0.25)",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{a.nombre}</span>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#94a3b8",
                          background: "rgba(100,116,139,0.3)",
                          padding: "1px 5px",
                          borderRadius: 3,
                        }}
                      >
                        {a.tipo}
                      </span>
                      <button
                        onClick={() => removeAtributo(a.nombre)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(255,255,255,0.3)",
                          cursor: "pointer",
                          fontSize: 13,
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", padding: "6px 0" }}>
                  Sin atributos personalizados
                </div>
              )}
            </div>

            {/* Entries */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
                  Entradas
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      background: "rgba(255,255,255,0.08)",
                      padding: "1px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {draft.entradas.length}
                  </span>
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  Clic en una celda para editar
                </span>
              </div>

              <EntriesTable
                config={draft}
                onEntryChange={handleEntryChange}
                onEntryDelete={handleEntryDelete}
                onEntryAdd={handleEntryAdd}
                savingEntryId={savingEntryId}
              />
            </div>
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
              {save.isPending ? "Guardando…" : "Guardar configuración"}
            </button>
            <button
              onClick={handlePublish}
              disabled={publish.isPending}
              style={{
                padding: "8px 20px",
                borderRadius: 7,
                background: "#64748b",
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
