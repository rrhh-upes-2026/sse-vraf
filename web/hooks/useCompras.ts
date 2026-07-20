"use client";

import { useQuery } from "@tanstack/react-query";
import { createEntityHooks } from "./useEntity";
import {
  SolicitudesCompraService,
  RequisicionesService,
  CotizacionesService,
  ProveedoresService,
  OrdenesCompraService,
  RecepcionesService,
  EvaluacionesProvService,
  getComprasDashboard,
} from "@/services/compras";
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

const solicitudesHooks   = createEntityHooks<ComprasSolicitud>("comprasSolicitudes",   SolicitudesCompraService);
const requisicionesHooks = createEntityHooks<ComprasRequisicion>("comprasRequisiciones", RequisicionesService);
const cotizacionesHooks  = createEntityHooks<ComprasCotizacion>("comprasCotizaciones",  CotizacionesService);
const proveedoresHooks   = createEntityHooks<ComprasProveedor>("comprasProveedores",    ProveedoresService);
const ordenesHooks       = createEntityHooks<ComprasOrden>("comprasOrdenes",            OrdenesCompraService);
const recepcionesHooks   = createEntityHooks<ComprasRecepcion>("comprasRecepciones",    RecepcionesService);
const evaluacionesHooks  = createEntityHooks<ComprasEvaluacion>("comprasEvaluaciones",  EvaluacionesProvService);

export const {
  useList: useSolicitudesCompra,
  useItem: useSolicitudCompra,
  useActions: useSolicitudesCompraActions,
} = solicitudesHooks;

export const {
  useList: useRequisiciones,
  useItem: useRequisicion,
  useActions: useRequisicionesActions,
} = requisicionesHooks;

export const {
  useList: useCotizaciones,
  useItem: useCotizacion,
  useActions: useCotizacionesActions,
} = cotizacionesHooks;

export const {
  useList: useProveedores,
  useItem: useProveedor,
  useActions: useProveedoresActions,
} = proveedoresHooks;

export const {
  useList: useOrdenesCompra,
  useItem: useOrdenCompra,
  useActions: useOrdenesCompraActions,
} = ordenesHooks;

export const {
  useList: useRecepciones,
  useItem: useRecepcion,
  useActions: useRecepcionesActions,
} = recepcionesHooks;

export const {
  useList: useEvaluacionesProv,
  useItem: useEvaluacionProv,
  useActions: useEvaluacionesProvActions,
} = evaluacionesHooks;

export function useComprasDashboard(wsId = "compras") {
  return useQuery<ComprasDashboardResumen>({
    queryKey: ["compras", "dashboard", wsId],
    queryFn: () => getComprasDashboard(wsId),
  });
}
