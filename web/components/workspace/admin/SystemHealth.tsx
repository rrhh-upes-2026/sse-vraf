"use client";

import { useState, useEffect } from "react";
import { getAppsScriptClient } from "@/services/adapters/getAppsScriptClient";

const _isLive = !!process.env.NEXT_PUBLIC_APPS_SCRIPT_LIVE;

// ── Types ─────────────────────────────────────────────────────────────────────

interface DriveUsage {
  usedBytes: number;
  limitBytes: number;
  usedPercent: number;
  error?: string;
}

interface DbSheet {
  name: string;
  rows: number;
}

interface DatabaseStats {
  sheetCount: number;
  totalRows: number;
  sheets: DbSheet[];
}

interface AutomationHealth {
  total: number;
  failed: number;
  healthy: number;
}

interface NotificationHealth {
  pending: number;
}

interface ExecutionStats {
  total: number;
  errors: number;
}

interface HealthReport {
  timestamp: string;
  status: "healthy" | "degraded" | "critical";
  drive: DriveUsage;
  database: DatabaseStats;
  automations: AutomationHealth;
  notifications: NotificationHealth;
  executions?: ExecutionStats;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

function getMockHealth(): HealthReport {
  return {
    timestamp: new Date().toISOString(),
    status: "healthy",
    drive: { usedBytes: 1_200_000_000, limitBytes: 15_000_000_000, usedPercent: 8 },
    database: {
      sheetCount: 31,
      totalRows: 847,
      sheets: [
        { name: "WSBuilderConfigs", rows: 28 },
        { name: "historial",        rows: 312 },
        { name: "wsAutomations",    rows: 12 },
        { name: "notificaciones",   rows: 95 },
        { name: "wsKPIs",           rows: 18 },
        { name: "wsForms",          rows: 9 },
        { name: "wsBlueprints",     rows: 6 },
        { name: "wsDocuments",      rows: 44 },
        { name: "WSBuilderVersions", rows: 71 },
      ],
    },
    automations: { total: 12, failed: 0, healthy: 12 },
    notifications: { pending: 3 },
    executions: { total: 312, errors: 4 },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1_000_000) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}

function statusColor(status: HealthReport["status"]) {
  return status === "healthy" ? "#22c55e" : status === "degraded" ? "#f59e0b" : "#ef4444";
}

function statusLabel(status: HealthReport["status"]) {
  return status === "healthy" ? "Operacional" : status === "degraded" ? "Degradado" : "Crítico";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SystemHealth({ wsId }: { wsId: string }) {
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      if (_isLive) {
        const data = await getAppsScriptClient().call<HealthReport>("health.get", { wsId });
        setHealth(data);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setHealth(getMockHealth());
      }
      setLastRefresh(new Date());
    } catch {
      setHealth(getMockHealth());
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "18px 20px",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10,
  };
  const bigNumStyle: React.CSSProperties = {
    fontSize: 32, fontWeight: 800, color: "white", lineHeight: 1,
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
        Consultando infraestructura…
      </div>
    );
  }

  if (!health) return null;

  const errorRate = health.executions
    ? Math.round((health.executions.errors / Math.max(health.executions.total, 1)) * 100)
    : 0;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: statusColor(health.status),
          boxShadow: `0 0 8px ${statusColor(health.status)}`,
        }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>
            Salud del Sistema &mdash; {statusLabel(health.status)}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
            {lastRefresh ? `Actualizado ${lastRefresh.toLocaleTimeString("es-SV")}` : ""} · Workspace {wsId.toUpperCase()}
          </div>
        </div>
        <button
          onClick={fetchHealth}
          style={{
            marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6, padding: "6px 14px", cursor: "pointer",
          }}
        >
          Actualizar
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Sheets de BD",    value: health.database.sheetCount,         unit: "" },
          { label: "Filas totales",   value: health.database.totalRows,           unit: "" },
          { label: "Automatizaciones", value: `${health.automations.healthy}/${health.automations.total}`, unit: "OK" },
          { label: "Notif. pendientes", value: health.notifications.pending,       unit: "" },
        ].map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={labelStyle}>{s.label}</div>
            <div style={bigNumStyle}>{s.value}<span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>{s.unit}</span></div>
          </div>
        ))}
      </div>

      {/* Drive + Executions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {/* Drive */}
        <div style={cardStyle}>
          <div style={labelStyle}>Google Drive</div>
          {health.drive.error ? (
            <div style={{ color: "#ef4444", fontSize: 12 }}>No disponible: {health.drive.error}</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "white" }}>{formatBytes(health.drive.usedBytes)} usados</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{formatBytes(health.drive.limitBytes)} límite</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${Math.min(health.drive.usedPercent, 100)}%`,
                  background: health.drive.usedPercent > 80 ? "#ef4444" : health.drive.usedPercent > 60 ? "#f59e0b" : "#22c55e",
                  transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
                {health.drive.usedPercent}% utilizado
              </div>
            </>
          )}
        </div>

        {/* Execution stats */}
        <div style={cardStyle}>
          <div style={labelStyle}>Ejecuciones recientes</div>
          {health.executions ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Total",  value: health.executions.total,  color: "rgba(255,255,255,0.7)" },
                  { label: "Errores", value: health.executions.errors, color: health.executions.errors > 0 ? "#ef4444" : "#22c55e" },
                  { label: "Tasa error", value: `${errorRate}%`, color: errorRate > 10 ? "#ef4444" : errorRate > 5 ? "#f59e0b" : "#22c55e" },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${Math.min(errorRate, 100)}%`,
                  background: errorRate > 10 ? "#ef4444" : errorRate > 5 ? "#f59e0b" : "#22c55e",
                }} />
              </div>
            </>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Sin datos de ejecución</div>
          )}
        </div>
      </div>

      {/* Sheet breakdown */}
      <div style={cardStyle}>
        <div style={labelStyle}>Sheets de base de datos</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {health.database.sheets.map((s) => (
            <div key={s.name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 12px", borderRadius: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{s.name}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>{s.rows}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Automations */}
      {health.automations.failed > 0 && (
        <div style={{ ...cardStyle, marginTop: 14, borderColor: "#ef444430" }}>
          <div style={{ ...labelStyle, color: "#ef4444" }}>Automatizaciones con error</div>
          <div style={{ fontSize: 13, color: "#ef4444" }}>
            {health.automations.failed} automatización{health.automations.failed !== 1 ? "es" : ""} fallaron. Revisa la sección de automatizaciones para más detalles.
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
        SSE Platform · Sprint 16 Infrastructure · {_isLive ? "Producción" : "Mock — configura APPS_SCRIPT_WEB_APP_URL para conectar"}
      </div>
    </div>
  );
}
