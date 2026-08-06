"use client";

import { useParams } from "next/navigation";
import { ReporteGenerator } from "@/components/monitoring/ReporteGenerator";
import { getUnidad } from "@/types/unidad";

function IconDocument({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

function IconInfo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
      />
    </svg>
  );
}

export default function ReportesPage() {
  const params = useParams();
  const wsId = params?.wsId as string;
  const unidad = getUnidad(wsId);
  const unidadNombre = unidad?.nombre ?? wsId?.toUpperCase() ?? "Unidad";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sse-primary/10">
          <IconDocument className="h-6 w-6 text-sse-primary" />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold text-sse-ink leading-tight">
            Reportes &mdash; {unidadNombre}
          </h1>
          <p className="mt-1 text-[13px] text-sse-muted">
            Los reportes se generan automáticamente a partir de los indicadores
            y evidencias registradas en Google Sheets. Selecciona el período y
            el formato deseado.
          </p>
        </div>
      </div>

      {/* Generator */}
      <ReporteGenerator wsId={wsId} unidadNombre={unidadNombre} />

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
        <IconInfo className="mt-0.5 h-4 w-4 flex-shrink-0 text-sse-muted" />
        <p className="text-[12px] text-sse-muted">
          Los reportes en formato{" "}
          <strong className="font-medium text-sse-ink">Google Doc</strong> se
          guardan en la carpeta de Drive de la unidad y pueden compartirse
          directamente. El formato{" "}
          <strong className="font-medium text-sse-ink">Excel</strong> es ideal
          para análisis adicional. El{" "}
          <strong className="font-medium text-sse-ink">PDF</strong> genera un
          archivo listo para distribución formal e impresión.
        </p>
      </div>
    </div>
  );
}
