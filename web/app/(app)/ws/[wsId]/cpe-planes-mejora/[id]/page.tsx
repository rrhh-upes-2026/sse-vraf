"use client";

import { use } from "react";
import { useCPEPlanMejora } from "@/hooks/useCPE";
import { PlanMejoraForm } from "@/components/workspace/cpe/PlanMejoraForm";
import { useRouter } from "next/navigation";

export default function CPEPlanMejoraDetailPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { wsId, id } = use(params);
  const router = useRouter();
  const { data: plan, isLoading } = useCPEPlanMejora(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-[13px] text-sse-muted">
        Cargando...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="py-16 text-center text-[13px] text-sse-muted">
        Plan no encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="text-[13px] text-sse-muted hover:text-sse-ink"
        >
          ← Volver
        </button>
      </div>
      <h1 className="text-[18px] font-semibold text-sse-ink">{plan.title}</h1>
      <div className="rounded-lg border border-sse-border bg-white p-6">
        <PlanMejoraForm
          plan={plan}
          onSuccess={() => router.push(`/ws/${wsId}/cpe-planes-mejora`)}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
