"use client";

import { use } from "react";
import { IDEIndicatorForm } from "@/components/workspace/ide/IndicatorForm";
import { useIDEIndicator } from "@/hooks/useIDE";

function EditForm({ wsId, id }: { wsId: string; id: string }) {
  const { data: ind, isLoading } = useIDEIndicator(id);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 rounded-lg bg-sse-border" />
        <div className="h-40 rounded-lg bg-sse-border" />
        <div className="h-40 rounded-lg bg-sse-border" />
      </div>
    );
  }

  if (!ind) {
    return <p className="text-[13px] text-sse-muted">Indicador no encontrado.</p>;
  }

  return <IDEIndicatorForm wsId={wsId} initialData={ind} />;
}

export default function IDEEditarPage({ params }: { params: Promise<{ wsId: string; id: string }> }) {
  const { wsId, id } = use(params);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-sse-ink">Editar Indicador</h1>
        <p className="text-[12px] text-sse-muted mt-0.5">Modifica la definición del indicador. Cada cambio genera un nuevo snapshot de versión.</p>
      </div>
      <EditForm wsId={wsId} id={id} />
    </div>
  );
}
