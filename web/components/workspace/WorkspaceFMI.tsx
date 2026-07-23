"use client";

import { useFMIObjectives } from "@/hooks/useFMI";
import { useFMIDimensions } from "@/hooks/useFMI";
import { useFMIUnitMeasures } from "@/hooks/useFMI";
import { useFMIFrequencies } from "@/hooks/useFMI";
import { useFMIFormulas } from "@/hooks/useFMI";
import { useFMIRangeConfigs } from "@/hooks/useFMI";

const PILLARS = [
  {
    key: "objetivos",
    title: "Objetivos Institucionales",
    description: "Define el «para qué» de cada indicador. Cada objetivo agrupa indicadores estratégicos y permite medir el cumplimiento de la misión institucional.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    href: "fmi-objetivos",
  },
  {
    key: "dimensiones",
    title: "Dimensiones",
    description: "Clasifican los indicadores en ejes de análisis (eficiencia, calidad, cobertura, etc.). Permiten vistas transversales del desempeño institucional.",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    href: "fmi-dimensiones",
  },
  {
    key: "unidades",
    title: "Unidades de Medida",
    description: "30 unidades compatibles con gestión universitaria: porcentajes, ratios, monedas, escalas y más. Garantizan comparabilidad entre indicadores.",
    icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
    href: "fmi-unidades",
  },
  {
    key: "frecuencias",
    title: "Frecuencias",
    description: "Define el ciclo de medición: mensual, trimestral, semestral, anual o eventual. Cada frecuencia incluye su período en días.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    href: "fmi-frecuencias",
  },
  {
    key: "formulas",
    title: "Motor de Fórmulas",
    description: "Expresiones ejecutables con variables declaradas. El sistema calcula automáticamente el resultado — el usuario solo captura las variables.",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    href: "fmi-formulas",
  },
  {
    key: "rangos",
    title: "Motor de Rangos",
    description: "Define umbrales para Excelente, Bueno, Aceptable y Crítico. Los rangos son editables y la polaridad determina la dirección del cálculo.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    href: "fmi-rangos",
  },
];

function CatalogCount({ label, count, loading }: { label: string; count: number; loading: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-sse-border last:border-0">
      <span className="text-[12px] text-sse-ink">{label}</span>
      {loading
        ? <div className="w-8 h-4 rounded bg-sse-border animate-pulse" />
        : <span className="text-[12px] font-semibold text-teal-700 tabular-nums">{count}</span>
      }
    </div>
  );
}

export function WorkspaceFMI({ wsId }: { wsId: string }) {
  void wsId;
  const { data: objectives,   isLoading: lo } = useFMIObjectives();
  const { data: dimensions,   isLoading: ld } = useFMIDimensions();
  const { data: unitMeasures, isLoading: lu } = useFMIUnitMeasures();
  const { data: frequencies,  isLoading: lf } = useFMIFrequencies();
  const { data: formulas,     isLoading: lfo} = useFMIFormulas();
  const { data: rangeConfigs, isLoading: lr } = useFMIRangeConfigs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-teal-200 bg-teal-50/60 px-5 py-4">
        <p className="text-[13px] font-semibold text-teal-900 mb-1">
          Infraestructura lista — Sprint 015
        </p>
        <p className="text-[12px] text-teal-800">
          El FMI está configurado y esperando los indicadores institucionales de la Vicerrectoría Administrativa y Financiera.
          Todos los catálogos están operativos. El siguiente paso es importar los indicadores oficiales sin modificar el modelo de datos.
        </p>
      </div>

      {/* Catalog status */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4">
        <p className="text-[12px] font-semibold text-sse-ink mb-3">Estado de catálogos</p>
        <CatalogCount label="Objetivos Institucionales" count={(objectives ?? []).length}   loading={lo} />
        <CatalogCount label="Dimensiones"               count={(dimensions ?? []).length}   loading={ld} />
        <CatalogCount label="Unidades de Medida"        count={(unitMeasures ?? []).length} loading={lu} />
        <CatalogCount label="Frecuencias"               count={(frequencies ?? []).length}  loading={lf} />
        <CatalogCount label="Fórmulas"                  count={(formulas ?? []).length}     loading={lfo} />
        <CatalogCount label="Configuraciones de Rangos" count={(rangeConfigs ?? []).length} loading={lr} />
      </div>

      {/* Architecture pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PILLARS.map((p) => (
          <div key={p.key} className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.icon} />
                </svg>
              </div>
              <p className="text-[12px] font-semibold text-sse-ink">{p.title}</p>
            </div>
            <p className="text-[11px] text-sse-muted">{p.description}</p>
          </div>
        ))}
      </div>

      {/* Constraints note */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4">
        <p className="text-[12px] font-semibold text-sse-ink mb-2">Principios de diseño</p>
        <ul className="space-y-1 text-[11px] text-sse-muted">
          <li>• Responsables referenciados por ID — datos obtenidos desde ISP.</li>
          <li>• Sin duplicación de catálogos de módulos existentes.</li>
          <li>• FormulaEngine calcula automáticamente — el usuario solo captura variables.</li>
          <li>• RangeEngine aplica polaridad: Positiva (mayor = mejor) / Negativa (menor = mejor).</li>
          <li>• Evidencias se relacionarán desde EME en un sprint posterior.</li>
        </ul>
      </div>
    </div>
  );
}
