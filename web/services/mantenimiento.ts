import { createEntityService } from "./entityService";
import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  MantoActivo,
  MantoUbicacion,
  MantoPlan,
  MantoSolicitud,
  MantoOrdenTrabajo,
  MantoInspeccion,
  MantoHistorial,
  MantoCosto,
  MantoInventarioTecnico,
  MantoDashboardResumen,
} from "@/types/entities";

const client = getAppsScriptClient();

export const ActivosService          = createEntityService<MantoActivo>("mantoActivos");
export const UbicacionesMantoService = createEntityService<MantoUbicacion>("mantoUbicaciones");
export const PlanesMantoService      = createEntityService<MantoPlan>("mantoPlanes");
export const SolicitudesMantoService = createEntityService<MantoSolicitud>("mantoSolicitudes");
export const OrdenesTrabajoService   = createEntityService<MantoOrdenTrabajo>("mantoOrdenesTrabajo");
export const InspeccionesService     = createEntityService<MantoInspeccion>("mantoInspecciones");
export const HistorialMantoService   = createEntityService<MantoHistorial>("mantoHistorial");
export const CostosMantoService      = createEntityService<MantoCosto>("mantoCostos");
export const InventarioTecnicoService = createEntityService<MantoInventarioTecnico>("mantoInventarioTecnico");

// ── Domain actions ────────────────────────────────────────────────────────────

export const getMantenimientoDashboard = (wsId: string) =>
  client.call<MantoDashboardResumen>("mantenimiento.getDashboardResumen", { wsId });

export const cambiarEstadoActivo = (id: string, estado: string) =>
  client.call<MantoActivo>("mantenimiento.cambiarEstadoActivo", { id, estado });

export const darBajaActivo = (id: string) =>
  client.call<MantoActivo>("mantenimiento.darBajaActivo", { id });

export const activarPlan = (id: string) =>
  client.call<MantoPlan>("mantenimiento.activarPlan", { id });

export const aprobarSolicitudManto = (id: string, aprobadoPorId: string) =>
  client.call<MantoSolicitud>("mantenimiento.aprobarSolicitud", { id, aprobadoPorId });

export const asignarTecnico = (id: string, tecnicoAsignadoId: string, tecnicoRef?: string) =>
  client.call<MantoOrdenTrabajo>("mantenimiento.asignarTecnico", { id, tecnicoAsignadoId, tecnicoRef });

export const cerrarOrden = (
  id: string,
  opts: { horasReales?: number; diagnostico?: string; solucion?: string; costoManoObra?: number; costoMateriales?: number }
) =>
  client.call<MantoOrdenTrabajo>("mantenimiento.cerrarOrden", { id, ...opts });

export const cancelarOrdenManto = (id: string) =>
  client.call<MantoOrdenTrabajo>("mantenimiento.cancelarOrden", { id });

export const cerrarInspeccion = (
  id: string,
  condicion: string,
  opts?: { hallazgos?: string; recomendaciones?: string; requiereOrden?: boolean; ordenGeneradaId?: string }
) =>
  client.call<MantoInspeccion>("mantenimiento.cerrarInspeccion", { id, condicion, ...opts });

// ── Reports ───────────────────────────────────────────────────────────────────

export const getReporteEstadoActivos = (wsId: string) =>
  client.call<{ rows: unknown[]; total: number; porEstado: Record<string, number> }>(
    "mantenimiento.reporteEstadoActivos", { wsId }
  );

export const getReporteOrdenesPeriodo = (wsId: string, desde?: string, hasta?: string) =>
  client.call<{ rows: unknown[]; total: number; costoTotal: number }>(
    "mantenimiento.reporteOrdenesPeriodo", { wsId, desde, hasta }
  );

export const getReporteCostosActivo = (wsId: string, activoId: string) =>
  client.call<{ rows: unknown[]; total: number; montoTotal: number; activoId: string }>(
    "mantenimiento.reporteCostosActivo", { wsId, activoId }
  );

export const getReporteCumplimientoPreventivo = (wsId: string) =>
  client.call<{ rows: unknown[]; total: number; planesActivos: number; cumplimientoPct: number }>(
    "mantenimiento.reporteCumplimientoPreventivo", { wsId }
  );

export const getReporteOrdenesTecnico = (wsId: string, tecnicoId: string) =>
  client.call<{ rows: unknown[]; total: number; completadas: number; horasTotal: number; tecnicoId: string }>(
    "mantenimiento.reporteOrdenesTecnico", { wsId, tecnicoId }
  );
