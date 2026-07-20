import { createEntityService } from "./entityService";
import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  ContaCompromiso,
  ContaRegistro,
  ContaFactura,
  ContaPago,
  ContaConciliacion,
  ContaCuentaPagar,
  ContaCuentaCobrar,
  ContaDashboardResumen,
} from "@/types/entities";

const client = getAppsScriptClient();

export const CompromisosService   = createEntityService<ContaCompromiso>("contaCompromisos");
export const RegistrosService     = createEntityService<ContaRegistro>("contaRegistros");
export const FacturasService      = createEntityService<ContaFactura>("contaFacturas");
export const PagosService         = createEntityService<ContaPago>("contaPagos");
export const ConciliacionesService= createEntityService<ContaConciliacion>("contaConciliaciones");
export const CuentasPagarService  = createEntityService<ContaCuentaPagar>("contaCuentasPagar");
export const CuentasCobrarService = createEntityService<ContaCuentaCobrar>("contaCuentasCobrar");

// ── Domain actions ────────────────────────────────────────────────────────────

export const getContabilidadDashboard = (wsId: string) =>
  client.call<ContaDashboardResumen>("contabilidad.getDashboardResumen", { wsId });

export const aprobarCompromiso = (id: string, aprobadoPorId: string) =>
  client.call<ContaCompromiso>("contabilidad.aprobarCompromiso", { id, aprobadoPorId });

export const anularCompromiso = (id: string) =>
  client.call<ContaCompromiso>("contabilidad.anularCompromiso", { id });

export const anularRegistro = (id: string) =>
  client.call<ContaRegistro>("contabilidad.anularRegistro", { id });

export const aprobarFactura = (id: string) =>
  client.call<ContaFactura>("contabilidad.aprobarFactura", { id });

export const rechazarFactura = (id: string, observaciones?: string) =>
  client.call<ContaFactura>("contabilidad.rechazarFactura", { id, observaciones });

export const aprobarPago = (id: string, aprobadoPorId: string) =>
  client.call<ContaPago>("contabilidad.aprobarPago", { id, aprobadoPorId });

export const ejecutarPago = (id: string, ejecutadoPorId: string, referenciaBancaria?: string) =>
  client.call<ContaPago>("contabilidad.ejecutarPago", { id, ejecutadoPorId, referenciaBancaria });

export const cerrarConciliacion = (id: string) =>
  client.call<ContaConciliacion>("contabilidad.cerrarConciliacion", { id });

export const saldarCuentaPagar = (id: string, montoPagado: number, fechaPago?: string) =>
  client.call<ContaCuentaPagar>("contabilidad.saldarCuentaPagar", { id, montoPagado, fechaPago });

// ── Reports ───────────────────────────────────────────────────────────────────

export const getReporteEjecucionPresupuestaria = (wsId: string) =>
  client.call<{ rows: unknown[]; total: number }>("contabilidad.reporteEjecucionPresupuestaria", { wsId });

export const getReportePagosPeriodo = (wsId: string, periodo?: string) =>
  client.call<{ pagos: unknown[]; total: number; monto: number; ejecutado: number; pendiente: number }>(
    "contabilidad.reportePagosPeriodo", { wsId, periodo }
  );

export const getReporteFacturasPendientes = (wsId: string) =>
  client.call<{ facturas: unknown[]; total: number; monto: number }>(
    "contabilidad.reporteFacturasPendientes", { wsId }
  );

export const getReporteProveedoresEjecucion = (wsId: string) =>
  client.call<{ rows: unknown[]; total: number }>("contabilidad.reporteProveedoresEjecucion", { wsId });
