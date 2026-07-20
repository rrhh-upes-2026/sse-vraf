import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import { createEntityService } from "./entityService";
import type {
  ComprasSolicitud,
  ComprasRequisicion,
  ComprasCotizacion,
  ComprasProveedor,
  ComprasOrden,
  ComprasRecepcion,
  ComprasEvaluacion,
  ComprasDashboardResumen,
} from "@/types/entities";

// ── Entity services ───────────────────────────────────────────────────────────

export const SolicitudesCompraService   = createEntityService<ComprasSolicitud>("comprasSolicitudes");
export const RequisicionesService       = createEntityService<ComprasRequisicion>("comprasRequisiciones");
export const CotizacionesService        = createEntityService<ComprasCotizacion>("comprasCotizaciones");
export const ProveedoresService         = createEntityService<ComprasProveedor>("comprasProveedores");
export const OrdenesCompraService       = createEntityService<ComprasOrden>("comprasOrdenes");
export const RecepcionesService         = createEntityService<ComprasRecepcion>("comprasRecepciones");
export const EvaluacionesProvService    = createEntityService<ComprasEvaluacion>("comprasEvaluaciones");

// ── Domain actions ────────────────────────────────────────────────────────────

export async function getComprasDashboard(wsId = "compras"): Promise<ComprasDashboardResumen> {
  const client = getAppsScriptClient();
  return client.call<ComprasDashboardResumen>("compras.getDashboardResumen", { wsId });
}

export async function cambiarEstadoSolicitud(
  id: string,
  estado: ComprasSolicitud["estado"],
  etapaActual?: string,
): Promise<ComprasSolicitud> {
  const client = getAppsScriptClient();
  return client.call<ComprasSolicitud>("compras.cambiarEstadoSolicitud", { id, estado, etapaActual });
}

export async function aprobarRequisicion(
  id: string,
  aprobadoPorId: string,
): Promise<ComprasRequisicion> {
  const client = getAppsScriptClient();
  return client.call<ComprasRequisicion>("compras.aprobarRequisicion", { id, aprobadoPorId });
}

export async function seleccionarCotizacion(id: string): Promise<ComprasCotizacion> {
  const client = getAppsScriptClient();
  return client.call<ComprasCotizacion>("compras.seleccionarCotizacion", { id });
}

export async function autorizarOrden(
  id: string,
  autorizadoPorId: string,
): Promise<ComprasOrden> {
  const client = getAppsScriptClient();
  return client.call<ComprasOrden>("compras.autorizarOrden", { id, autorizadoPorId });
}

export async function cancelarOrden(id: string): Promise<ComprasOrden> {
  const client = getAppsScriptClient();
  return client.call<ComprasOrden>("compras.cancelarOrden", { id });
}

export async function getReporteComprasPeriodo(
  wsId = "compras",
  desde?: string,
  hasta?: string,
): Promise<unknown> {
  const client = getAppsScriptClient();
  return client.call("compras.reporteComprasPeriodo", { wsId, desde, hasta });
}

export async function getReporteProveedores(wsId = "compras"): Promise<unknown> {
  const client = getAppsScriptClient();
  return client.call("compras.reporteProveedores", { wsId });
}
