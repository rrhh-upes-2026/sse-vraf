"use client";

import { useState, useEffect } from "react";
import { useNCEPreference, useUpdateNCEPreference } from "@/hooks/useNCE";
import type { NCEChannel, NCETemplateType, NCEDigestFrequency } from "@/types/nce";

const ALL_CHANNELS: { key: NCEChannel; label: string; note?: string }[] = [
  { key: "interna",     label: "Interna",      note: "Siempre disponible" },
  { key: "correo",      label: "Correo",       note: "Contrato — no activo" },
  { key: "google_chat", label: "Google Chat",  note: "Contrato — no activo" },
];

const ALL_TYPES: { key: NCETemplateType; label: string }[] = [
  { key: "alerta_plan",         label: "Alerta de Plan"       },
  { key: "tarea_vencida",       label: "Tarea Vencida"        },
  { key: "nueva_recomendacion", label: "Nueva Recomendación"  },
  { key: "diagnostico_nuevo",   label: "Diagnóstico Nuevo"    },
  { key: "hito_completado",     label: "Hito Completado"      },
  { key: "regla_activada",      label: "Regla Activada"       },
  { key: "evidencia_nueva",     label: "Evidencia Nueva"      },
  { key: "resumen_diario",      label: "Resumen Diario"       },
];

export function NCEPreferences({ wsId }: { wsId: string }) {
  void wsId;
  const demoUserId = "USR-VRAF-001";
  const demoEmail  = "admin@upes.edu.sv";

  const { data: pref, isLoading } = useNCEPreference(demoUserId, demoEmail);
  const update = useUpdateNCEPreference();

  const [channels, setChannels]         = useState<NCEChannel[]>(["interna"]);
  const [types, setTypes]               = useState<NCETemplateType[]>(ALL_TYPES.map((t) => t.key));
  const [quietStart, setQuietStart]     = useState("");
  const [quietEnd, setQuietEnd]         = useState("");
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestFreq, setDigestFreq]     = useState<NCEDigestFrequency>("diario");
  const [saved, setSaved]               = useState(false);

  useEffect(() => {
    if (!pref) return;
    setChannels(pref.enabledChannels ?? ["interna"]);
    setTypes(pref.enabledTypes ?? ALL_TYPES.map((t) => t.key));
    setQuietStart(pref.quietHoursStart ?? "");
    setQuietEnd(pref.quietHoursEnd ?? "");
    setDigestEnabled(pref.digestEnabled ?? true);
    setDigestFreq(pref.digestFrequency ?? "diario");
  }, [pref]);

  function toggleChannel(ch: NCEChannel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  function toggleType(t: NCETemplateType) {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function handleSave() {
    update.mutate(
      {
        userId:          demoUserId,
        userEmail:       demoEmail,
        enabledChannels: channels,
        enabledTypes:    types,
        quietHoursStart: quietStart || undefined,
        quietHoursEnd:   quietEnd   || undefined,
        digestEnabled:   digestEnabled,
        digestFrequency: digestFreq,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-sse-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Channels */}
      <section className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
        <p className="text-[13px] font-semibold text-sse-ink">Canales habilitados</p>
        <div className="space-y-2">
          {ALL_CHANNELS.map((ch) => (
            <label key={ch.key} className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={channels.includes(ch.key)}
                onChange={() => toggleChannel(ch.key)}
                disabled={ch.key === "interna"}
                className="w-4 h-4 accent-sky-600"
              />
              <div>
                <span className="text-[12px] text-sse-ink">{ch.label}</span>
                {ch.note && <span className="ml-2 text-[10px] text-sse-muted">({ch.note})</span>}
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Notification types */}
      <section className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-sse-ink">Tipos de notificación</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTypes(ALL_TYPES.map((t) => t.key))}
              className="text-[10px] text-sky-600 hover:underline"
            >
              Todos
            </button>
            <span className="text-sse-muted text-[10px]">·</span>
            <button
              onClick={() => setTypes([])}
              className="text-[10px] text-sky-600 hover:underline"
            >
              Ninguno
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {ALL_TYPES.map((t) => (
            <label key={t.key} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={types.includes(t.key)}
                onChange={() => toggleType(t.key)}
                className="w-4 h-4 accent-sky-600"
              />
              <span className="text-[12px] text-sse-ink">{t.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Quiet hours */}
      <section className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
        <p className="text-[13px] font-semibold text-sse-ink">Horario de silencio</p>
        <p className="text-[11px] text-sse-muted">
          Las notificaciones no urgentes permanecerán en estado pendiente durante este horario.
        </p>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-[11px] text-sse-muted mb-1">Inicio</label>
            <input
              type="time"
              value={quietStart}
              onChange={(e) => setQuietStart(e.target.value)}
              className="text-[12px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink"
            />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-1">Fin</label>
            <input
              type="time"
              value={quietEnd}
              onChange={(e) => setQuietEnd(e.target.value)}
              className="text-[12px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink"
            />
          </div>
          {(quietStart || quietEnd) && (
            <button
              onClick={() => { setQuietStart(""); setQuietEnd(""); }}
              className="text-[11px] text-sse-muted hover:text-sse-ink mt-4"
            >
              Limpiar
            </button>
          )}
        </div>
      </section>

      {/* Digest */}
      <section className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
        <p className="text-[13px] font-semibold text-sse-ink">Digest periódico</p>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={digestEnabled}
            onChange={(e) => setDigestEnabled(e.target.checked)}
            className="w-4 h-4 accent-sky-600"
          />
          <span className="text-[12px] text-sse-ink">Habilitar digest</span>
        </label>
        {digestEnabled && (
          <div>
            <label className="block text-[11px] text-sse-muted mb-1">Frecuencia</label>
            <select
              value={digestFreq}
              onChange={(e) => setDigestFreq(e.target.value as NCEDigestFrequency)}
              className="text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
            </select>
          </div>
        )}
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={update.isPending}
          className="text-[13px] px-5 py-2 rounded-lg bg-[#0369A1] text-white hover:bg-sky-700 disabled:opacity-50 font-medium"
        >
          {update.isPending ? "Guardando…" : "Guardar preferencias"}
        </button>
        {saved && <span className="text-[12px] text-green-600">Guardado</span>}
      </div>
    </div>
  );
}
