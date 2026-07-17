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
  ReportConfig,
  EntidadReporte,
  ColumnaReporte,
  FiltroReporte,
  TipoGraficoReporte,
} from "@/types/builders";

// ── Constants ─────────────────────────────────────────────────────────────────

const META = BUILDER_REGISTRY.find((b) => b.tipo === "report")!;

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

const ENTITY_LABELS: Record<EntidadReporte, string> = {
  procesos: "Procesos",
  candidatos: "Candidatos",
  formularios: "Formularios",
  indicadores: "Indicadores",
  usuarios: "Usuarios",
  tareas: "Tareas",
  documentos: "Documentos",
};

const ENTITY_FIELDS: Record<EntidadReporte, { campo: string; etiqueta: string; tipo: ColumnaReporte["tipo"] }[]> = {
  procesos: [
    { campo: "id", etiqueta: "ID", tipo: "texto" },
    { campo: "codigo", etiqueta: "Código", tipo: "texto" },
    { campo: "nombrePuesto", etiqueta: "Nombre del puesto", tipo: "texto" },
    { campo: "unidadFacultad", etiqueta: "Unidad / Facultad", tipo: "texto" },
    { campo: "etapaActual", etiqueta: "Etapa actual", tipo: "estado" },
    { campo: "pasoActual", etiqueta: "Paso actual", tipo: "texto" },
    { campo: "prioridad", etiqueta: "Prioridad", tipo: "estado" },
    { campo: "createdAt", etiqueta: "Fecha de creación", tipo: "fecha" },
    { campo: "jefeSolicitante", etiqueta: "Jefe solicitante", tipo: "texto" },
  ],
  candidatos: [
    { campo: "id", etiqueta: "ID", tipo: "texto" },
    { campo: "nombre", etiqueta: "Nombre", tipo: "texto" },
    { campo: "email", etiqueta: "Correo", tipo: "texto" },
    { campo: "telefono", etiqueta: "Teléfono", tipo: "texto" },
    { campo: "puesto", etiqueta: "Puesto", tipo: "texto" },
    { campo: "estado", etiqueta: "Estado", tipo: "estado" },
    { campo: "puntuacionTotal", etiqueta: "Puntuación total", tipo: "numero" },
    { campo: "createdAt", etiqueta: "Fecha", tipo: "fecha" },
  ],
  formularios: [
    { campo: "id", etiqueta: "ID", tipo: "texto" },
    { campo: "nombre", etiqueta: "Nombre", tipo: "texto" },
    { campo: "procesoId", etiqueta: "ID de proceso", tipo: "texto" },
    { campo: "version", etiqueta: "Versión", tipo: "numero" },
    { campo: "status", etiqueta: "Estado", tipo: "estado" },
    { campo: "createdAt", etiqueta: "Fecha", tipo: "fecha" },
  ],
  indicadores: [
    { campo: "id", etiqueta: "ID", tipo: "texto" },
    { campo: "nombre", etiqueta: "Nombre", tipo: "texto" },
    { campo: "tipoKPI", etiqueta: "Tipo KPI", tipo: "texto" },
    { campo: "valorObjetivo", etiqueta: "Valor objetivo", tipo: "numero" },
    { campo: "unidad", etiqueta: "Unidad", tipo: "texto" },
    { campo: "frecuenciaCalculo", etiqueta: "Frecuencia", tipo: "texto" },
  ],
  usuarios: [
    { campo: "id", etiqueta: "ID", tipo: "texto" },
    { campo: "nombre", etiqueta: "Nombre", tipo: "texto" },
    { campo: "email", etiqueta: "Correo", tipo: "texto" },
    { campo: "rol", etiqueta: "Rol", tipo: "texto" },
    { campo: "activo", etiqueta: "Activo", tipo: "estado" },
    { campo: "createdAt", etiqueta: "Fecha", tipo: "fecha" },
  ],
  tareas: [
    { campo: "id", etiqueta: "ID", tipo: "texto" },
    { campo: "titulo", etiqueta: "Título", tipo: "texto" },
    { campo: "responsable", etiqueta: "Responsable", tipo: "texto" },
    { campo: "estado", etiqueta: "Estado", tipo: "estado" },
    { campo: "prioridad", etiqueta: "Prioridad", tipo: "estado" },
    { campo: "vencimiento", etiqueta: "Vencimiento", tipo: "fecha" },
    { campo: "paso", etiqueta: "Paso", tipo: "texto" },
  ],
  documentos: [
    { campo: "id", etiqueta: "ID", tipo: "texto" },
    { campo: "nombre", etiqueta: "Nombre", tipo: "texto" },
    { campo: "tipo", etiqueta: "Tipo", tipo: "texto" },
    { campo: "estado", etiqueta: "Estado", tipo: "estado" },
    { campo: "version", etiqueta: "Versión", tipo: "numero" },
    { campo: "createdAt", etiqueta: "Fecha", tipo: "fecha" },
  ],
};

// Sample data for preview
const SAMPLE_DATA: Record<EntidadReporte, Record<string, string>[]> = {
  procesos: [
    { id: "PRO-001", codigo: "CTR-2026-001", nombrePuesto: "Docente TC", unidadFacultad: "FIET", etapaActual: "Entrevista", pasoActual: "2", prioridad: "Alta", createdAt: "2026-06-15", jefeSolicitante: "Dr. Martínez" },
    { id: "PRO-002", codigo: "CTR-2026-002", nombrePuesto: "Auxiliar Administrativo", unidadFacultad: "FCEA", etapaActual: "Requisición", pasoActual: "1", prioridad: "Normal", createdAt: "2026-06-20", jefeSolicitante: "Lic. López" },
    { id: "PRO-003", codigo: "CTR-2026-003", nombrePuesto: "Técnico IT", unidadFacultad: "DTAI", etapaActual: "Contratación", pasoActual: "4", prioridad: "Alta", createdAt: "2026-07-01", jefeSolicitante: "Ing. Pérez" },
  ],
  candidatos: [
    { id: "CND-001", nombre: "Ana García", email: "ana@example.com", telefono: "7777-1111", puesto: "Docente TC", estado: "Activo", puntuacionTotal: "87", createdAt: "2026-06-16" },
    { id: "CND-002", nombre: "Carlos Rivas", email: "carlos@example.com", telefono: "7777-2222", puesto: "Auxiliar", estado: "En proceso", puntuacionTotal: "72", createdAt: "2026-06-21" },
    { id: "CND-003", nombre: "María Flores", email: "maria@example.com", telefono: "7777-3333", puesto: "Técnico IT", estado: "Finalista", puntuacionTotal: "91", createdAt: "2026-07-02" },
  ],
  formularios: [
    { id: "FRM-001", nombre: "Requisición de Personal", procesoId: "PRO-001", version: "2", status: "Publicado", createdAt: "2026-05-10" },
    { id: "FRM-002", nombre: "Evaluación de Candidato", procesoId: "PRO-001", version: "1", status: "Borrador", createdAt: "2026-06-01" },
    { id: "FRM-003", nombre: "Contrato de Trabajo", procesoId: "PRO-002", version: "3", status: "Publicado", createdAt: "2026-06-15" },
  ],
  indicadores: [
    { id: "KPI-001", nombre: "Tiempo promedio de contratación", tipoKPI: "tiempo", valorObjetivo: "45", unidad: "días", frecuenciaCalculo: "Mensual" },
    { id: "KPI-002", nombre: "Tasa de retención", tipoKPI: "porcentaje", valorObjetivo: "90", unidad: "%", frecuenciaCalculo: "Trimestral" },
    { id: "KPI-003", nombre: "Costo por contratación", tipoKPI: "moneda", valorObjetivo: "500", unidad: "USD", frecuenciaCalculo: "Mensual" },
  ],
  usuarios: [
    { id: "USR-001", nombre: "Roberto Ramírez", email: "rramirez@upes.edu.sv", rol: "Administrador", activo: "Sí", createdAt: "2025-01-15" },
    { id: "USR-002", nombre: "Elena Morales", email: "emorales@upes.edu.sv", rol: "RRHH", activo: "Sí", createdAt: "2025-03-20" },
    { id: "USR-003", nombre: "Jorge Velásquez", email: "jvelasquez@upes.edu.sv", rol: "Jefe de área", activo: "No", createdAt: "2024-11-10" },
  ],
  tareas: [
    { id: "TSK-001", titulo: "Revisar expediente", responsable: "Ana García", estado: "Pendiente", prioridad: "Alta", vencimiento: "2026-07-20", paso: "2" },
    { id: "TSK-002", titulo: "Agendar entrevista", responsable: "Carlos Rivas", estado: "En progreso", prioridad: "Normal", vencimiento: "2026-07-18", paso: "3" },
    { id: "TSK-003", titulo: "Enviar contrato", responsable: "Elena Morales", estado: "Completada", prioridad: "Alta", vencimiento: "2026-07-15", paso: "5" },
  ],
  documentos: [
    { id: "DOC-001", nombre: "Contrato PRO-001", tipo: "Contrato", estado: "Firmado", version: "1", createdAt: "2026-07-10" },
    { id: "DOC-002", nombre: "CV Ana García", tipo: "Hoja de vida", estado: "Revisado", version: "1", createdAt: "2026-06-17" },
    { id: "DOC-003", nombre: "Acta de reunión", tipo: "Acta", estado: "Borrador", version: "2", createdAt: "2026-07-05" },
  ],
};

const GRAFICO_LABELS: Record<TipoGraficoReporte, string> = {
  barra: "Barra",
  linea: "Línea",
  pastel: "Pastel",
  tabla: "Tabla",
  ninguno: "Ninguno",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `rpt-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyReport(wsId: string): ReportConfig {
  return {
    id: uid(),
    wsId,
    nombre: "Nuevo reporte",
    version: 1,
    status: "draft",
    tipo: "report",
    entidad: "procesos",
    columnas: [],
    filtros: [],
    tipoGrafico: "tabla",
    ordenDireccion: "asc",
    exportarPDF: false,
    exportarExcel: false,
    creadoPor: "usuario",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── SVG Bar Chart Preview ─────────────────────────────────────────────────────

function BarChartPreview({
  tipo,
  columnas,
  entidad,
}: {
  tipo: TipoGraficoReporte;
  columnas: ColumnaReporte[];
  entidad: EntidadReporte;
}) {
  const sample = SAMPLE_DATA[entidad];
  const numCols = columnas.filter((c) => c.visible && c.tipo === "numero");
  const xCol = columnas.find((c) => c.visible && c.tipo === "texto");

  const w = 480;
  const h = 160;
  const pad = { top: 16, right: 20, bottom: 32, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  // Fake values for chart
  const fakeValues = [65, 82, 47];
  const labels = sample.map((row) => (xCol ? row[xCol.campo]?.slice(0, 12) ?? "—" : `Ítem ${sample.indexOf(row) + 1}`));
  const maxVal = Math.max(...fakeValues, 1);

  const barW = chartW / fakeValues.length;
  const barPad = barW * 0.25;

  if (tipo === "pastel") {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 20;
    const total = fakeValues.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;
    const COLORS = ["#2E6BE6", "#12A150", "#E5A100"];

    const slices = fakeValues.map((v, i) => {
      const angle = (v / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const endAngle = startAngle + angle;
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const large = angle > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
      startAngle = endAngle;
      return { d, color: COLORS[i], label: labels[i] ?? `Ítem ${i + 1}` };
    });

    return (
      <svg width={w} height={h} style={{ maxWidth: "100%" }}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} opacity={0.85} />
        ))}
      </svg>
    );
  }

  if (tipo === "linea") {
    const points = fakeValues.map((v, i) => {
      const x = pad.left + i * barW + barW / 2;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      return `${x},${y}`;
    });
    const COLORS = ["#2E6BE6", "#12A150", "#E5A100"];

    return (
      <svg width={w} height={h} style={{ maxWidth: "100%" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.top + chartH * (1 - t);
          return (
            <line
              key={t}
              x1={pad.left}
              y1={y}
              x2={pad.left + chartW}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          );
        })}

        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#2E6BE6"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {fakeValues.map((v, i) => {
          const x = pad.left + i * barW + barW / 2;
          const y = pad.top + chartH - (v / maxVal) * chartH;
          return <circle key={i} cx={x} cy={y} r={4} fill="#2E6BE6" />;
        })}

        {/* X labels */}
        {labels.map((lbl, i) => (
          <text
            key={i}
            x={pad.left + i * barW + barW / 2}
            y={h - 8}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize={9}
          >
            {lbl}
          </text>
        ))}
      </svg>
    );
  }

  // Default: barra
  return (
    <svg width={w} height={h} style={{ maxWidth: "100%" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.top + chartH * (1 - t);
        return (
          <line
            key={t}
            x1={pad.left}
            y1={y}
            x2={pad.left + chartW}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        );
      })}

      {/* Y axis label */}
      <text x={6} y={pad.top + chartH / 2} fill="rgba(255,255,255,0.3)" fontSize={9} textAnchor="middle">
        {maxVal}
      </text>
      <text x={6} y={pad.top + chartH} fill="rgba(255,255,255,0.3)" fontSize={9} textAnchor="middle">
        0
      </text>

      {fakeValues.map((v, i) => {
        const barHeight = (v / maxVal) * chartH;
        const x = pad.left + i * barW + barPad;
        const y = pad.top + chartH - barHeight;
        const bw = barW - barPad * 2;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={barHeight} fill="#2E6BE6" rx={3} opacity={0.8} />
            <text
              x={x + bw / 2}
              y={y - 4}
              textAnchor="middle"
              fill="rgba(255,255,255,0.6)"
              fontSize={9}
            >
              {v}
            </text>
            <text
              x={x + bw / 2}
              y={h - 8}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize={9}
            >
              {labels[i] ?? `Ítem ${i + 1}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Preview Table ─────────────────────────────────────────────────────────────

function PreviewTable({ config }: { config: ReportConfig }) {
  const visibleCols = config.columnas.filter((c) => c.visible).sort((a, b) => a.orden - b.orden);
  const sample = SAMPLE_DATA[config.entidad].slice(0, 3);

  const typeColor = (tipo: ColumnaReporte["tipo"]) => {
    if (tipo === "estado") return "#E5A100";
    if (tipo === "fecha") return "#5B4FD0";
    if (tipo === "numero") return "#12A150";
    return "rgba(255,255,255,0.6)";
  };

  if (visibleCols.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
        Selecciona columnas para previsualizar
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {visibleCols.map((col) => (
              <th
                key={col.campo}
                style={{
                  textAlign: "left",
                  padding: "7px 10px",
                  color: typeColor(col.tipo),
                  fontWeight: 600,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                }}
              >
                {col.etiqueta}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sample.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.025)" }}>
              {visibleCols.map((col) => (
                <td
                  key={col.campo}
                  style={{
                    padding: "7px 10px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.75)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.tipo === "estado" ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#E5A100",
                        background: "#E5A10020",
                        padding: "2px 7px",
                        borderRadius: 4,
                      }}
                    >
                      {row[col.campo] ?? "—"}
                    </span>
                  ) : col.tipo === "fecha" ? (
                    <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
                      {row[col.campo] ?? "—"}
                    </span>
                  ) : (
                    row[col.campo] ?? "—"
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: "8px 10px", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
        Vista previa — 3 de N registros simulados
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ReportBuilder({ wsId }: { wsId: string }) {
  const { data: items = [], isLoading } = useBuilderList<ReportConfig>(wsId, "report");
  const save = useBuilderSave<ReportConfig>(wsId, "report");
  const publish = useBuilderPublish(wsId, "report");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReportConfig | null>(null);

  function handleSelect(id: string | null) {
    setSelectedId(id);
    const found = items.find((i) => i.id === id) ?? null;
    setDraft(found ? { ...found } : null);
  }

  function handleNew() {
    const r = emptyReport(wsId);
    setDraft(r);
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

  function setEntity(entidad: EntidadReporte) {
    if (!draft) return;
    setDraft({ ...draft, entidad, columnas: [], agruparPor: undefined, campoGraficoX: undefined, campoGraficoY: undefined });
  }

  function toggleColumna(campo: string) {
    if (!draft) return;
    const fields = ENTITY_FIELDS[draft.entidad];
    const field = fields.find((f) => f.campo === campo)!;
    const existing = draft.columnas.find((c) => c.campo === campo);
    if (existing) {
      setDraft({ ...draft, columnas: draft.columnas.filter((c) => c.campo !== campo) });
    } else {
      const col: ColumnaReporte = {
        campo,
        etiqueta: field.etiqueta,
        tipo: field.tipo,
        visible: true,
        orden: draft.columnas.length + 1,
      };
      setDraft({ ...draft, columnas: [...draft.columnas, col] });
    }
  }

  function addFiltro() {
    if (!draft) return;
    const f: FiltroReporte = {
      id: uid(),
      campo: "",
      operador: "igual",
      valor: "",
      conector: "y",
    };
    setDraft({ ...draft, filtros: [...draft.filtros, f] });
  }

  function updateFiltro(id: string, patch: Partial<FiltroReporte>) {
    if (!draft) return;
    setDraft({
      ...draft,
      filtros: draft.filtros.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }

  function deleteFiltro(id: string) {
    if (!draft) return;
    setDraft({ ...draft, filtros: draft.filtros.filter((f) => f.id !== id) });
  }

  const showChart = draft && draft.tipoGrafico !== "ninguno" && draft.tipoGrafico !== "tabla";
  const entityFields = draft ? ENTITY_FIELDS[draft.entidad] : [];
  const selectedCampos = draft ? draft.columnas.map((c) => c.campo) : [];

  const sectionLabel = (n: string) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "rgba(255,255,255,0.4)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {n}
    </div>
  );

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
          Selecciona un reporte o crea uno nuevo
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
          {/* Name header */}
          <div
            style={{
              padding: "14px 20px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <input
              style={{
                ...inputStyle,
                fontSize: 15,
                fontWeight: 700,
                background: "transparent",
                border: "none",
                padding: 0,
                flex: 1,
              }}
              value={draft.nombre}
              onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
              placeholder="Nombre del reporte"
            />
            <StatusBadge status={draft.status} />
          </div>

          {/* Scroll area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

            {/* ── 1. Entidad */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {sectionLabel("1. Entidad")}
              <div style={{ maxWidth: 260 }}>
                <select
                  style={inputStyle}
                  value={draft.entidad}
                  onChange={(e) => setEntity(e.target.value as EntidadReporte)}
                >
                  {(Object.keys(ENTITY_LABELS) as EntidadReporte[]).map((e) => (
                    <option key={e} value={e}>{ENTITY_LABELS[e]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── 2. Columnas */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {sectionLabel("2. Columnas")}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {entityFields.map((f) => {
                  const checked = selectedCampos.includes(f.campo);
                  return (
                    <label
                      key={f.campo}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "5px 10px",
                        borderRadius: 6,
                        background: checked ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${checked ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`,
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: 12,
                        color: checked ? "#fbbf24" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleColumna(f.campo)}
                        style={{ display: "none" }}
                      />
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          border: `1.5px solid ${checked ? "#f59e0b" : "rgba(255,255,255,0.3)"}`,
                          background: checked ? "#f59e0b" : "transparent",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {checked && (
                          <svg width={8} height={8} viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        )}
                      </div>
                      {f.etiqueta}
                    </label>
                  );
                })}
              </div>
              {selectedCampos.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  {selectedCampos.length} columna(s) seleccionada(s)
                </div>
              )}
            </div>

            {/* ── 3. Filtros */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {sectionLabel("3. Filtros")}
              {draft.filtros.length > 0 && (
                <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {draft.filtros.map((f, i) => (
                    <div key={f.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {i > 0 && (
                        <select
                          style={{ ...inputStyle, width: 56, flexShrink: 0 }}
                          value={f.conector}
                          onChange={(e) => updateFiltro(f.id, { conector: e.target.value as "y" | "o" })}
                        >
                          <option value="y">Y</option>
                          <option value="o">O</option>
                        </select>
                      )}
                      {i === 0 && <div style={{ width: 56, flexShrink: 0 }} />}

                      <select
                        style={{ ...inputStyle, flex: 1 }}
                        value={f.campo}
                        onChange={(e) => updateFiltro(f.id, { campo: e.target.value })}
                      >
                        <option value="">Campo…</option>
                        {entityFields.map((ef) => (
                          <option key={ef.campo} value={ef.campo}>{ef.etiqueta}</option>
                        ))}
                      </select>

                      <select
                        style={{ ...inputStyle, width: 110, flexShrink: 0 }}
                        value={f.operador}
                        onChange={(e) =>
                          updateFiltro(f.id, { operador: e.target.value as FiltroReporte["operador"] })
                        }
                      >
                        <option value="igual">Igual a</option>
                        <option value="contiene">Contiene</option>
                        <option value="mayor">Mayor que</option>
                        <option value="menor">Menor que</option>
                        <option value="entre">Entre</option>
                        <option value="en_lista">En lista</option>
                      </select>

                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Valor…"
                        value={f.valor}
                        onChange={(e) => updateFiltro(f.id, { valor: e.target.value })}
                      />

                      <button
                        onClick={() => deleteFiltro(f.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(255,255,255,0.3)",
                          cursor: "pointer",
                          fontSize: 16,
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={addFiltro}
                style={{
                  padding: "5px 14px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px dashed rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                + Agregar filtro
              </button>
            </div>

            {/* ── 4. Agrupación */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {sectionLabel("4. Agrupación")}
              <div style={{ maxWidth: 260 }}>
                <select
                  style={inputStyle}
                  value={draft.agruparPor ?? ""}
                  onChange={(e) => setDraft({ ...draft, agruparPor: e.target.value || undefined })}
                >
                  <option value="">Sin agrupación</option>
                  {entityFields.map((f) => (
                    <option key={f.campo} value={f.campo}>{f.etiqueta}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── 5. Visualización */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {sectionLabel("5. Visualización")}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {(["tabla", "barra", "linea", "pastel", "ninguno"] as TipoGraficoReporte[]).map((t) => (
                  <label
                    key={t}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 12px",
                      borderRadius: 6,
                      background: draft.tipoGrafico === t ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${draft.tipoGrafico === t ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.08)"}`,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="radio"
                      name="tipoGrafico"
                      value={t}
                      checked={draft.tipoGrafico === t}
                      onChange={() => setDraft({ ...draft, tipoGrafico: t })}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        border: `2px solid ${draft.tipoGrafico === t ? "#f59e0b" : "rgba(255,255,255,0.3)"}`,
                        background: draft.tipoGrafico === t ? "#f59e0b" : "transparent",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: draft.tipoGrafico === t ? "#fbbf24" : "rgba(255,255,255,0.55)",
                      }}
                    >
                      {GRAFICO_LABELS[t]}
                    </span>
                  </label>
                ))}
              </div>

              {showChart && (
                <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                      Eje X
                    </label>
                    <select
                      style={inputStyle}
                      value={draft.campoGraficoX ?? ""}
                      onChange={(e) => setDraft({ ...draft, campoGraficoX: e.target.value || undefined })}
                    >
                      <option value="">Seleccionar campo…</option>
                      {entityFields.map((f) => (
                        <option key={f.campo} value={f.campo}>{f.etiqueta}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                      Eje Y (valor)
                    </label>
                    <select
                      style={inputStyle}
                      value={draft.campoGraficoY ?? ""}
                      onChange={(e) => setDraft({ ...draft, campoGraficoY: e.target.value || undefined })}
                    >
                      <option value="">Seleccionar campo…</option>
                      {entityFields
                        .filter((f) => f.tipo === "numero")
                        .map((f) => (
                          <option key={f.campo} value={f.campo}>{f.etiqueta}</option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* ── 6. Ordenar */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {sectionLabel("6. Ordenar")}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                    Campo
                  </label>
                  <select
                    style={inputStyle}
                    value={draft.ordenarPor ?? ""}
                    onChange={(e) => setDraft({ ...draft, ordenarPor: e.target.value || undefined })}
                  >
                    <option value="">Sin ordenamiento</option>
                    {entityFields.map((f) => (
                      <option key={f.campo} value={f.campo}>{f.etiqueta}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["asc", "desc"] as const).map((d) => (
                    <label
                      key={d}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 12px",
                        borderRadius: 6,
                        background: draft.ordenDireccion === d ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${draft.ordenDireccion === d ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`,
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: 12,
                        color: draft.ordenDireccion === d ? "#fbbf24" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      <input
                        type="radio"
                        name="ordenDir"
                        value={d}
                        checked={draft.ordenDireccion === d}
                        onChange={() => setDraft({ ...draft, ordenDireccion: d })}
                        style={{ display: "none" }}
                      />
                      {d === "asc" ? "↑ Ascendente" : "↓ Descendente"}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 7. Exportar */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 20,
              }}
            >
              {sectionLabel("7. Exportar")}
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { field: "exportarPDF" as const, label: "Exportar PDF", color: "#ef4444" },
                  { field: "exportarExcel" as const, label: "Exportar Excel", color: "#12A150" },
                ].map(({ field, label, color }) => (
                  <label
                    key={field}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div
                      onClick={() => setDraft({ ...draft, [field]: !draft[field] })}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: `2px solid ${draft[field] ? color : "rgba(255,255,255,0.25)"}`,
                        background: draft[field] ? color : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {draft[field] && (
                        <svg width={10} height={10} viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: draft[field] ? "white" : "rgba(255,255,255,0.5)" }}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Preview */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                  Vista previa — {ENTITY_LABELS[draft.entidad]}
                </span>
              </div>

              {showChart && (
                <div
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(0,0,0,0.15)",
                  }}
                >
                  <BarChartPreview
                    tipo={draft.tipoGrafico}
                    columnas={draft.columnas}
                    entidad={draft.entidad}
                  />
                </div>
              )}

              <div style={{ padding: "0" }}>
                <PreviewTable config={draft} />
              </div>
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
              {save.isPending ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={handlePublish}
              disabled={publish.isPending}
              style={{
                padding: "8px 20px",
                borderRadius: 7,
                background: "#f59e0b",
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
