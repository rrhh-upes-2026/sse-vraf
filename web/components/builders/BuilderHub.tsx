"use client";

import Link from "next/link";
import { BUILDER_REGISTRY } from "@/types/builders";

interface BuilderHubProps {
  wsId: string;
}

export function BuilderHub({ wsId }: BuilderHubProps) {
  return (
    <div style={{ padding: "32px 36px", maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginBottom: 8 }}>
          SPRINT 15.5 · NO-CODE BUILDER SUITE
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "0 0 8px" }}>
          Constructores Institucionales
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6, maxWidth: 600 }}>
          Cada objeto institucional — procesos, formularios, permisos, KPIs, automatizaciones —
          puede crearse y mantenerse desde el navegador sin modificar código.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {BUILDER_REGISTRY.map((builder) => (
          <Link
            key={builder.tipo}
            href={`/ws/${wsId}/admin/builders/${builder.ruta}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "20px 22px",
                cursor: "pointer",
                transition: "all 0.15s",
                height: "100%",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "rgba(255,255,255,0.07)";
                el.style.borderColor = builder.color + "40";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "rgba(255,255,255,0.04)";
                el.style.borderColor = "rgba(255,255,255,0.08)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: builder.color + "20",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <path
                    d={builder.icono}
                    stroke={builder.color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Title */}
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 6, lineHeight: 1.3 }}>
                {builder.nombre}
              </div>

              {/* Description */}
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 16 }}>
                {builder.descripcion}
              </div>

              {/* CTA */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: builder.color, fontWeight: 600 }}>
                Abrir constructor
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: 36,
          padding: "14px 18px",
          background: "rgba(46,107,230,0.08)",
          border: "1px solid rgba(46,107,230,0.2)",
          borderRadius: 10,
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "#2E6BE6" }}>Sprint 16 — </strong>
        Todos los objetos configurados aquí se sincronizarán con el backend de Google Apps Script.
        El mock adapter se reemplazará con el adaptador en vivo preservando toda la configuración existente.
      </div>
    </div>
  );
}
