"use client";

import { useQuery } from "@tanstack/react-query";
import { createEntityHooks } from "./useEntity";
import {
  ActivosService,
  UbicacionesMantoService,
  PlanesMantoService,
  SolicitudesMantoService,
  OrdenesTrabajoService,
  InspeccionesService,
  HistorialMantoService,
  CostosMantoService,
  InventarioTecnicoService,
  getMantenimientoDashboard,
} from "@/services/mantenimiento";
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

const activosHooks       = createEntityHooks<MantoActivo>("mantoActivos",              ActivosService);
const ubicacionesHooks   = createEntityHooks<MantoUbicacion>("mantoUbicaciones",       UbicacionesMantoService);
const planesHooks        = createEntityHooks<MantoPlan>("mantoPlanes",                 PlanesMantoService);
const solicitudesHooks   = createEntityHooks<MantoSolicitud>("mantoSolicitudes",       SolicitudesMantoService);
const ordenesHooks       = createEntityHooks<MantoOrdenTrabajo>("mantoOrdenesTrabajo", OrdenesTrabajoService);
const inspeccionesHooks  = createEntityHooks<MantoInspeccion>("mantoInspecciones",     InspeccionesService);
const historialHooks     = createEntityHooks<MantoHistorial>("mantoHistorial",         HistorialMantoService);
const costosHooks        = createEntityHooks<MantoCosto>("mantoCostos",                CostosMantoService);
const inventarioHooks    = createEntityHooks<MantoInventarioTecnico>("mantoInventarioTecnico", InventarioTecnicoService);

export const useActivos          = activosHooks.useList;
export const useActivo           = activosHooks.useItem;
export const useActivosActions   = activosHooks.useActions;

export const useUbicaciones      = ubicacionesHooks.useList;
export const useUbicacion        = ubicacionesHooks.useItem;
export const useUbicacionesActions = ubicacionesHooks.useActions;

export const usePlanes           = planesHooks.useList;
export const usePlan             = planesHooks.useItem;
export const usePlanesActions    = planesHooks.useActions;

export const useSolicitudesManto      = solicitudesHooks.useList;
export const useSolicitudManto        = solicitudesHooks.useItem;
export const useSolicitudesMantoActions = solicitudesHooks.useActions;

export const useOrdenesTrabajo        = ordenesHooks.useList;
export const useOrdenTrabajo          = ordenesHooks.useItem;
export const useOrdenesTrabajoActions = ordenesHooks.useActions;

export const useInspecciones      = inspeccionesHooks.useList;
export const useInspeccion        = inspeccionesHooks.useItem;
export const useInspeccionesActions = inspeccionesHooks.useActions;

export const useHistorialManto        = historialHooks.useList;
export const useHistorialMantoActions = historialHooks.useActions;

export const useCostosManto       = costosHooks.useList;
export const useCostoManto        = costosHooks.useItem;
export const useCostosMantoActions = costosHooks.useActions;

export const useInventarioTecnico        = inventarioHooks.useList;
export const useInventarioTecnicoItem    = inventarioHooks.useItem;
export const useInventarioTecnicoActions = inventarioHooks.useActions;

export function useMantenimientoDashboard(wsId = "mantenimiento") {
  return useQuery<MantoDashboardResumen>({
    queryKey: ["mantenimiento", "dashboard", wsId],
    queryFn:  () => getMantenimientoDashboard(wsId),
  });
}
