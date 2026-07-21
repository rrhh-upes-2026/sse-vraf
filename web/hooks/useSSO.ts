"use client";

import { useQuery } from "@tanstack/react-query";
import { createEntityHooks } from "./useEntity";
import {
  IncidentesSSOService,
  AccidentesSSOService,
  InspeccionesSSOService,
  PeligrosSSOService,
  RiesgosSSOService,
  AccionesSSOService,
  EPPService,
  CapacitacionesSSOService,
  ComiteSSOService,
  AuditoriasSSOService,
  CumplimientoSSOService,
  getSSODashboard,
} from "@/services/sso";
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

const incidentesHooks    = createEntityHooks<SSOIncidente>("ssoIncidentes",       IncidentesSSOService);
const accidentesHooks    = createEntityHooks<SSOAccidente>("ssoAccidentes",        AccidentesSSOService);
const inspeccionesHooks  = createEntityHooks<SSOInspeccion>("ssoInspecciones",     InspeccionesSSOService);
const peligrosHooks      = createEntityHooks<SSOPeligro>("ssoPeligros",            PeligrosSSOService);
const riesgosHooks       = createEntityHooks<SSORiesgo>("ssoRiesgos",              RiesgosSSOService);
const accionesHooks      = createEntityHooks<SSOAccion>("ssoAcciones",             AccionesSSOService);
const eppHooks           = createEntityHooks<SSOEPP>("ssoEPP",                     EPPService);
const capacitacionesHooks = createEntityHooks<SSOCapacitacion>("ssoCapacitaciones", CapacitacionesSSOService);
const comiteHooks        = createEntityHooks<SSOComite>("ssoComite",               ComiteSSOService);
const auditoriasHooks    = createEntityHooks<SSOAuditoria>("ssoAuditorias",        AuditoriasSSOService);
const cumplimientoHooks  = createEntityHooks<SSOCumplimiento>("ssoCumplimiento",   CumplimientoSSOService);

export const useIncidentesSSO        = incidentesHooks.useList;
export const useIncidenteSSO         = incidentesHooks.useItem;
export const useIncidentesSSOActions = incidentesHooks.useActions;

export const useAccidentesSSO        = accidentesHooks.useList;
export const useAccidenteSSO         = accidentesHooks.useItem;
export const useAccidentesSSOActions = accidentesHooks.useActions;

export const useInspeccionesSSO        = inspeccionesHooks.useList;
export const useInspeccionSSO          = inspeccionesHooks.useItem;
export const useInspeccionesSSOActions = inspeccionesHooks.useActions;

export const usePeligrosSSO        = peligrosHooks.useList;
export const usePeligroSSO         = peligrosHooks.useItem;
export const usePeligrosSSOActions = peligrosHooks.useActions;

export const useRiesgosSSO        = riesgosHooks.useList;
export const useRiesgoSSO         = riesgosHooks.useItem;
export const useRiesgosSSOActions = riesgosHooks.useActions;

export const useAccionesSSO        = accionesHooks.useList;
export const useAccionSSO          = accionesHooks.useItem;
export const useAccionesSSOActions = accionesHooks.useActions;

export const useEPP        = eppHooks.useList;
export const useEPPItem    = eppHooks.useItem;
export const useEPPActions = eppHooks.useActions;

export const useCapacitacionesSSO        = capacitacionesHooks.useList;
export const useCapacitacionSSO          = capacitacionesHooks.useItem;
export const useCapacitacionesSSOActions = capacitacionesHooks.useActions;

export const useComiteSSO        = comiteHooks.useList;
export const useActaComite       = comiteHooks.useItem;
export const useComiteSSOActions = comiteHooks.useActions;

export const useAuditoriasSSO        = auditoriasHooks.useList;
export const useAuditoriaSSO         = auditoriasHooks.useItem;
export const useAuditoriasSSOActions = auditoriasHooks.useActions;

export const useCumplimientoSSO        = cumplimientoHooks.useList;
export const useCumplimientoSSOItem    = cumplimientoHooks.useItem;
export const useCumplimientoSSOActions = cumplimientoHooks.useActions;

export function useSSODashboard(wsId = "salud") {
  return useQuery<SSODashboardResumen>({
    queryKey: ["sso", "dashboard", wsId],
    queryFn:  () => getSSODashboard(wsId),
  });
}
