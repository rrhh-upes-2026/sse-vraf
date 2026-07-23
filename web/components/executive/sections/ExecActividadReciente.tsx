"use client";

import type { ActividadGlobal } from "@/types/executive";
import { TimelineCard } from "../widgets/TimelineCard";

interface Props { actividad: ActividadGlobal[]; }

export function ExecActividadReciente({ actividad }: Props) {
  const events = actividad.map(a => ({
    fecha:       a.fecha,
    descripcion: a.descripcion,
    tipo:        a.tipo,
    unitLabel:   a.unitLabel,
    unitKey:     a.unitKey,
  }));

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Actividad Reciente</h2>
        <p className="text-sm text-muted-foreground">Últimos {events.length} eventos institucionales</p>
      </div>
      <TimelineCard events={events} maxItems={20} />
    </section>
  );
}
