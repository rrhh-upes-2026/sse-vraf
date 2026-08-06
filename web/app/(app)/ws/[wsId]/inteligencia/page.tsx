"use client";

import { useParams } from "next/navigation";
import { InteligenciaCenter } from "@/components/monitoring/InteligenciaCenter";
import { getUnidad } from "@/types/unidad";

export default function InteligenciaPage() {
  const params = useParams();
  const wsId = params?.wsId as string;
  const unidad = getUnidad(wsId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sse-primary/10 text-2xl leading-none">
          🤖
        </div>
        <div>
          <h1 className="text-[20px] font-semibold text-sse-ink leading-tight">
            Centro de Inteligencia &mdash; {unidad?.nombre ?? wsId?.toUpperCase()}
          </h1>
          <p className="mt-1 text-[13px] text-sse-muted">
            Análisis estratégico con Gemini AI
          </p>
        </div>
      </div>

      {/* Main component */}
      <InteligenciaCenter wsId={wsId} />
    </div>
  );
}
