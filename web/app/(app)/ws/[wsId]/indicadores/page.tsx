"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMonitoreoIndicadores } from "@/hooks/useMonitoreoIndicadores";
import { useIndicadorMetaStore } from "@/store/useIndicadorMetaStore";
import { useRoleStore } from "@/store/useRoleStore";
import { getUnidad } from "@/types/unidad";
import type { IndicadorMonitoreo } from "@/services/monitoreo";

// ─── Types ────────────────────────────────────────────────────────────────────

type Semaforo = "verde" | "amarillo" | "rojo" | "gris";
type Filtro = "todos" | "verde" | "amarillo" | "rojo" | "gris";

// ─── Constants ────────────────────────────────────────────────────────────────

const SEM_COLOR: Record<Semaforo, { dot: string; badge: string; label: string }> = {
  verde:    { dot: "#16A34A", badge: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",   label: "En cumplimiento" },
  amarillo: { dot: "#D97706", badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",   label: "En riesgo" },
  rojo:     { dot: "#DC2626", badge: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",           label: "Crítico" },
  gris:     { dot: "#94A3B8", badge: "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400",      label: "Pendiente" },
};

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos",    label: "Todos" },
  { id: "verde",    label: "En cumplimiento" },
  { id: "amarillo", label: "En riesgo" },
  { id: "rojo",     label: "Crítico" },
  { id: "gris",     label: "Pendiente" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtVal(n: number | null, unidad: string): string {
  if (n === null) return "—";
  if (unidad === "$")    return `$${n.toLocaleString("es-SV")}`;
  if (unidad === "%")    return `${n.toFixed(1)}%`;
  if (unidad === "días") return `${n} días`;
  if (unidad === "h")    return `${n}h`;
  return String(n);
}

function fmtPct(n: number | null): string {
  if (n === null) return "—";
  return `${n.toFixed(1)}%`;
}

// ─── EditPanel ────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

function EditPanel({
  indicador,
  onClose,
}: {
  indicador: IndicadorMonitoreo;
  onClose: () => void;
}) {
  const { setMeta, getMeta } = useIndicadorMetaStore();
  const current = getMeta(indicador.wsId, indicador.id);

  const [descripcion, setDescripcion] = useState(
    current.descripcion ?? indicador.descripcion,
  );
  const [formula, setFormula] = useState(current.formula ?? indicador.formula ?? "");
  const [fechaEntrega, setFechaEntrega] = useState(current.fechaEntrega ?? "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function save() {
    setStatus("saving");
    setErrorMsg("");

    const fields: Array<{ campo: "descripcion" | "formula"; valor: string }> = [
      { campo: "descripcion", valor: descripcion },
      { campo: "formula",     valor: formula },
    ];

    let gasOk = true;
    for (const { campo, valor } of fields) {
      try {
        const res = await fetch("/api/google/sheets", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wsId:        indicador.wsId,
            indicadorId: indicador.id,
            campo,
            valor,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          gasOk = false;
          console.warn("[EditPanel] GAS write failed for", campo, data);
        }
      } catch (err) {
        gasOk = false;
        console.warn("[EditPanel] Network error writing", campo, err);
      }
    }

    // Always persist locally — GAS write is best-effort; fechaEntrega is local-only
    setMeta(indicador.wsId, indicador.id, { descripcion, formula, fechaEntrega: fechaEntrega || undefined });

    if (!gasOk) {
      setStatus("error");
      setErrorMsg("No se pudo escribir en Google Sheets. Los cambios se guardaron localmente.");
    } else {
      setStatus("saved");
      setTimeout(onClose, 900);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={status === "saving" ? undefined : onClose}
      />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#1A2540] rounded-xl shadow-2xl border border-[#CBD5E1] dark:border-[#2D3F5E] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-[#E2E8F0] dark:border-[#2D3F5E]">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] mb-0.5">
              Editar indicador
            </p>
            <h3 className="text-[14px] font-semibold text-[#0F172A] dark:text-white leading-snug">
              {indicador.nombre}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={status === "saving"}
            className="shrink-0 text-[#94A3B8] hover:text-[#64748B] text-lg leading-none mt-0.5 disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              Significado / Descripción
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={status === "saving"}
              placeholder="¿Qué mide este indicador y por qué es importante?"
              className="w-full rounded-lg border border-[#CBD5E1] dark:border-[#2D3F5E] bg-white dark:bg-[#0F1A2D] px-3 py-2 text-[13px] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              Fórmula de cálculo
            </label>
            <textarea
              rows={3}
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              disabled={status === "saving"}
              placeholder="Ej: (Procesos completados / Total procesos) × 100"
              className="w-full rounded-lg border border-[#CBD5E1] dark:border-[#2D3F5E] bg-white dark:bg-[#0F1A2D] px-3 py-2 text-[13px] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              Fecha de entrega propuesta
            </label>
            <input
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              disabled={status === "saving"}
              className="w-full rounded-lg border border-[#CBD5E1] dark:border-[#2D3F5E] bg-white dark:bg-[#0F1A2D] px-3 py-2 text-[13px] text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
            <p className="mt-1 text-[10px] text-[#94A3B8]">
              Aparecerá en el Calendario estratégico de esta unidad. Se guarda localmente.
            </p>
          </div>

          {status === "error" && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
              ⚠ {errorMsg}
            </p>
          )}
          {status === "saved" && (
            <p className="text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
              ✓ Guardado en Google Sheets correctamente.
            </p>
          )}

          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            Los cambios se escriben en Google Sheets. Meta y resultado siempre provienen de la hoja y no son editables aquí.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[#E2E8F0] dark:border-[#2D3F5E]">
          <button
            type="button"
            onClick={onClose}
            disabled={status === "saving"}
            className="px-4 py-2 text-[13px] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={status === "saving" || status === "saved"}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[13px] font-semibold transition-colors min-w-[100px] text-center"
          >
            {status === "saving" ? "Guardando…" : status === "saved" ? "✓ Guardado" : "Guardar en Sheets"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── IndicadorRow ─────────────────────────────────────────────────────────────

function IndicadorRow({
  ind,
  isAdmin,
  onEdit,
}: {
  ind: IndicadorMonitoreo & { _descripcion: string; _formula: string; _fechaEntrega: string };
  isAdmin: boolean;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const sem = SEM_COLOR[ind.semaforo as Semaforo] ?? SEM_COLOR.gris;

  return (
    <>
      <tr
        className="border-b border-[#E2E8F0] dark:border-[#1E2D45] hover:bg-[#F8FAFC] dark:hover:bg-[#162032] cursor-pointer transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Semáforo */}
        <td className="px-4 py-3 w-10">
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{ background: sem.dot }}
            title={sem.label}
          />
        </td>

        {/* Código */}
        <td className="px-2 py-3 w-24">
          <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            {ind.id}
          </span>
        </td>

        {/* Nombre */}
        <td className="px-2 py-3">
          <p className="text-[13px] font-semibold text-[#0F172A] dark:text-white leading-snug">
            {ind.nombre}
          </p>
          {ind._descripcion && (
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 line-clamp-1">
              {ind._descripcion}
            </p>
          )}
        </td>

        {/* Estado */}
        <td className="px-2 py-3 w-32 hidden md:table-cell">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sem.badge}`}>
            {sem.label}
          </span>
        </td>

        {/* Meta / Resultado */}
        <td className="px-2 py-3 w-32 text-right hidden sm:table-cell">
          <span className="text-[13px] font-bold tabular-nums text-[#0F172A] dark:text-white">
            {fmtVal(ind.resultado, ind.unidad)}
          </span>
          <span className="text-[11px] text-[#94A3B8] block">
            meta: {fmtVal(ind.meta || null, ind.unidad)}
          </span>
        </td>

        {/* % */}
        <td className="px-2 py-3 w-20 text-right">
          <span
            className="text-[13px] font-bold tabular-nums"
            style={{ color: sem.dot }}
          >
            {fmtPct(ind.porcentaje)}
          </span>
        </td>

        {/* Editar (admin) */}
        <td className="px-4 py-3 w-16 text-right">
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Editar
            </button>
          )}
          <span className="ml-1 text-[#CBD5E1] dark:text-[#2D3F5E] text-xs">
            {open ? "▲" : "▼"}
          </span>
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr className="bg-[#F8FAFC] dark:bg-[#0D1829]">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Descripción / Significado */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">
                  Significado
                </p>
                <p className="text-[12px] text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                  {ind._descripcion || (
                    <span className="italic text-[#CBD5E1]">Sin descripción. {
                      isAdmin ? "Haz clic en Editar para agregar." : ""
                    }</span>
                  )}
                </p>
              </div>

              {/* Fórmula */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">
                  Fórmula de cálculo
                </p>
                {ind._formula ? (
                  <code className="block text-[12px] text-[#334155] dark:text-[#CBD5E1] bg-white dark:bg-[#162032] border border-[#E2E8F0] dark:border-[#1E2D45] rounded-lg px-3 py-2 font-mono whitespace-pre-wrap">
                    {ind._formula}
                  </code>
                ) : (
                  <p className="text-[12px] italic text-[#CBD5E1]">
                    Sin fórmula definida.{isAdmin ? " Haz clic en Editar para agregar." : ""}
                  </p>
                )}
              </div>

              {/* Metadata row */}
              <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2 border-t border-[#E2E8F0] dark:border-[#1E2D45]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-0.5">Responsable</p>
                  <p className="text-[12px] text-[#334155] dark:text-[#CBD5E1]">{ind.responsable || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-0.5">Periodicidad</p>
                  <p className="text-[12px] text-[#334155] dark:text-[#CBD5E1] capitalize">{ind.periodicidad}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-0.5">Última actualización</p>
                  <p className="text-[12px] text-[#334155] dark:text-[#CBD5E1]">{ind.ultimaActualizacion}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-0.5">Unidad de medida</p>
                  <p className="text-[12px] text-[#334155] dark:text-[#CBD5E1]">{ind.unidad}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-0.5">Fecha de entrega</p>
                  <p className="text-[12px] text-[#334155] dark:text-[#CBD5E1]">
                    {ind._fechaEntrega
                      ? new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ind._fechaEntrega + "T00:00:00"))
                      : <span className="italic text-[#CBD5E1]">{isAdmin ? "Sin fecha. Haz clic en Editar para agregar." : "No definida."}</span>
                    }
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IndicadoresPage() {
  const params = useParams();
  const wsId = params?.wsId as string;

  const { data: indicadores = [], isLoading, error, refetch } = useMonitoreoIndicadores(wsId);
  const { getMeta } = useIndicadorMetaStore();
  const role = useRoleStore((s) => s.role);
  const isAdmin = role === "admin";

  const unidad = getUnidad(wsId);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [editando, setEditando] = useState<IndicadorMonitoreo | null>(null);

  // Merge Sheets data with local admin overrides
  const merged = indicadores.map((ind) => {
    const meta = getMeta(wsId, ind.id);
    return {
      ...ind,
      _descripcion: meta.descripcion ?? ind.descripcion,
      _formula: meta.formula ?? ind.formula ?? "",
      _fechaEntrega: meta.fechaEntrega ?? "",
    };
  });

  const filtrados =
    filtro === "todos" ? merged : merged.filter((i) => i.semaforo === filtro);

  // Summary counts
  const counts = {
    verde:    indicadores.filter((i) => i.semaforo === "verde").length,
    amarillo: indicadores.filter((i) => i.semaforo === "amarillo").length,
    rojo:     indicadores.filter((i) => i.semaforo === "rojo").length,
    gris:     indicadores.filter((i) => i.semaforo === "gris").length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#1E2D45] px-6 py-4">
        <div>
          <h1 className="text-[17px] font-semibold text-[#0F172A] dark:text-white">
            Indicadores — {unidad?.nombre ?? wsId?.toUpperCase()}
          </h1>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Fuente: Google Sheets · Actualización automática cada 10 min
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="shrink-0 flex items-center gap-1.5 text-[12px] text-blue-600 dark:text-blue-400 hover:underline font-medium mt-1"
        >
          ↻ Actualizar
        </button>
      </div>

      {/* ── Summary pills ────────────────────────────────────────────────────── */}
      {!isLoading && indicadores.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {(["verde", "amarillo", "rojo", "gris"] as const).map((s) => counts[s] > 0 && (
            <button
              key={s}
              type="button"
              onClick={() => setFiltro(filtro === s ? "todos" : s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                filtro === s
                  ? "border-current shadow-sm"
                  : "border-[#E2E8F0] dark:border-[#1E2D45] bg-white dark:bg-[#162032]"
              } ${SEM_COLOR[s].badge}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: SEM_COLOR[s].dot }} />
              {counts[s]} {SEM_COLOR[s].label}
            </button>
          ))}
          {filtro !== "todos" && (
            <button
              type="button"
              onClick={() => setFiltro("todos")}
              className="text-[11px] text-[#94A3B8] hover:text-[#64748B] px-2"
            >
              Ver todos
            </button>
          )}
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-[#F1F5F9] dark:bg-[#162032] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-[14px] font-semibold text-[#DC2626] mb-1">
              No fue posible obtener la información de Google Workspace.
            </p>
            <p className="text-[12px] text-[#94A3B8]">
              Verifica la conexión con Google Apps Script e intenta nuevamente.
            </p>
          </div>
        ) : filtrados.length === 0 ? (
          <p className="py-16 text-center text-[13px] text-[#94A3B8]">
            {filtro === "todos"
              ? "No hay indicadores configurados para esta unidad."
              : `No hay indicadores con estado "${SEM_COLOR[filtro as Semaforo]?.label}".`}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-[#1E2D45]">
            <table className="w-full text-left bg-white dark:bg-[#0D1829]">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#1E2D45] bg-[#F8FAFC] dark:bg-[#162032]">
                  <th className="px-4 py-2.5 w-10" />
                  <th className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] w-24">Código</th>
                  <th className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Indicador</th>
                  <th className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] w-32 hidden md:table-cell">Estado</th>
                  <th className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] w-32 text-right hidden sm:table-cell">Resultado / Meta</th>
                  <th className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] w-20 text-right">% Cump.</th>
                  <th className="px-4 py-2.5 w-16" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((ind) => (
                  <IndicadorRow
                    key={ind.id}
                    ind={ind}
                    isAdmin={isAdmin}
                    onEdit={() => setEditando(ind)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isAdmin && !isLoading && indicadores.length > 0 && (
          <p className="mt-3 text-[11px] text-[#94A3B8]">
            Rol actual: Administrador · Puedes editar la descripción y fórmula de cada indicador haciendo clic en <strong>Editar</strong>.
          </p>
        )}
      </div>

      {/* ── Edit panel ───────────────────────────────────────────────────────── */}
      {editando && (
        <EditPanel
          indicador={editando}
          onClose={() => setEditando(null)}
        />
      )}
    </div>
  );
}
