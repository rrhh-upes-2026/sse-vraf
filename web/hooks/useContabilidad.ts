"use client";

import { useQuery } from "@tanstack/react-query";
import { createEntityHooks } from "./useEntity";
import {
  CompromisosService,
  RegistrosService,
  FacturasService,
  PagosService,
  ConciliacionesService,
  CuentasPagarService,
  CuentasCobrarService,
  getContabilidadDashboard,
} from "@/services/contabilidad";
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

const compromisosHooks    = createEntityHooks<ContaCompromiso>("contaCompromisos",    CompromisosService);
const registrosHooks      = createEntityHooks<ContaRegistro>("contaRegistros",        RegistrosService);
const facturasHooks       = createEntityHooks<ContaFactura>("contaFacturas",          FacturasService);
const pagosHooks          = createEntityHooks<ContaPago>("contaPagos",                PagosService);
const conciliacionesHooks = createEntityHooks<ContaConciliacion>("contaConciliaciones", ConciliacionesService);
const cuentasPagarHooks   = createEntityHooks<ContaCuentaPagar>("contaCuentasPagar",  CuentasPagarService);
const cuentasCobrarHooks  = createEntityHooks<ContaCuentaCobrar>("contaCuentasCobrar", CuentasCobrarService);

export const {
  useList: useCompromisos,
  useItem: useCompromiso,
  useActions: useCompromisosActions,
} = compromisosHooks;

export const {
  useList: useRegistros,
  useItem: useRegistro,
  useActions: useRegistrosActions,
} = registrosHooks;

export const {
  useList: useFacturas,
  useItem: useFactura,
  useActions: useFacturasActions,
} = facturasHooks;

export const {
  useList: usePagos,
  useItem: usePago,
  useActions: usePagosActions,
} = pagosHooks;

export const {
  useList: useConciliaciones,
  useItem: useConciliacion,
  useActions: useConciliacionesActions,
} = conciliacionesHooks;

export const {
  useList: useCuentasPagar,
  useItem: useCuentaPagar,
  useActions: useCuentasPagarActions,
} = cuentasPagarHooks;

export const {
  useList: useCuentasCobrar,
  useItem: useCuentaCobrar,
  useActions: useCuentasCobrarActions,
} = cuentasCobrarHooks;

export function useContabilidadDashboard(wsId = "contabilidad") {
  return useQuery<ContaDashboardResumen>({
    queryKey: ["contabilidad", "dashboard", wsId],
    queryFn: () => getContabilidadDashboard(wsId),
  });
}
