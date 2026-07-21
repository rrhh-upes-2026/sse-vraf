import { createEntityService } from "./entityService";
import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  SSOIncidente,
  SSOAccidente,
  SSOInspeccion,
  SSOPeligro,
  SSORiesgo,
  SSOAccion,
  SSOEPP,
  SSOCapacitacion,
  SSOComite,
  SSOAuditoria,
  SSOCumplimiento,
  SSODashboardResumen,
} from "@/types/entities";

const client = getAppsScriptClient();

export const IncidentesSSOService    = createEntityService<SSOIncidente>("ssoIncidentes");
export const AccidentesSSOService    = createEntityService<SSOAccidente>("ssoAccidentes");
export const InspeccionesSSOService  = createEntityService<SSOInspeccion>("ssoInspecciones");
export const PeligrosSSOService      = createEntityService<SSOPeligro>("ssoPeligros");
export const RiesgosSSOService       = createEntityService<SSORiesgo>("ssoRiesgos");
export const AccionesSSOService      = createEntityService<SSOAccion>("ssoAcciones");
export const EPPService              = createEntityService<SSOEPP>("ssoEPP");
export const CapacitacionesSSOService = createEntityService<SSOCapacitacion>("ssoCapacitaciones");
export const ComiteSSOService        = createEntityService<SSOComite>("ssoComite");
export const AuditoriasSSOService    = createEntityService<SSOAuditoria>("ssoAuditorias");
export const CumplimientoSSOService  = createEntityService<SSOCumplimiento>("ssoCumplimiento");

// ── Domain actions ────────────────────────────────────────────────────────────

export const getSSODashboard = (wsId: string) =>
  client.call<SSODashboardResumen>("salud.getDashboardResumen", { wsId });

export const clasificarIncidente = (id: string, gravedad: string, causaRaiz?: string) =>
  client.call<SSOIncidente>("salud.clasificarIncidente", { id, gravedad, causaRaiz });

export const cerrarIncidenteSSO = (id: string, opts?: { causaRaiz?: string; accionesGeneradas?: string; diasPerdidos?: number }) =>
  client.call<SSOIncidente>("salud.cerrarIncidente", { id, ...opts });

export const cerrarAccidenteSSO = (id: string, opts?: { diasIncapacidad?: number; costosAtencion?: number }) =>
  client.call<SSOAccidente>("salud.cerrarAccidente", { id, ...opts });

export const cerrarInspeccionSSO = (
  id: string,
  opts?: { hallazgos?: string; observaciones?: string; numHallazgos?: number; numConformes?: number; numNoConformes?: number }
) =>
  client.call<SSOInspeccion>("salud.cerrarInspeccionSso", { id, ...opts });

export const verificarAccionSSO = (id: string, verificadoPorId: string) =>
  client.call<SSOAccion>("salud.verificarAccion", { id, verificadoPorId });

export const cerrarAccionSSO = (id: string) =>
  client.call<SSOAccion>("salud.cerrarAccionSso", { id });

export const finalizarCapacitacionSSO = (id: string, opts?: { numParticipantes?: number; numAprobados?: number }) =>
  client.call<SSOCapacitacion>("salud.finalizarCapacitacionSso", { id, ...opts });

export const cerrarAuditoriaSSO = (
  id: string,
  opts?: { hallazgos?: string; noConformidades?: string; numHallazgos?: number; numNC?: number; planAccion?: string }
) =>
  client.call<SSOAuditoria>("salud.cerrarAuditoriaSSO", { id, ...opts });

// ── Reports ───────────────────────────────────────────────────────────────────

export const getReporteIncidentesPeriodo = (wsId: string, desde?: string, hasta?: string) =>
  client.call<{ rows: unknown[]; total: number; porTipo: Record<string, number> }>(
    "salud.reporteIncidentesPeriodo", { wsId, desde, hasta }
  );

export const getReporteAccidentesArea = (wsId: string) =>
  client.call<{ rows: unknown[]; total: number; porArea: Record<string, number> }>(
    "salud.reporteAccidentesArea", { wsId }
  );

export const getReporteAccionesPendientes = (wsId: string) =>
  client.call<{ rows: unknown[]; total: number; vencidas: number }>(
    "salud.reporteAccionesPendientes", { wsId }
  );

export const getReporteIndicadoresAccidentalidad = (wsId: string) =>
  client.call<{ IF: number; IG: number; diasPerdidos: number; totalAccidentes: number }>(
    "salud.reporteIndicadoresAccidentalidad", { wsId }
  );

export const getReporteCumplimientoLegal = (wsId: string) =>
  client.call<{ rows: unknown[]; total: number; cumple: number; pct: number }>(
    "salud.reporteCumplimientoLegal", { wsId }
  );
