"use client";

import { useState } from "react";
import { BuilderShell } from "./BuilderShell";
import { BUILDER_REGISTRY } from "@/types/builders";
import type { FormConfig, CampoFormulario, TipoCampo, ReglaCampo } from "@/types/builders";
import { useBuilderList, useBuilderSave, useBuilderPublish } from "@/hooks/useBuilder";

const META = BUILDER_REGISTRY.find((b) => b.tipo === "form")!;

const TIPOS: { tipo: TipoCampo; label: string; icono: string }[] = [
  { tipo: "texto", label: "Texto corto", icono: "M4 6h16M4 10h10" },
  { tipo: "textarea", label: "Texto largo", icono: "M4 6h16M4 10h16M4 14h16M4 18h10" },
  { tipo: "numero", label: "Número", icono: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14" },
  { tipo: "email", label: "Correo", icono: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { tipo: "fecha", label: "Fecha", icono: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { tipo: "select", label: "Lista desplegable", icono: "M19 9l-7 7-7-7" },
  { tipo: "radio", label: "Selección única", icono: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { tipo: "checkbox", label: "Casillas múltiples", icono: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { tipo: "archivo", label: "Archivo adjunto", icono: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
  { tipo: "firma", label: "Firma digital", icono: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
  { tipo: "separador", label: "Separador", icono: "M5 12h14" },
  { tipo: "titulo", label: "Título de sección", icono: "M4 6h16M4 10h7" },
];

const labelStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 4, fontSize: 11,
  color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em",
};
const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6, padding: "7px 10px", fontSize: 13, color: "white",
  outline: "none", width: "100%", boxSizing: "border-box",
};

function uid() { return `f${Math.random().toString(36).slice(2, 8)}`; }

function newCampo(tipo: TipoCampo, orden: number): CampoFormulario {
  return {
    id: uid(),
    tipo,
    etiqueta: TIPOS.find(t => t.tipo === tipo)?.label || tipo,
    placeholder: "",
    ayuda: "",
    requerido: false,
    orden,
    opciones: (tipo === "select" || tipo === "radio" || tipo === "checkbox")
      ? [{ valor: "opcion1", etiqueta: "Opción 1" }]
      : undefined,
    reglas: [],
    ancho: "full",
  };
}

function newForm(wsId: string): Omit<FormConfig, "id" | "createdAt" | "updatedAt"> {
  return {
    tipo: "form",
    wsId,
    nombre: "Nuevo Formulario",
    version: 1,
    status: "draft",
    creadoPor: "admin",
    campos: [],
    permiteGuardadoParcial: false,
    requiereFirma: false,
  };
}

interface FieldCardProps {
  campo: CampoFormulario;
  isSelected: boolean;
  color: string;
  onSelect: () => void;
  onDelete: () => void;
  dragHandleProps: { draggable: boolean; onDragStart: (e: React.DragEvent) => void };
}

function FieldCard({ campo, isSelected, color, onSelect, onDelete, dragHandleProps }: FieldCardProps) {
  const tipoInfo = TIPOS.find(t => t.tipo === campo.tipo);
  return (
    <div onClick={onSelect} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
      border: `1px solid ${isSelected ? color + "60" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 8, marginBottom: 6, background: isSelected ? color + "10" : "rgba(255,255,255,0.02)",
      cursor: "pointer", transition: "all 0.15s",
    }}>
      <div {...dragHandleProps} style={{ cursor: "grab", color: "rgba(255,255,255,0.2)", flexShrink: 0 }}
        onClick={e => e.stopPropagation()}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <path d="M8 9h.01M8 12h.01M8 15h.01M16 9h.01M16 12h.01M16 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path d={tipoInfo?.icono || ""} stroke={isSelected ? color : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "white", fontWeight: isSelected ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {campo.etiqueta || campo.tipo}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{tipoInfo?.label}</div>
      </div>
      {campo.requerido && (
        <span style={{ fontSize: 9, color: "#ef4444", background: "#ef444420", padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>REQ</span>
      )}
      <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{
        background: "transparent", border: "none", cursor: "pointer",
        color: "rgba(255,255,255,0.2)", padding: 4, lineHeight: 0,
      }}>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

interface FieldPropsEditorProps {
  campo: CampoFormulario;
  onChange: (c: CampoFormulario) => void;
}

function FieldPropsEditor({ campo, onChange }: FieldPropsEditorProps) {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", marginBottom: 4 }}>
        PROPIEDADES
      </div>
      <label style={labelStyle}>
        Etiqueta visible
        <input value={campo.etiqueta} onChange={e => onChange({ ...campo, etiqueta: e.target.value })} style={inputStyle} />
      </label>
      {(campo.tipo !== "separador" && campo.tipo !== "titulo" && campo.tipo !== "instruccion") && (
        <>
          <label style={labelStyle}>
            Texto de ayuda
            <input value={campo.ayuda || ""} onChange={e => onChange({ ...campo, ayuda: e.target.value })} style={inputStyle} placeholder="Descripción o ejemplo" />
          </label>
          {(campo.tipo === "texto" || campo.tipo === "textarea" || campo.tipo === "numero" || campo.tipo === "email") && (
            <label style={labelStyle}>
              Placeholder
              <input value={campo.placeholder || ""} onChange={e => onChange({ ...campo, placeholder: e.target.value })} style={inputStyle} />
            </label>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={campo.requerido} onChange={e => onChange({ ...campo, requerido: e.target.checked })} />
              <span>Requerido</span>
            </label>
            <label style={labelStyle}>
              Ancho
              <select value={campo.ancho} onChange={e => onChange({ ...campo, ancho: e.target.value as "full" | "half" | "third" })} style={inputStyle}>
                <option value="full">Completo</option>
                <option value="half">Mitad</option>
                <option value="third">Un tercio</option>
              </select>
            </label>
          </div>
        </>
      )}
      {(campo.tipo === "select" || campo.tipo === "radio" || campo.tipo === "checkbox") && campo.opciones && (
        <div>
          <div style={{ ...labelStyle, marginBottom: 6 }}>Opciones</div>
          {campo.opciones.map((op, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input value={op.etiqueta} placeholder="Etiqueta" style={{ ...inputStyle, flex: 1 }}
                onChange={e => onChange({
                  ...campo,
                  opciones: campo.opciones!.map((o, j) => j === i
                    ? { ...o, etiqueta: e.target.value, valor: e.target.value.toLowerCase().replace(/\s+/g, "_") }
                    : o),
                })} />
              <button onClick={() => onChange({ ...campo, opciones: campo.opciones!.filter((_, j) => j !== i) })} style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6, cursor: "pointer", padding: "0 8px", color: "rgba(255,255,255,0.3)",
              }}>✕</button>
            </div>
          ))}
          <button onClick={() => onChange({
            ...campo,
            opciones: [...(campo.opciones || []), { valor: `op${(campo.opciones?.length || 0) + 1}`, etiqueta: `Opción ${(campo.opciones?.length || 0) + 1}` }],
          })} style={{ fontSize: 11, color: META.color, background: "transparent", border: `1px solid ${META.color}30`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
            + Agregar opción
          </button>
        </div>
      )}
    </div>
  );
}

function FormCanvas({ config: initial, wsId, onClose }: { config: FormConfig; wsId: string; onClose: () => void }) {
  const [config, setConfig] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);
  const save = useBuilderSave<FormConfig>(wsId, "form");
  const publish = useBuilderPublish(wsId, "form");

  const addCampo = (tipo: TipoCampo) => {
    const campo = newCampo(tipo, config.campos.length + 1);
    setConfig(c => ({ ...c, campos: [...c.campos, campo] }));
    setSelectedId(campo.id);
  };

  const updateCampo = (id: string, c: CampoFormulario) =>
    setConfig(cfg => ({ ...cfg, campos: cfg.campos.map(x => x.id === id ? c : x) }));

  const deleteCampo = (id: string) =>
    setConfig(cfg => ({
      ...cfg,
      campos: cfg.campos.filter(x => x.id !== id).map((c, i) => ({ ...c, orden: i + 1 })),
    }));

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const reordered = [...config.campos];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setConfig(c => ({ ...c, campos: reordered.map((x, i) => ({ ...x, orden: i + 1 })) }));
    setDragIdx(null);
    setDropIdx(null);
  };

  const selected = config.campos.find(c => c.id === selectedId);

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0, overflow: "hidden" }}>
      {/* Field list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <input value={config.nombre} onChange={e => setConfig(c => ({ ...c, nombre: e.target.value }))}
              style={{ fontSize: 16, fontWeight: 700, color: "white", background: "transparent", border: "none", outline: "none", width: 280 }} />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{config.campos.length} campos</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>Cerrar</button>
            <button onClick={() => save.mutate(config as Parameters<typeof save.mutate>[0])} style={{ fontSize: 12, color: "white", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>{save.isPending ? "…" : "Guardar"}</button>
            <button onClick={() => config.id && publish.mutate(config.id)} style={{ fontSize: 12, color: "white", background: META.color, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>Publicar</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={config.permiteGuardadoParcial} onChange={e => setConfig(c => ({ ...c, permiteGuardadoParcial: e.target.checked }))} />
            <span style={{ fontSize: 12 }}>Guardado parcial</span>
          </label>
          <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={config.requiereFirma} onChange={e => setConfig(c => ({ ...c, requiereFirma: e.target.checked }))} />
            <span style={{ fontSize: 12 }}>Requiere firma</span>
          </label>
        </div>

        {config.campos.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
            Selecciona un tipo de campo en el panel derecho para comenzar
          </div>
        )}

        {config.campos.map((campo, idx) => (
          <div key={campo.id}
            onDragOver={e => { e.preventDefault(); setDropIdx(idx); }}
            onDrop={() => handleDrop(idx)}
            style={{ opacity: dragIdx === idx ? 0.4 : 1, outline: dropIdx === idx ? `2px dashed ${META.color}` : "none", borderRadius: 8 }}
          >
            <FieldCard campo={campo} isSelected={campo.id === selectedId} color={META.color}
              onSelect={() => setSelectedId(campo.id === selectedId ? null : campo.id)}
              onDelete={() => deleteCampo(campo.id)}
              dragHandleProps={{ draggable: true, onDragStart: () => setDragIdx(idx) }}
            />
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ width: 240, flexShrink: 0, overflowY: "auto" }}>
        {selected ? (
          <FieldPropsEditor campo={selected} onChange={c => updateCampo(c.id, c)} />
        ) : (
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>TIPOS DE CAMPO</div>
            {TIPOS.map(t => (
              <button key={t.tipo} onClick={() => addCampo(t.tipo)} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                padding: "7px 8px", marginBottom: 4, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, cursor: "pointer",
              }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <path d={t.icono} stroke={META.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function FormBuilder({ wsId }: { wsId: string }) {
  const { data: items = [], isLoading } = useBuilderList<FormConfig>(wsId, "form");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const save = useBuilderSave<FormConfig>(wsId, "form");

  const selected = items.find(i => i.id === selectedId) ?? null;

  const handleNew = () => {
    save.mutate(newForm(wsId) as Parameters<typeof save.mutate>[0], {
      onSuccess: (saved) => setSelectedId(saved.id),
    });
  };

  return (
    <BuilderShell wsId={wsId} meta={META} items={items} selectedId={selectedId}
      onSelect={setSelectedId} onNew={handleNew} isLoading={isLoading}>
      {selected ? (
        <FormCanvas key={selected.id} config={selected} wsId={wsId} onClose={() => setSelectedId(null)} />
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
          Selecciona un formulario o crea uno nuevo
        </div>
      )}
    </BuilderShell>
  );
}
