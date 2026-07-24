"use client";

import { useState, useRef } from "react";
import { usePrepareIDEImport, useIDEMappingTemplate } from "@/hooks/useIDE";
import type { IDEFieldMapping, IDEImportResult } from "@/types/ide";
import type { IndicatorDefinition } from "@/types/ide";

type FileFormat = "csv" | "json";

function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

function parseJSON(text: string): Array<Record<string, string>> {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row: unknown) => {
      if (typeof row !== "object" || row === null) return {};
      return Object.fromEntries(
        Object.entries(row as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")])
      );
    });
  } catch { return []; }
}

export function IDEImportPrep({ wsId }: { wsId: string }) {
  void wsId;
  const [format, setFormat] = useState<FileFormat>("csv");
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [mapping, setMapping] = useState<IDEFieldMapping[]>([]);
  const [result, setResult] = useState<IDEImportResult | null>(null);
  const [parseError, setParseError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: template } = useIDEMappingTemplate();
  const prepare = usePrepareIDEImport();

  const sourceColumns = rows.length > 0 ? Object.keys(rows[0]) : [];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParseError("");
    setResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      let parsed: Array<Record<string, string>> = [];
      if (format === "csv") parsed = parseCSV(text);
      else if (format === "json") parsed = parseJSON(text);

      if (parsed.length === 0) {
        setParseError("No se pudieron leer filas del archivo. Verifica el formato.");
        return;
      }

      setRows(parsed);
      // Auto-map columns that match field keys
      if (template) {
        const autoMap: IDEFieldMapping[] = Object.keys(parsed[0]).map((col) => {
          const match = template.fields.find(
            (f) => f.key === col || f.label.toLowerCase() === col.toLowerCase()
          );
          return { sourceColumn: col, targetField: match?.key ?? "" };
        });
        setMapping(autoMap);
      } else {
        setMapping(Object.keys(parsed[0]).map((col) => ({ sourceColumn: col, targetField: "" })));
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  function setMappingTarget(col: string, target: keyof IndicatorDefinition | "") {
    setMapping((prev) =>
      prev.map((m) => m.sourceColumn === col ? { ...m, targetField: target } : m)
    );
  }

  async function handlePrepare() {
    setResult(null);
    const res = await prepare.mutateAsync({ rows, mapping });
    setResult(res);
  }

  function handleReset() {
    setRows([]);
    setMapping([]);
    setResult(null);
    setParseError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Info banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-[12px] font-semibold text-amber-800 mb-1">Infraestructura de importación</p>
        <p className="text-[11px] text-amber-700">
          Esta herramienta valida filas de indicadores antes de importarlas. Ningún dato se guarda hasta confirmar la importación
          (funcionalidad de inserción no habilitada en esta versión). Todos los campos pasan por el IndicatorValidator.
        </p>
      </div>

      {/* Step 1: Format + File */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
        <p className="text-[11px] font-semibold text-sse-ink">1. Seleccionar formato y archivo</p>
        <div className="flex gap-3">
          {(["csv", "json"] as FileFormat[]).map((f) => (
            <button key={f} onClick={() => { setFormat(f); handleReset(); }}
              className={`text-[12px] px-4 py-1.5 rounded border font-medium ${
                format === f
                  ? "bg-amber-600 text-white border-amber-600"
                  : "border-sse-border text-sse-ink hover:bg-sse-border"
              }`}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div>
          <input ref={fileRef} type="file" accept={format === "csv" ? ".csv" : ".json"}
            onChange={handleFileChange}
            className="text-[12px] text-sse-ink file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-sse-border file:text-[11px] file:bg-sse-surface file:text-sse-ink hover:file:bg-sse-border" />
        </div>
        {parseError && <p className="text-[11px] text-red-600">{parseError}</p>}
        {rows.length > 0 && (
          <p className="text-[11px] text-green-700">
            ✓ {rows.length} fila{rows.length !== 1 ? "s" : ""} leída{rows.length !== 1 ? "s" : ""} correctamente.
          </p>
        )}
      </div>

      {/* Step 2: Column mapping */}
      {rows.length > 0 && template && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <p className="text-[11px] font-semibold text-sse-ink">2. Mapear columnas del archivo a campos del indicador</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-sse-border">
                  <th className="text-left px-2 py-1.5 text-sse-muted font-medium">Columna en archivo</th>
                  <th className="text-left px-2 py-1.5 text-sse-muted font-medium">Campo del indicador</th>
                  <th className="px-2 py-1.5 text-sse-muted font-medium text-center">Requerido</th>
                </tr>
              </thead>
              <tbody>
                {sourceColumns.map((col) => {
                  const m = mapping.find((mp) => mp.sourceColumn === col);
                  const mapped = template.fields.find((f) => f.key === m?.targetField);
                  return (
                    <tr key={col} className="border-b border-sse-border">
                      <td className="px-2 py-2 font-mono text-amber-700">{col}</td>
                      <td className="px-2 py-2">
                        <select
                          value={m?.targetField ?? ""}
                          onChange={(e) => setMappingTarget(col, e.target.value as keyof IndicatorDefinition | "")}
                          className="w-full text-[11px] border border-sse-border rounded px-2 py-1 bg-sse-bg text-sse-ink focus:outline-none focus:ring-1 focus:ring-amber-500">
                          <option value="">— Ignorar esta columna —</option>
                          {template.fields.map((f) => (
                            <option key={f.key} value={f.key}>
                              {f.label} ({String(f.key)})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2 text-center">
                        {mapped?.required ? <span className="text-red-500 font-semibold">✓</span> : <span className="text-sse-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Required fields coverage */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {template.fields.filter((f) => f.required).map((f) => {
              const covered = mapping.some((m) => m.targetField === f.key);
              return (
                <span key={String(f.key)} className={`text-[10px] rounded-full px-2 py-0.5 border font-medium ${
                  covered ? "bg-green-100 border-green-300 text-green-700" : "bg-red-100 border-red-300 text-red-600"
                }`}>
                  {covered ? "✓" : "✗"} {f.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Preview & validate */}
      {rows.length > 0 && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <p className="text-[11px] font-semibold text-sse-ink">3. Vista previa y validación</p>

          {/* Sample rows */}
          <div className="overflow-x-auto rounded border border-sse-border">
            <table className="text-[10px] w-max min-w-full">
              <thead>
                <tr className="border-b border-sse-border bg-sse-bg">
                  {sourceColumns.map((c) => (
                    <th key={c} className="px-2 py-1.5 text-left text-sse-muted font-medium whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-sse-border">
                    {sourceColumns.map((c) => (
                      <td key={c} className="px-2 py-1.5 text-sse-ink whitespace-nowrap max-w-[160px] truncate">{row[c]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 5 && (
            <p className="text-[10px] text-sse-muted">Mostrando 5 de {rows.length} filas.</p>
          )}

          <button
            onClick={() => void handlePrepare()}
            disabled={prepare.isPending || mapping.every((m) => !m.targetField)}
            className="text-[12px] px-5 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 font-medium">
            {prepare.isPending ? "Validando…" : "Validar filas"}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-sse-border bg-sse-surface p-3 text-center">
              <p className="text-[22px] font-bold tabular-nums text-sse-ink">{result.total}</p>
              <p className="text-[10px] text-sse-muted">Total</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
              <p className="text-[22px] font-bold tabular-nums text-green-700">{result.valid}</p>
              <p className="text-[10px] text-green-600">Válidas</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-[22px] font-bold tabular-nums text-red-600">{result.invalid}</p>
              <p className="text-[10px] text-red-500">Con errores</p>
            </div>
          </div>

          {/* Per-row results */}
          <div className="space-y-2">
            {result.rows.map((row) => (
              <div key={row.rowIndex}
                className={`rounded-lg border px-3 py-2 ${row.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-sse-ink">Fila {row.rowIndex + 1}</span>
                  <span className={`text-[10px] font-semibold ${row.valid ? "text-green-700" : "text-red-600"}`}>
                    {row.valid ? "Válida" : "Inválida"}
                  </span>
                </div>
                {row.errors.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {row.errors.map((e, i) => (
                      <li key={i} className="text-[10px] text-red-600">• {e.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {result.valid > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-[12px] font-semibold text-amber-800 mb-1">
                {result.valid} fila{result.valid !== 1 ? "s" : ""} lista{result.valid !== 1 ? "s" : ""} para importar
              </p>
              <p className="text-[11px] text-amber-700">
                La importación masiva estará disponible en la siguiente versión del motor. Por ahora, crea los indicadores
                válidos manualmente desde "Nuevo Indicador".
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reset */}
      {rows.length > 0 && (
        <button onClick={handleReset}
          className="text-[11px] px-3 py-1.5 rounded border border-sse-border text-sse-muted hover:bg-sse-surface">
          Limpiar y comenzar de nuevo
        </button>
      )}
    </div>
  );
}
